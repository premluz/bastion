import { z } from "zod";

// panel is the framing unit — title and source attribution only; the
// content slot itself comes from the node's children, not props.
export const PanelPropsSchema = z.object({
  title: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
});
export type PanelProps = z.infer<typeof PanelPropsSchema>;
