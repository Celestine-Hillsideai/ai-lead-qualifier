import { LEAD_FIELD_LABELS } from "./leadFields";
import type { LeadInput } from "./qualification-types";

/**
 * Maps { fieldId: value } form state to the LeadInput object sent to the
 * qualify-lead task, keyed by human-readable labels (those labels get
 * formatted directly into the LLM prompt, see formatLead() in
 * tools/src/trigger/qualifyLead.ts). Blank fields are dropped rather than
 * sent as empty strings, matching the backend's own filtering.
 */
export function buildLeadInput(leadFields: Record<string, unknown>): LeadInput {
  const input: LeadInput = {};

  for (const [id, label] of Object.entries(LEAD_FIELD_LABELS)) {
    const rawValue = leadFields[id];
    if (typeof rawValue !== "string") continue;
    const value = rawValue.trim();
    if (value === "") continue;
    input[label] = value;
  }

  return input;
}
