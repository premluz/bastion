import { z } from 'zod';

export const ApprovalOptionSchema = z.object({
  value: z.string().min(1), label: z.string().min(1), description: z.string().optional(),
  avatar: z.boolean().optional(),
  isDisabled: z.boolean().default(false),
});
export const ApprovalCardPropsSchema = z.object({
  questionId: z.string().min(1), prompt: z.string().min(1),
  options: z.array(ApprovalOptionSchema).min(1), selected: z.string().optional(),
  questionIndex: z.number().int().nonnegative().default(0), questionCount: z.number().int().positive().default(1),
  isDisabled: z.boolean().default(false), allowSkip: z.boolean().default(true),
  navigationMode: z.enum(['default', 'continue-only', 'numbered', 'hidden']).default('default'),
  isDismissible: z.boolean().default(false), allowOther: z.boolean().default(false), otherValue: z.string().default(''),
}).refine((value) => value.questionIndex < value.questionCount, { message: 'Question index must be within the question count' });
export type ApprovalCardProps = z.infer<typeof ApprovalCardPropsSchema>;
