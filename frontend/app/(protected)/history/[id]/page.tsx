import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistoryDetailView } from "@/components/HistoryDetailView";
import type { QualificationResult } from "@/lib/qualification-types";
import styles from "../page.module.css";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("lead_scores")
    .select("company_name, result")
    .eq("id", id)
    .single();

  // A row owned by another user is filtered out by RLS at the query level,
  // indistinguishable here from a nonexistent id — 404 either way, rather
  // than a 403 that would leak whether the id exists.
  if (!row) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{row.company_name}</h1>
      <HistoryDetailView result={row.result as QualificationResult} />
    </main>
  );
}
