import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { QualificationBand } from "@/lib/qualification-types";
import styles from "./page.module.css";

interface HistoryRow {
  id: string;
  company_name: string;
  score: number;
  band: QualificationBand;
  created_at: string;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("lead_scores")
    .select("id, company_name, score, band, created_at")
    .order("created_at", { ascending: false })
    .returns<HistoryRow[]>();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Lead scoring history</h1>

      {error && <p className={styles.error}>Couldn&rsquo;t load history: {error.message}</p>}

      {!error && rows?.length === 0 && (
        <p className={styles.empty}>No leads qualified yet. Analyze one to see it here.</p>
      )}

      {!error && rows && rows.length > 0 && (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.id}>
              <Link className={styles.row} href={`/history/${row.id}`}>
                <span className={styles.company}>{row.company_name}</span>
                <span className={styles.date}>
                  {new Date(row.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className={styles.score}>{row.score}/100</span>
                <span className={styles.band} data-band={row.band}>
                  {row.band}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
