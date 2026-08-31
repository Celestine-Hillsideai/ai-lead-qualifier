import { NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk";
import { buildLeadInput } from "@/lib/buildLeadInput";
import { createClient } from "@/lib/supabase/server";
import { FREE_PLAN_DAILY_LIMIT, getTodayQualificationCount, getUserProfile } from "@/lib/subscription";
import type { ApiErrorBody, ApiResponseBody, QualificationResult } from "@/lib/qualification-types";

export const runtime = "nodejs";
export const maxDuration = 60; // matches tools/trigger.config.ts maxDuration

const POLL_INTERVAL_MS = 1000;
const OVERALL_TIMEOUT_MS = 50_000; // headroom under maxDuration for response serialization

function errorResponse(
  status: number,
  code: ApiErrorBody["error"]["code"],
  message: string
): NextResponse<ApiResponseBody> {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponseBody>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse(401, "UNAUTHENTICATED", "Sign in to qualify leads.");
  }

  const profile = await getUserProfile(supabase, user.id);
  if (profile.plan === "free") {
    const todayCount = await getTodayQualificationCount(supabase, user.id);
    if (todayCount >= FREE_PLAN_DAILY_LIMIT) {
      return errorResponse(
        402,
        "QUOTA_EXCEEDED",
        `You've used today's ${FREE_PLAN_DAILY_LIMIT} free qualifications. Upgrade to unlimited for $29/mo.`
      );
    }
  }

  const body = await request.json().catch(() => null);
  const leadFields = body?.leadFields;

  if (typeof leadFields?.companyName !== "string" || leadFields.companyName.trim() === "") {
    return errorResponse(400, "VALIDATION_ERROR", "Company name is required.");
  }

  const leadInput = buildLeadInput(leadFields);

  let handle: Awaited<ReturnType<typeof tasks.trigger>>;
  try {
    handle = await tasks.trigger("qualify-lead", leadInput);
  } catch (err) {
    console.error("[qualify-lead] trigger failed:", err);
    return errorResponse(
      500,
      "TRIGGER_UNAVAILABLE",
      "Couldn't reach trigger.dev. Check the server's TRIGGER_SECRET_KEY configuration."
    );
  }

  const timeout = new Promise<"timeout">((resolve) =>
    setTimeout(() => resolve("timeout"), OVERALL_TIMEOUT_MS)
  );

  let outcome: "timeout" | Awaited<ReturnType<typeof runs.poll>>;
  try {
    outcome = await Promise.race([
      runs.poll(handle.id, { pollIntervalMs: POLL_INTERVAL_MS }),
      timeout,
    ]);
  } catch (err) {
    console.error("[qualify-lead] poll failed:", err);
    return errorResponse(500, "TRIGGER_UNAVAILABLE", "Lost contact with trigger.dev while waiting for a result.");
  }

  if (outcome === "timeout") {
    return errorResponse(
      504,
      "TIMEOUT",
      `Still processing (run ${handle.id}). It may finish shortly — check the trigger.dev dashboard.`
    );
  }

  const run = outcome;
  if (!run.isSuccess) {
    return errorResponse(
      502,
      "TASK_FAILED",
      run.error?.message ?? "The qualification task failed."
    );
  }

  const result = run.output as QualificationResult | undefined;
  if (!result || typeof result.score !== "number" || !result.band) {
    return errorResponse(502, "BAD_OUTPUT", "Got an unexpected response from the qualification task.");
  }

  const { error: insertError } = await supabase.from("lead_scores").insert({
    user_id: user.id,
    company_name: leadFields.companyName,
    score: result.score,
    band: result.band,
    lead_fields: leadFields,
    result,
  });
  if (insertError) {
    // The qualification itself succeeded — don't fail the response over a
    // persistence hiccup the user is unrelated to and waiting on.
    console.error("[qualify-lead] history insert failed:", insertError);
  }

  return NextResponse.json({ ok: true, result });
}
