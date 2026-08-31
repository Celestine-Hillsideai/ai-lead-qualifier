import styles from "./Header.module.css";

export type AppStatus = "idle" | "submitting" | "success" | "error";

const STATUS_LABEL: Record<AppStatus, string> = {
  idle: "IDLE",
  submitting: "ANALYZING",
  success: "COMPLETE",
  error: "ERROR",
};

export function Header({ status }: { status: AppStatus }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <svg
          className={styles.mark}
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <line x1="12" y1="1" x2="12" y2="6" stroke="currentColor" strokeWidth="1.4" />
          <line x1="12" y1="18" x2="12" y2="23" stroke="currentColor" strokeWidth="1.4" />
          <line x1="1" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.4" />
          <line x1="18" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
        <span className={styles.title}>AI Lead Qualifier</span>
      </div>
      <div className={styles.statusGroup} data-status={status}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={styles.statusLabel}>{STATUS_LABEL[status]}</span>
      </div>
    </header>
  );
}
