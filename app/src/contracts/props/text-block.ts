import { z } from "zod";

// Literal-prop node: short prose findings/caveats, authored per scene.
// Paragraph breaks are double newlines.
export const TextBlockPropsSchema = z.object({
  text: z.string().min(1),
});
export type TextBlockProps = z.infer<typeof TextBlockPropsSchema>;
