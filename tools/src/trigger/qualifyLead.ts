import { task } from "@trigger.dev/sdk";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

/**
 * Implements workflows/lead-qualification.md. Keep the scoring categories,
 * weights, and bands here in sync with that doc if you change either.
 */

const openai = new OpenAI(); // reads OPENAI_API_KEY from env

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";

const categoryScoreSchema = z.object({
  score: z.number(),
  reasoning: z.string(),
});

const qualificationResultSchema = z.object({
  score: z.number().min(0).max(100),
  band: z.enum(["Hot", "Warm", "Cool", "Cold"]),
  categoryScores: z.object({
    industryFit: categoryScoreSchema,
    companySizeFit: categoryScoreSchema,
    budgetSignal: categoryScoreSchema,
    timelineUrgency: categoryScoreSchema,
    authority: categoryScoreSchema,
    needClarity: categoryScoreSchema,
  }),
  summary: z.string(),
  recommendedAction: z.string(),
  missingInfo: z.array(z.string()),
  redFlags: z.array(z.string()),
});

export type QualificationResult = z.infer<typeof qualificationResultSchema>;

/**
 * Whatever fields the lead form collects. Intentionally loose (not tied to a
 * fixed schema) even now that the form's field list is finalized — see
 * frontend/lib/leadFields.ts and workflows/lead-qualification.md's "Input"
 * section for the current fields.
 */
export type LeadInput = Record<string, string | number | boolean | null | undefined>;

const SYSTEM_PROMPT = `You are a B2B sales lead qualifier. Score the given lead's fit \
against our Ideal Customer Profile (ICP) using exactly these six weighted categories \
(max points in parentheses):

1. Industry / vertical fit (20) — does the lead's industry match or sit adjacent to our target verticals?
2. Company size fit (20) — does employee count / revenue fall in our target range?
3. Budget signal (20) — stated or implied budget, prior purchases of comparable tools, or company size implying ability to pay?
4. Timeline / urgency (15) — an active project, stated timeline, or clear trigger event, vs. just browsing?
5. Authority / decision-making power (15) — is the contact the decision-maker or a clear influencer?
6. Need / pain-point clarity (10) — does the lead articulate a concrete problem we solve, not just general interest?

Rules:
- If information for a category is missing, score it near the middle of its range rather than \
zero, and list the missing field(s) in "missingInfo" instead of guessing.
- Note any disqualifying or concerning signals in "redFlags" (e.g. explicitly no budget, wrong \
industry, competitor).
- "score" is the sum of the six category scores (0-100).
- "band" follows these bands: Hot 80-100, Warm 60-79, Cool 40-59, Cold 0-39.`;

function formatLead(lead: LeadInput): string {
  const entries = Object.entries(lead).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (entries.length === 0) return "(no lead information provided)";
  return entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

export const qualifyLead = task({
  id: "qualify-lead",
  run: async (payload: LeadInput): Promise<QualificationResult> => {
    const completion = await openai.chat.completions.parse({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Qualify this lead:\n\n${formatLead(payload)}` },
      ],
      response_format: zodResponseFormat(qualificationResultSchema, "lead_qualification"),
    });

    const parsed = completion.choices[0]?.message.parsed;

    if (!parsed) {
      throw new Error("OpenAI did not return a parsed qualification result");
    }

    return parsed;
  },
});
