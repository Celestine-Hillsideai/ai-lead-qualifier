"use client";

import { useRouter } from "next/navigation";
import { ResultsDisplay } from "./ResultsDisplay";
import type { QualificationResult } from "@/lib/qualification-types";

export function HistoryDetailView({ result }: { result: QualificationResult }) {
  const router = useRouter();

  return (
    <ResultsDisplay
      result={result}
      onReset={() => router.push("/history")}
      resetLabel="Back to history"
    />
  );
}
