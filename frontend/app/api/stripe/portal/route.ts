import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/subscription";

interface ErrorBody {
  ok: false;
  error: { code: "UNAUTHENTICATED" | "NO_BILLING_ACCOUNT" | "PORTAL_FAILED"; message: string };
}

function errorResponse(status: number, code: ErrorBody["error"]["code"], message: string) {
  return NextResponse.json<ErrorBody>({ ok: false, error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse(401, "UNAUTHENTICATED", "Sign in to manage billing.");
  }

  const profile = await getUserProfile(supabase, user.id);
  if (!profile.stripeCustomerId) {
    return errorResponse(400, "NO_BILLING_ACCOUNT", "Subscribe first to manage billing.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  try {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ ok: true, url: portalSession.url });
  } catch (err) {
    console.error("[stripe portal] session creation failed:", err);
    return errorResponse(500, "PORTAL_FAILED", "Couldn't open the billing portal. Try again shortly.");
  }
}
