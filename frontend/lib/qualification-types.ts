/**
 * Mirrors the types in ../../tools/src/trigger/qualifyLead.ts. The frontend
 * and the trigger.dev project are independent npm projects (no shared
 * workspace), so this is duplicated by hand — keep it in sync if the task's
 * output shape changes.
 */

export type LeadInput = Record<string, string | number | boolean | null | undefined>;

export type QualificationBand = "Hot" | "Warm" | "Cool" | "Cold";

export interface CategoryScore {
  score: number;
  reasoning: string;
}

export interface QualificationResult {
  score: number;
  band: QualificationBand;
  categoryScores: {
    industryFit: CategoryScore;
    companySizeFit: CategoryScore;
    budgetSignal: CategoryScore;
    timelineUrgency: CategoryScore;
    authority: CategoryScore;
    needClarity: CategoryScore;
  };
  summary: string;
  recommendedAction: string;
  missingInfo: string[];
  redFlags: string[];
}

export const CATEGORY_MAX = {
  industryFit: 20,
  companySizeFit: 20,
  budgetSignal: 20,
  timelineUrgency: 15,
  authority: 15,
  needClarity: 10,
} as const satisfies Record<keyof QualificationResult["categoryScores"], number>;

export const CATEGORY_LABELS: Record<keyof QualificationResult["categoryScores"], string> = {
  industryFit: "Industry fit",
  companySizeFit: "Company size fit",
  budgetSignal: "Budget signal",
  timelineUrgency: "Timeline / urgency",
  authority: "Authority",
  needClarity: "Need clarity",
};

export const CATEGORY_CODES: Record<keyof QualificationResult["categoryScores"], string> = {
  industryFit: "IND",
  companySizeFit: "SIZE",
  budgetSignal: "BUDG",
  timelineUrgency: "TIME",
  authority: "AUTH",
  needClarity: "NEED",
};

export const BAND_THRESHOLDS: { band: QualificationBand; min: number }[] = [
  { band: "Hot", min: 80 },
  { band: "Warm", min: 60 },
  { band: "Cool", min: 40 },
  { band: "Cold", min: 0 },
];

export interface ApiErrorBody {
  ok: false;
  error: {
    code:
      | "UNAUTHENTICATED"
      | "VALIDATION_ERROR"
      | "TRIGGER_UNAVAILABLE"
      | "TASK_FAILED"
      | "TIMEOUT"
      | "BAD_OUTPUT"
      | "QUOTA_EXCEEDED";
    message: string;
  };
}

export interface ApiSuccessBody {
  ok: true;
  result: QualificationResult;
}

export type ApiResponseBody = ApiSuccessBody | ApiErrorBody;
