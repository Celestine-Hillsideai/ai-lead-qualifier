import { CATEGORY_CODES, CATEGORY_LABELS, CATEGORY_MAX, type QualificationResult } from "@/lib/qualification-types";
import { CategoryScoreRow } from "./CategoryScoreRow";
import { ScoreGauge } from "./ScoreGauge";
import styles from "./ResultsDisplay.module.css";

const CATEGORY_ORDER = Object.keys(CATEGORY_MAX) as (keyof typeof CATEGORY_MAX)[];

export function ResultsDisplay({
  result,
  onReset,
  resetLabel = "Analyze another lead",
}: {
  result: QualificationResult;
  onReset: () => void;
  resetLabel?: string;
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.top}>
        <ScoreGauge score={result.score} band={result.band} />
        <p className={styles.summary}>{result.summary}</p>
      </div>

      <div className={styles.categories}>
        {CATEGORY_ORDER.map((key) => (
          <CategoryScoreRow
            key={key}
            code={CATEGORY_CODES[key]}
            label={CATEGORY_LABELS[key]}
            score={result.categoryScores[key].score}
            max={CATEGORY_MAX[key]}
            reasoning={result.categoryScores[key].reasoning}
          />
        ))}
      </div>

      <div className={styles.action}>
        <span className={styles.actionLabel}>Recommended action</span>
        <p className={styles.actionText}>{result.recommendedAction}</p>
      </div>

      {result.missingInfo.length > 0 && (
        <div className={styles.note} data-tone="missing">
          <span className={styles.noteLabel}>Missing info</span>
          <ul className={styles.noteList}>
            {result.missingInfo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {result.redFlags.length > 0 && (
        <div className={styles.note} data-tone="flag">
          <span className={styles.noteLabel}>Red flags</span>
          <ul className={styles.noteList}>
            {result.redFlags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <button className={styles.reset} type="button" onClick={onReset}>
        {resetLabel}
      </button>
    </div>
  );
}
