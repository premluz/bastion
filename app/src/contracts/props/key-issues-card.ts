import { z } from "zod";
import { ThinkingStepSourceSchema } from "../thinking";

// Literal-prop node (node-vocabulary.md, Phase 21) — named topics, each
// with an independently-sourced bullish and bearish case read side by
// side. Facts/reasoning register (third-party framing per side), never
// Merlin's own recommendation — same boundary analyst-consensus holds
// for third-party sentiment.
const KeyIssueViewSchema = z.object({
  text: z.string().min(1),
  sources: z.array(ThinkingStepSourceSchema).min(1),
});

const KeyIssueSchema = z.object({
  topic: z.string().min(1),
  bullishView: KeyIssueViewSchema,
  bearishView: KeyIssueViewSchema,
});

export const KeyIssuesCardPropsSchema = z.object({
  title: z.string().min(1).optional(),
  issues: z.array(KeyIssueSchema),
});
export type KeyIssuesCardProps = z.infer<typeof KeyIssuesCardPropsSchema>;
