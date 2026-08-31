import Link from "next/link";
import { signOut } from "@/lib/supabase/actions";
import styles from "./UserNav.module.css";

export function UserNav({ email }: { email: string }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.links}>
        <Link className={styles.link} href="/">
          Qualify a lead
        </Link>
        <Link className={styles.link} href="/history">
          History
        </Link>
      </div>
      <div className={styles.account}>
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
