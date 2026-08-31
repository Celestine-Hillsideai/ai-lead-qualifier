"use client";

import { useState } from "react";
import styles from "./ManageBillingButton.module.css";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const body = await response.json();

      if (body.ok) {
        window.location.href = body.url;
        return;
      }

      setError(body.error.message);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }

    setLoading(false);
  };

  return (
    <div>
      <button className={styles.button} type="button" onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting…" : "Manage billing"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
