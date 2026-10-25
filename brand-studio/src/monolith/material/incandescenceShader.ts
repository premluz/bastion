/**
 * GLSL for the incandescent glow mode, where the whole body is lit from within.
 * Relies on bsNoise, bsEnergy and the uniforms declared in ceramicShader's header.
 */
export const INCANDESCENCE_FUNCTIONS = /* glsl */ `
float bsFbm(vec3 p) {
  return 0.78 * bsNoise(p) + 0.22 * bsNoise(p * 1.97 + 11.7);
}

// One plasma for the whole composition, in world space on one clock: a mass of heat drifts
// continuously across neighbouring elements instead of each element carrying its own pattern.
float bsPlasma(vec3 w) {
  float t = uDrift;
  vec3 q = w * uPlasmaShape.x - uFlow.xyz * t;
  // Stretch: compress along the flow so forms are drawn out into streams.
  float speed = length(uFlow.xyz);
  if (speed > 1e-4) {
    vec3 along = uFlow.xyz / speed;
    q -= along * dot(q, along) * uFlow.w;
  }
  vec3 warp = vec3(
    bsFbm(q + vec3(0.0, t * 0.3, 0.0)),
    bsFbm(q + vec3(5.2, 1.3, -t * 0.24)),
    bsFbm(q + vec3(t * 0.27, 9.2, 1.7)));
  return bsFbm(q * 0.9 + (warp - 0.5) * 1.3 + vec3(0.0, t * 0.1, 0.0));
}

float bsHeat(float plasma, float proximity, float energy) {
  float heat = 0.6 * plasma + 0.4 * proximity + 0.28 * clamp(energy, 0.0, 1.6);
  // Never fully cold, and a wide, gentle curve so warm and hot regions melt into each other.
  return 0.16 + 0.84 * smoothstep(0.1, 1.15, heat);
}

// Black-body-like ramp in linear HDR: ember → signal orange → amber → near white.
vec3 bsHeatColor(float h) {
  vec3 ember = uAmber * vec3(0.32, 0.07, 0.02);
  vec3 hotAmber = vec3(1.0, 0.58, 0.2) * 1.7;
  vec3 white = vec3(1.0, 0.88, 0.72) * 3.2;
  vec3 c = mix(ember, uAmber, smoothstep(0.0, 0.4, h));
  c = mix(c, hotAmber, smoothstep(0.38, 0.75, h));
  return mix(c, white, smoothstep(0.72, 1.0, h));
}
`;

/** Skin emission when incandescent; `bsPlasmaHere` the shared plasma, `bsProximity` the soft cut field, `bsEnergyHere` the intelligence. */
export const INCANDESCENT_SKIN = /* glsl */ `
  if (uIncandescence > 0.0) {
    float bsH = bsHeat(bsPlasmaHere, bsProximity, bsEnergyHere) * uIncandescence * uGlow;
    // Rim brightening: light scatters toward the viewer most where the surface turns away.
    float bsRim = mix(0.85, 1.25, pow(1.0 - bsNdv, 2.0));
    totalEmissiveRadiance += bsHeatColor(bsH) * bsRim * (0.3 + 0.55 * uIncandescence);
  }
`;

export const INCANDESCENT_WALL = /* glsl */ `
  if (uIncandescence > 0.0) {
    float bsWallHeat = clamp(0.66 + 0.2 * bsEnergyHere + 0.12 * bsDeep, 0.0, 1.0) * uIncandescence * uGlow;
    totalEmissiveRadiance += bsHeatColor(bsWallHeat) * mix(1.0, 0.6, uOpen) * 1.3;
  }
`;
