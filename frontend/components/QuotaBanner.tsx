import Link from "next/link";
import styles from "./QuotaBanner.module.css";

export function QuotaBanner({ message }: { message: string }) {
  return (
    <div className={styles.banner} role="alert">
      <span className={styles.label}>Daily limit reached</span>
      <p className={styles.message}>{message}</p>
      <Link className={styles.upgrade} href="/billing">
        Upgrade to unlimited
      </Link>
    </div>
  );
}
