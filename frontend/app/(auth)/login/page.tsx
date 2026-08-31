import Link from "next/link";
import { signIn } from "../actions";
import styles from "../form.module.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <form className={styles.form} action={signIn}>
      <h1 className={styles.title}>Log in</h1>

      {message === "check-your-email" && (
        <p className={styles.message}>Check your email to confirm your account, then log in.</p>
      )}
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
          autoComplete="current-password"
          required
        />
      </div>

      <button className={styles.submit} type="submit">
        Log in
      </button>

      <p className={styles.switch}>
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </form>
  );
}
