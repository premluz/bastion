import { z } from 'zod';
export const LinkChipsPropsSchema = z.object({
  label: z.string().min(1),
  links: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), href: z.string().min(1) })).min(1),
  active: z.string().optional(), variant: z.enum(['tabs', 'chips']).default('chips'),
});
export type LinkChipsProps = z.infer<typeof LinkChipsPropsSchema>;
