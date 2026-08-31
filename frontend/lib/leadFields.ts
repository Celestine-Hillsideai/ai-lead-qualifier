/**
 * Single source of truth for the lead intake form: field ids, the labels
 * sent to the qualify-lead task (formatLead() in qualifyLead.ts renders
 * `- ${label}: ${value}` straight into the LLM prompt, so labels should read
 * naturally), input type, and whether the field is required.
 *
 * Sections group fields by what they inform in the ICP rubric
 * (workflows/lead-qualification.md) — not decorative, the grouping mirrors
 * the categories a salesperson is actually filling in signal for.
 */

export type LeadFieldType = "text" | "textarea" | "select";

export interface LeadFieldDef {
  id: string;
  label: string;
  type: LeadFieldType;
  required: boolean;
  placeholder: string;
  /** Only used when type === "select". */
  options?: string[];
}

export const BUDGET_RANGE_OPTIONS = [
  "Under $5K",
  "$5K – $25K",
  "$25K – $100K",
  "$100K – $500K",
  "$500K+",
  "Not sure / not shared",
] as const;

export interface LeadFieldSection {
  id: string;
  title: string;
  hint: string;
  fields: LeadFieldDef[];
}

export const LEAD_FIELD_SECTIONS: LeadFieldSection[] = [
  {
    id: "company",
    title: "Company",
    hint: "Industry fit & company size fit",
    fields: [
      {
        id: "companyName",
        label: "Company name",
        type: "text",
        required: true,
        placeholder: "Acme Robotics",
      },
      {
        id: "industry",
        label: "Industry",
        type: "text",
        required: false,
        placeholder: "Industrial automation",
      },
      {
        id: "companySize",
        label: "Company size",
        type: "text",
        required: false,
        placeholder: "120 employees",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    hint: "Authority",
    fields: [
      {
        id: "contactName",
        label: "Contact name",
        type: "text",
        required: false,
        placeholder: "Jane Doe",
      },
      {
        id: "contactRole",
        label: "Contact role / title",
        type: "text",
        required: false,
        placeholder: "VP Operations",
      },
    ],
  },
  {
    id: "deal",
    title: "Deal signals",
    hint: "Budget, timeline & need clarity",
    fields: [
      {
        id: "budgetRange",
        label: "Annual budget range",
        type: "select",
        required: false,
        placeholder: "Select a range",
        options: [...BUDGET_RANGE_OPTIONS],
      },
      {
        id: "timeline",
        label: "Timeline / urgency",
        type: "text",
        required: false,
        placeholder: "Wants to launch in 6 weeks",
      },
      {
        id: "needDescription",
        label: "Need / pain point",
        type: "textarea",
        required: false,
        placeholder: "Manual QA process is a bottleneck",
      },
    ],
  },
  {
    id: "context",
    title: "Source & notes",
    hint: "Extra context",
    fields: [
      {
        id: "leadSource",
        label: "Lead source",
        type: "text",
        required: false,
        placeholder: "Inbound demo request",
      },
      {
        id: "notes",
        label: "Additional notes",
        type: "textarea",
        required: false,
        placeholder: "Referred by an existing customer",
      },
    ],
  },
];

export const LEAD_FIELDS: LeadFieldDef[] = LEAD_FIELD_SECTIONS.flatMap((section) => section.fields);

export const LEAD_FIELD_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_FIELDS.map((field) => [field.id, field.label])
);

export type LeadFormValues = Record<string, string>;

export const emptyLeadFormValues = (): LeadFormValues =>
  Object.fromEntries(LEAD_FIELDS.map((field) => [field.id, ""]));
