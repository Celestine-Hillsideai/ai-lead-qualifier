import styles from "./ErrorBanner.module.css";

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.banner} role="alert">
      <span className={styles.label}>Couldn&rsquo;t complete analysis</span>
      <p className={styles.message}>{message}</p>
      <button className={styles.retry} type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
