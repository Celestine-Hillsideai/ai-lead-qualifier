import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/subscription";
import { UpgradeButton } from "@/components/UpgradeButton";
import { ManageBillingButton } from "@/components/ManageBillingButton";
import styles from "./page.module.css";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Billing</h1>

      {checkout === "success" && (
        <p className={styles.notice} data-kind="success">
          You&rsquo;re upgraded — unlimited qualifications are now active.
        </p>
      )}
      {checkout === "cancelled" && (
        <p className={styles.notice} data-kind="cancelled">
          Checkout was cancelled — you&rsquo;re still on the free plan.
        </p>
      )}

      <div className={styles.card}>
        <span className={styles.planLabel}>Current plan</span>
        <span className={styles.planName}>
          {profile.plan === "paid" ? "Unlimited — $29/mo" : "Free"}
        </span>
        <p className={styles.description}>
          {profile.plan === "paid"
            ? "Unlimited lead qualifications. Manage your payment method or cancel anytime."
            : "2 lead qualifications per day. Upgrade for unlimited qualifications at $29/month."}
        </p>
        {profile.plan === "paid" ? <ManageBillingButton /> : <UpgradeButton />}
      </div>
    </main>
  );
}
