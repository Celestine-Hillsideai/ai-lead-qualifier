"use client";

import { LEAD_FIELD_SECTIONS, type LeadFormValues } from "@/lib/leadFields";
import styles from "./LeadForm.module.css";

interface LeadFormProps {
  values: LeadFormValues;
  onChange: (id: string, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  companyNameMissing: boolean;
}

export function LeadForm({ values, onChange, onSubmit, submitting, companyNameMissing }: LeadFormProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className={styles.formHead}>
        <h2 className={styles.formTitle}>Lead intake</h2>
        <p className={styles.formHint}>Fill in what you know. Gaps are fine — the model scores around them.</p>
      </div>

      {LEAD_FIELD_SECTIONS.map((section) => (
        <fieldset key={section.id} className={styles.section} disabled={submitting}>
          <legend className={styles.sectionLegend}>
            <span className={styles.sectionTitle}>{section.title}</span>
            <span className={styles.sectionHint}>{section.hint}</span>
          </legend>

          <div className={styles.fieldGrid}>
            {section.fields.map((field) => {
              const invalid = field.id === "companyName" && companyNameMissing;
              return (
                <label key={field.id} className={styles.field} data-full={field.type === "textarea"}>
                  <span className={styles.fieldLabel}>
                    {field.label}
                    {field.required && <span className={styles.required}> *</span>}
                  </span>
                  {field.type === "textarea" ? (
                    <textarea
                      className={styles.textarea}
                      rows={2}
                      value={values[field.id] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className={styles.select}
                      data-empty={(values[field.id] ?? "") === ""}
                      value={values[field.id] ?? ""}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={styles.input}
                      type="text"
                      value={values[field.id] ?? ""}
                      placeholder={field.placeholder}
                      aria-invalid={invalid}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    />
                  )}
                  {invalid && <span className={styles.errorText}>Required</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? "Analyzing…" : "Analyze"}
      </button>
      {submitting && <p className={styles.submittingNote}>This can take up to 30 seconds.</p>}
    </form>
  );
}
