import Link from "next/link";
import { signOut } from "@/lib/supabase/actions";
import type { Plan } from "@/lib/subscription";
import styles from "./UserNav.module.css";

export function UserNav({ email, plan }: { email: string; plan: Plan }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.links}>
        <Link className={styles.link} href="/">
          Qualify a lead
        </Link>
        <Link className={styles.link} href="/history">
          History
        </Link>
        <Link className={styles.link} href="/billing">
          Billing
        </Link>
      </div>
      <div className={styles.account}>
        <span className={styles.planBadge} data-plan={plan}>
          {plan === "paid" ? "Unlimited" : "Free"}
        </span>
        <span className={styles.email}>{email}</span>
        <form action={signOut}>
          <button className={styles.signOut} type="submit">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
