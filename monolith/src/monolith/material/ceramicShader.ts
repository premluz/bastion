import { INCANDESCENCE_FUNCTIONS, INCANDESCENT_SKIN, INCANDESCENT_WALL } from './incandescenceShader';

/** GLSL injected into MeshPhysicalMaterial. All identifiers are prefixed `bs` to avoid three.js collisions. */

export const VERTEX_HEADER = /* glsl */ `
varying vec3 vMonoPos;
varying vec3 vWorldPos;
`;

export const VERTEX_BODY = /* glsl */ `
vMonoPos = position;
vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
`;

export const FRAGMENT_HEADER = /* glsl */ `
varying vec3 vMonoPos;
varying vec3 vWorldPos;
uniform vec3 uSegA[MAX_OPENINGS];
uniform vec3 uSegB[MAX_OPENINGS];
uniform int uSegCount;
uniform vec3 uAmber;
uniform vec3 uEdgeColor;
uniform float uGlow;
uniform float uCore;
uniform float uCutLight;
uniform float uSpill;
uniform float uDiffusion;
uniform float uAbsorption;
uniform float uFalloff;
uniform float uEdge;
uniform float uWall;
uniform vec3 uJunction;
uniform float uCoreGlow;
uniform vec4 uMotes[MAX_MOTES];
uniform float uMoteSpread;
uniform float uFieldBase;
uniform float uReveal;
uniform vec3 uImpulse;
uniform float uOpen;
uniform float uDissolve;
uniform float uGrainScale;
uniform float uGrainAmount;
uniform float uIncandescence;
uniform float uDrift;
uniform float uLightGround;
uniform float uStain;
uniform vec4 uFlow;
uniform vec3 uPlasmaShape;
uniform float uExterior;
uniform float uEdgeLight;
uniform float uBodyLight;
uniform float uPaleWarmth;
// How much inner light reaches this fragment (0–1), for the amber-glass filter applied after lighting.
float bsWarmHere = 0.0;

float bsHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float bsNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(bsHash(i), bsHash(i + vec3(1, 0, 0)), f.x), mix(bsHash(i + vec3(0, 1, 0)), bsHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(bsHash(i + vec3(0, 0, 1)), bsHash(i + vec3(1, 0, 1)), f.x), mix(bsHash(i + vec3(0, 1, 1)), bsHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

float bsSegment(vec3 p, vec3 a, vec3 b) {
  vec3 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
  return length(p - a - ab * t);
}

float bsCutDistance(vec3 p) {
  float d = 1e3;
  for (int i = 0; i < MAX_OPENINGS; i++) {
    if (i >= uSegCount) break;
    d = min(d, bsSegment(p, uSegA[i], uSegB[i]));
  }
  return d;
}

// Soft union of every opening's falloff: overlapping cuts blend smoothly instead of meeting in a crease.
float bsProximityField(vec3 p, float radius, float falloff) {
  float sum = 0.0;
  for (int i = 0; i < MAX_OPENINGS; i++) {
    if (i >= uSegCount) break;
    sum += exp(-pow(bsSegment(p, uSegA[i], uSegB[i]) / radius, falloff));
  }
  return (1.0 - exp(-2.0 * sum)) / (1.0 - exp(-2.0));
}

// The hidden intelligence: one shared energy field across the whole monolith, in model space,
// so it stays continuous across corners, branches and pieces.
float bsEnergy(vec3 p) {
  float e = uFieldBase;
  for (int i = 0; i < MAX_MOTES; i++) {
    vec3 d = p - uMotes[i].xyz;
    e += uMotes[i].w * exp(-dot(d, d) / uMoteSpread);
  }
  vec3 dj = p - uJunction;
  float r2 = dot(dj, dj);
  float r = sqrt(r2);
  e += uCoreGlow * exp(-r2 / 0.3);
  float front = (r - uImpulse.x) / 0.3;
  e += uImpulse.y * exp(-front * front);
  e += uImpulse.z * exp(-r2 / 0.1);
  // Light reaches outward from the core; beyond the reveal radius the cuts keep a low ember, never dark.
  return e * mix(0.55, 1.0, 1.0 - smoothstep(uReveal - 0.8, uReveal + 0.8, r));
}
${INCANDESCENCE_FUNCTIONS}
`;

export const FRAGMENT_DISSOLVE = /* glsl */ `
float bsGrain = 0.7 * bsNoise(vMonoPos * 6.0) + 0.3 * bsNoise(vMonoPos * 17.0);
if (bsGrain < uDissolve) discard;
`;

/** Monument-scale microtexture: grain far below the scale of the object, never visible as blotches. */
export const FRAGMENT_COLOR = /* glsl */ `
diffuseColor.rgb *= 1.0 + (bsHash(floor(vMonoPos * uGrainScale)) - 0.5) * 0.03 * uGrainAmount;
#ifdef BS_WALL
// On a pale ground the walls would reflect enough studio light to wash their own amber to pastel.
diffuseColor.rgb *= mix(0.55, 0.1, uLightGround);
#endif
// A body lit from within reflects less of the studio, so its own light reads.
diffuseColor.rgb *= 1.0 - 0.75 * uIncandescence * (1.0 - uOpticalProfile.x);
`;

export const FRAGMENT_ROUGHNESS = /* glsl */ `
roughnessFactor = clamp(roughnessFactor + (bsNoise(vMonoPos * uGrainScale) - 0.5) * 0.1 * uGrainAmount, 0.04, 1.0);
`;

export const FRAGMENT_EMISSION = /* glsl */ `
{
  float bsDist = bsCutDistance(vMonoPos);
  float bsNdv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
  float bsEnergyHere = bsEnergy(vMonoPos) * uGlow * uCore;
  float bsMaterialize = (1.0 - smoothstep(uDissolve, uDissolve + 0.05, bsGrain)) * step(0.001, uDissolve);
#ifdef BS_WALL
  // Deeper into the slot is closer to the hidden core, so the wall brightens with depth.
  float bsDeep = smoothstep(0.0, 0.22, bsDist);
  // An opened slot spills its light; the walls only carry it fully once the gap has closed.
  float bsClosed = mix(1.0, 0.6, uOpen);
  totalEmissiveRadiance += bsOpeningLight(vMonoPos) * uWall * bsClosed * bsWallBeam(vMonoPos);
${INCANDESCENT_WALL}
#else
  // Exterior spill is its own channel: zero spill leaves the skin neutral while the cuts still glow.
  float bsRadius = max(uDiffusion, 1e-4) * mix(1.0, 0.2, uOpen);
  float bsLip = exp(-pow(bsDist / 0.01, 2.0));
  // A tight core plus a long, soft tail: scattered light, not a hard frame along each edge.
  float bsBeneath = 0.55 * bsProximityField(vMonoPos, bsRadius, uFalloff) + 0.45 * bsProximityField(vMonoPos, bsRadius * 2.8, 1.2);
  float bsProximity = bsProximityField(vMonoPos, mix(0.35, 0.035, uOpen), 2.0);
  // The same world-space plasma that heats an incandescent body also breathes through the spill.
  float bsPlasmaHere = bsPlasma(vWorldPos);
  // A grazing view looks through a longer optical path, which scatters slightly more light back.
  float bsPath = mix(0.75, 1.2, pow(1.0 - bsNdv, 1.5));
  float bsKeep = mix(1.0, 0.35, uAbsorption);
  float bsSwing = mix(1.0 - 0.85 * uPlasmaShape.y, 1.0 + 1.1 * uPlasmaShape.y, bsPlasmaHere);
  float bsSpill = uSpill * uExterior * (0.45 * bsLip + 0.55 * bsBeneath) * bsSwing * bsPath * bsKeep * mix(1.0, 0.6, uOpen);
  vec3 bsSource = bsOpeningLight(vMonoPos);
  totalEmissiveRadiance += bsSource * bsSpill + bsSeamLip(vMonoPos, bsSource);
  // In contained mode, body light follows the same source rather than filling the face uniformly.
  float bsBody = uBodyLight * exp(-bsDist / max(bsRadius, 0.035)) * mix(1.0, 0.5, uOpen);
  totalEmissiveRadiance += bsSource * bsBody;
  // Keep the residual plasma near the openings; incandescent mode owns whole-body illumination.
  float bsVeil = uPlasmaShape.z * smoothstep(0.42, 0.88, bsPlasmaHere) * bsProximity * uCutLight * uCore * uGlow * mix(1.0, 0.6, uOpen);
  totalEmissiveRadiance += mix(mix(uAmber, uAmber * vec3(0.95, 0.42, 0.18), 0.5 * uAbsorption), vec3(1.0), 0.85 * uLightGround) * bsVeil;
  // Light passing through tinted ceramic colours what the surface reflects, not only what it adds;
  // on a pale ground this keeps the amber visible instead of brightening an already light surface.
  // On paper, light added to a white body only whitens it; body light also warms what the body reflects.
  float bsStainAmount = clamp((bsSpill * bsEnergyHere + bsVeil + 0.9 * bsBody) * uStain * (1.0 + uPaleWarmth), 0.0, mix(0.85, 1.0, uPaleWarmth)) * uLightGround;
  bsWarmHere = clamp((bsSpill * bsEnergyHere + bsVeil + 0.9 * bsBody) * uStain, 0.0, 1.0);
  diffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.5, 0.16), bsStainAmount);
  totalEmissiveRadiance += uEdgeColor * uEdge * pow(1.0 - bsNdv, 4.0);
  // Glass gathers light along its edges, where it is thinnest: on a face one axis sits at the shell,
  // so the distance to the nearest edge is the middle of the three distances to the shell.
  vec3 bsShell = 1.0 - abs(vMonoPos);
  float bsEdgeDist = max(min(bsShell.x, bsShell.y), min(max(bsShell.x, bsShell.y), bsShell.z));
  totalEmissiveRadiance += uEdgeColor * uEdgeLight * exp(-bsEdgeDist / 0.028);
${INCANDESCENT_SKIN}
#endif
  totalEmissiveRadiance += uAmber * bsMaterialize * 2.0;
  // Sub-quantum dither so long, soft gradients do not band.
  totalEmissiveRadiance += (bsHash(vec3(gl_FragCoord.xy, uDrift)) - 0.5) / 255.0;
}
`;
