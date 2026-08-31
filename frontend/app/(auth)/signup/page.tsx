import Link from "next/link";
import { signUp } from "../actions";
import styles from "../form.module.css";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form className={styles.form} action={signUp}>
      <h1 className={styles.title}>Sign up</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          className={styles.input}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Password
        </label>
        <input
          className={styles.input}
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <button className={styles.submit} type="submit">
        Sign up
      </button>

      <p className={styles.switch}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
