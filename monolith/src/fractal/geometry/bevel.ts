/** The monolith's micro-bevel, shared by the fractal and single-cube pages (matches the Monolith page). */
export const BEVEL = 0.016;
/** Soft corners' radius, in model units (the cube spans 2). */
export const SOFT_CORNER_RADIUS = 0.16;
export const cornerRadius = (soft: boolean): number => (soft ? SOFT_CORNER_RADIUS : 0);
