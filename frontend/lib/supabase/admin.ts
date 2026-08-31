import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service_role key and bypasses Row Level Security
// entirely. Never import this from a Client Component or anywhere the
// browser bundle could pick it up — only from
// frontend/app/api/stripe/webhook/route.ts, which needs to write
// subscription state for a user with no session of their own (Stripe calls
// the webhook directly, not on the user's behalf).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
