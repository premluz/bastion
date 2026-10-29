/** The monolith's micro-bevel, shared by the fractal and single-cube pages (matches the Monolith page). */
export const BEVEL = 0.016;
/** Soft corners' radius, in model units (the cube spans 2). */
export const SOFT_CORNER_RADIUS = 0.16;
/** Maximum radius exposed by the continuous corner control. */
export const MAX_CORNER_RADIUS = 0.22;

export function cornerRadius(soft: boolean, explicit?: number): number {
  if (explicit === undefined) return soft ? SOFT_CORNER_RADIUS : 0;
  return Math.min(MAX_CORNER_RADIUS, Math.max(0, explicit));
}

/** An explicit radius owns the silhouette, including radius 0, so no hidden chamfer remains. */
export function bevelSize(soft: boolean, explicit?: number): number {
  return explicit === undefined && !soft ? BEVEL : 0;
}
