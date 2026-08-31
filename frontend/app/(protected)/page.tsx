"use client";

import { useState } from "react";
import { Header, type AppStatus } from "@/components/Header";
import { LeadForm } from "@/components/LeadForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ErrorBanner } from "@/components/ErrorBanner";
import { QuotaBanner } from "@/components/QuotaBanner";
import { emptyLeadFormValues, type LeadFormValues } from "@/lib/leadFields";
import type { ApiErrorBody, ApiResponseBody, QualificationResult } from "@/lib/qualification-types";
import styles from "./page.module.css";

export default function Home() {
  const [values, setValues] = useState<LeadFormValues>(emptyLeadFormValues);
  const [status, setStatus] = useState<AppStatus>("idle");
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<ApiErrorBody["error"]["code"] | null>(null);
  const [companyNameMissing, setCompanyNameMissing] = useState(false);

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (id === "companyName" && value.trim() !== "") {
      setCompanyNameMissing(false);
    }
  };

  const handleSubmit = async () => {
    if (values.companyName.trim() === "") {
      setCompanyNameMissing(true);
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const response = await fetch("/api/qualify-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadFields: values }),
      });
      const body: ApiResponseBody = await response.json();

      if (body.ok) {
        setResult(body.result);
        setStatus("success");
      } else {
        setErrorMessage(body.error.message);
        setErrorCode(body.error.code);
        setStatus("error");
      }
    } catch {
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setValues(emptyLeadFormValues());
    setResult(null);
    setErrorMessage(null);
    setErrorCode(null);
    setStatus("idle");
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setErrorCode(null);
    setStatus("idle");
  };

  return (
    <div className={styles.page}>
      <Header status={status} />
      <main className={styles.main}>
        {status === "success" && result && <ResultsDisplay result={result} onReset={handleReset} />}
        {status === "error" && errorCode === "QUOTA_EXCEEDED" && errorMessage && (
          <QuotaBanner message={errorMessage} />
        )}
        {status === "error" && errorCode !== "QUOTA_EXCEEDED" && errorMessage && (
          <ErrorBanner message={errorMessage} onRetry={handleRetry} />
        )}
        {(status === "idle" || status === "submitting") && (
          <LeadForm
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={status === "submitting"}
            companyNameMissing={companyNameMissing}
          />
        )}
      </main>
    </div>
  );
}
