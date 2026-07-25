import { z } from "zod";

// Decoupled from the scene contract entirely (Phase 12 WO-1.5, Prem's
// instruction, node-vocabulary.md) — column count and per-child spans
// are Merlin's own UI configuring itself via config.ts, never authored
// in scene JSON. This schema is deliberately empty: a scene may use
// dashboard-layout as a node type, but cannot drive its layout mechanics
// through props, unlike every other container node.
export const DashboardLayoutPropsSchema = z.object({});
export type DashboardLayoutProps = z.infer<typeof DashboardLayoutPropsSchema>;
