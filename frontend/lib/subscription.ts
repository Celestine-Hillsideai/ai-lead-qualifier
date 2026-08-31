import type { SupabaseClient } from "@supabase/supabase-js";

export type Plan = "free" | "paid";

export const FREE_PLAN_DAILY_LIMIT = 2;

export interface UserProfile {
  plan: Plan;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
}

interface ProfileRow {
  plan: Plan;
  subscription_status: string | null;
  stripe_customer_id: string | null;
}

/**
 * A user with no `profiles` row has never checked out — treated as the free
 * plan rather than requiring a row to be pre-created at signup.
 */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile> {
  const { data } = await supabase
    .from("profiles")
    .select("plan, subscription_status, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  return {
    plan: data?.plan ?? "free",
    subscriptionStatus: data?.subscription_status ?? null,
    stripeCustomerId: data?.stripe_customer_id ?? null,
  };
}

/** Counts today's (UTC-day) qualifications for the free-plan quota check. */
export async function getTodayQualificationCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const startOfUtcDay = new Date();
  startOfUtcDay.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("lead_scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcDay.toISOString());

  return count ?? 0;
}
