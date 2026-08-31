import styles from "./CategoryScoreRow.module.css";

interface CategoryScoreRowProps {
  code: string;
  label: string;
  score: number;
  max: number;
  reasoning: string;
}

export function CategoryScoreRow({ code, label, score, max, reasoning }: CategoryScoreRowProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (score / max) * 100)) : 0;

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <span className={styles.code}>{code}</span>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {score}
          <span className={styles.max}>/{max}</span>
        </span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.reasoning}>{reasoning}</p>
    </div>
  );
}
