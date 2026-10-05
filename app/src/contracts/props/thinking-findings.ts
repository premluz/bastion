import { z } from 'zod';
import { ThinkingStepSchema } from '../thinking';
export const ThinkingFindingsPropsSchema = z.object({
  label: z.string().min(1), steps: z.array(ThinkingStepSchema).min(1),
  activeIndex: z.number().int().nonnegative(), isComplete: z.boolean(),
});
export type ThinkingFindingsProps = z.infer<typeof ThinkingFindingsPropsSchema>;
