import type { QualificationBand } from "@/lib/qualification-types";
import styles from "./ScoreGauge.module.css";

const ZONES: { band: QualificationBand; from: number; to: number }[] = [
  { band: "Hot", from: 80, to: 100 },
  { band: "Warm", from: 60, to: 80 },
  { band: "Cool", from: 40, to: 60 },
  { band: "Cold", from: 0, to: 40 },
];

const TICKS = [0, 40, 60, 80, 100];

export function ScoreGauge({ score, band }: { score: number; band: QualificationBand }) {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className={styles.wrap}>
      <div className={styles.ticks} aria-hidden="true">
        {TICKS.slice()
          .reverse()
          .map((tick) => (
            <span key={tick} className={styles.tick} style={{ bottom: `${tick}%` }}>
              {tick}
            </span>
          ))}
      </div>

      <div className={styles.tube}>
        {ZONES.map((zone) => (
          <div
            key={zone.band}
            className={styles.zone}
            data-band={zone.band}
            style={{ height: `${zone.to - zone.from}%`, bottom: `${zone.from}%` }}
          />
        ))}
        <div className={styles.mercury} data-band={band} style={{ height: `${clamped}%` }} />
        <div className={styles.pointer} style={{ bottom: `${clamped}%` }} aria-hidden="true" />
      </div>

      <div className={styles.readout}>
        <span className={styles.scoreValue}>{Math.round(clamped)}</span>
        <span className={styles.scoreMax}>/100</span>
        <span className={styles.bandPill} data-band={band}>
          {band}
        </span>
      </div>
    </div>
  );
}
