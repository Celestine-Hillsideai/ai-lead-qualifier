"use client";

import { useState } from "react";
import styles from "./UpgradeButton.module.css";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
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
        {loading ? "Redirecting…" : "Upgrade to unlimited — $29/mo"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
