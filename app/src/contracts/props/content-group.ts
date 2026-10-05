import { z } from 'zod';
export const ContentGroupPropsSchema = z.object({
  title: z.string().optional(), href: z.string().optional(),
  layout: z.enum(['page', 'stack', 'rows', 'cards']).default('stack'),
});
export type ContentGroupProps = z.infer<typeof ContentGroupPropsSchema>;
