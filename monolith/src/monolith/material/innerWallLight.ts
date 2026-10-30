/** HDR radiance emitted by the actual cut faces; bloom may span the void, but geometry never does. */
export const INNER_WALL_RADIANCE = 4.2;

export const INNER_WALL_LIGHT = /* glsl */ `
  // The steady source is independent of the travelling edge beam and never paints the outer skin.
  float bsInterior = mix(0.62, 1.0, bsDeep) * mix(0.55, 1.0, bsWallBeam(vMonoPos));
  totalEmissiveRadiance += uAmber * uInnerWallGlow * ${INNER_WALL_RADIANCE} * bsInterior * bsClosed * uGlow;
`;
