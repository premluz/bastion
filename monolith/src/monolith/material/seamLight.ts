/** Shared model-space phase makes adjoining openings agree, regardless of segment order or direction. */
export const SEAM_LIGHT = {
  direction: [0.73, 0.91, 0.57], frequency: 3.1, speed: 2,
  sharpness: 5, secondaryFrequency: 0.63, secondarySpeed: 0.71,
  secondaryOffset: 2.2, secondaryGain: 0.35,
  ember: 0.4, peak: 3.8, activityGain: 0.63,
  hotColor: [1, 0.82, 0.52], hotThreshold: 0.45, hotPeak: 0.95,
  lipRadius: 0.045, lipGain: 0.22, blendRadius: 0.12,
  wallWidth: 0.065, openWidth: 0.028, endFade: 0.08, openEmber: 0.1,
} as const;

export const SEAM_LIGHT_HEADER = /* glsl */ `
uniform vec4 uSeamTuning;
vec3 bsSeamLight(vec3 opening) {
  const vec3 bsDirection = vec3(${SEAM_LIGHT.direction.join(', ')});
  float coordinate = dot(opening, bsDirection) * ${SEAM_LIGHT.frequency};
  float drift = uDrift * uSeamTuning.x;
  float focus = ${SEAM_LIGHT.sharpness.toFixed(1)} * uSeamTuning.y;
  float phase = coordinate - drift * ${SEAM_LIGHT.speed.toFixed(1)};
  float primary = exp(-focus * (1.0 - cos(phase)));
  float secondary = exp(-focus * (1.0 - cos(coordinate * ${SEAM_LIGHT.secondaryFrequency}
    + drift * ${SEAM_LIGHT.secondarySpeed} + ${SEAM_LIGHT.secondaryOffset})));
  float concentration = primary + ${SEAM_LIGHT.secondaryGain} * secondary;
  float energy = ${SEAM_LIGHT.ember} * mix(1.0, ${SEAM_LIGHT.openEmber}, uOpen) + concentration * ${SEAM_LIGHT.peak} * uSeamTuning.z;
  vec3 color = mix(uAmber, vec3(${SEAM_LIGHT.hotColor.join(', ')}), smoothstep(${SEAM_LIGHT.hotThreshold}, ${SEAM_LIGHT.hotPeak}, concentration));
  return color * energy * uGlow * uCore * uCutLight;
}

// Blend sources rather than switching at a nearest-segment bisector (which creates triangular light patches).
vec3 bsOpeningLight(vec3 p) {
  vec3 light = vec3(0.0);
  float weight = 0.0;
  for (int i = 0; i < MAX_OPENINGS; i++) {
    if (i >= uSegCount) break;
    vec3 ab = uSegB[i] - uSegA[i];
    float t = clamp(dot(p - uSegA[i], ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
    vec3 q = uSegA[i] + ab * t;
    float w = exp(-length(p - q) / ${SEAM_LIGHT.blendRadius});
    float along = t * length(ab);
    float fadeLength = max(min(${SEAM_LIGHT.endFade}, length(ab) * 0.25), 1e-4);
    float ends = smoothstep(0.0, fadeLength, along) * smoothstep(0.0, fadeLength, length(ab) - along);
    light += bsSeamLight(q) * w * mix(1.0, ends, uOpen);
    weight += w;
  }
  return light / max(weight, 1e-8) * (1.0 + ${SEAM_LIGHT.activityGain} * bsEnergy(p));
}

// Normalizing overlapping sources must not cancel the beam's distance falloff on exposed cut faces.
float bsWallBeam(vec3 p) {
  float width = mix(${SEAM_LIGHT.wallWidth}, ${SEAM_LIGHT.openWidth}, uOpen) * uSeamTuning.w;
  return exp(-pow(bsCutDistance(p) / width, 2.0));
}

vec3 bsSeamLip(vec3 p, vec3 source) {
  float distance = bsCutDistance(p);
  float radius = (${SEAM_LIGHT.lipRadius} + uDiffusion * ${SEAM_LIGHT.lipRadius}) * mix(1.0, 0.35, uOpen);
  return source * exp(-distance / radius) * ${SEAM_LIGHT.lipGain} * uSpill;
}
`;
