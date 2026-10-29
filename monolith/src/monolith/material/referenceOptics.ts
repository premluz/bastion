import { ShaderChunk } from 'three';
import type { MaterialFamily } from '../../scene/materialFamilies';

/** Enabled, scattering distance, scattering gain, thickness contrast (model-space approximation). */
export const REFERENCE_OPTICS: Record<MaterialFamily, readonly [number, number, number, number]> = {
  current: [0, 0, 0, 0], ceramic: [1, 0.075, 0.12, 0.3],
  frosted: [1, 0.32, 0.65, 0.8], opal: [1, 0.22, 0.32, 0.5],
  obsidian: [0, 0, 0, 0], spectral: [1, 0.24, 0.4, 0.7],
};

export const REFERENCE_HEADER = /* glsl */ `
uniform vec4 uOpticalProfile;
// Distance to structural openings is a thickness proxy, not a back-face volume measurement.
float bsOpticalPath() {
  const float bsMinimumPath = 0.28;
  float bsBulk = smoothstep(0.0, max(uOpticalProfile.y * 2.0, 1e-4), bsCutDistance(vMonoPos));
  return mix(1.0, mix(bsMinimumPath, 1.0, bsBulk), uOpticalProfile.w);
}
`;

export const REFERENCE_EMISSION = /* glsl */ `
{
  float bsDistance = bsCutDistance(vMonoPos);
  vec3 bsSource = bsOpeningLight(vMonoPos);
#ifdef BS_WALL
  const float bsWallRadiance = 0.62;
  totalEmissiveRadiance += uWall * bsWallRadiance * bsSource * bsWallBeam(vMonoPos);
#else
  const float bsDiffusionRange = 0.8;
  const float bsBodyGain = 0.4;
  const float bsScatterControl = 0.6;
  float bsRadius = uOpticalProfile.y * (1.0 + bsDiffusionRange * uDiffusion) * mix(1.0, 0.2, uOpen);
  float bsScatter = exp(-bsDistance / bsRadius);
  float bsAttenuation = exp(-uAbsorption * bsDistance / bsRadius);
  float bsPath = bsOpticalPath();
  float bsScatterStrength = uOpticalProfile.z * (bsScatterControl + uSpill + bsBodyGain * uBodyLight);
  // No face-wide veil or orange filter: far from an opening the material keeps its own albedo.
  totalEmissiveRadiance += bsSource * bsScatter * bsAttenuation * bsScatterStrength * bsPath;
  totalEmissiveRadiance += bsSeamLip(vMonoPos, bsSource);
#endif
}
`;

/** Retain three's rough-refraction mip sampling and Beer–Lambert attenuation. */
export function referenceTransmission(): string {
  const anchor = 'material.thickness = thickness;';
  const source = ShaderChunk.transmission_fragment;
  if (!source.includes(anchor)) throw new Error('Reference optics: three transmission thickness anchor missing');
  return source.replace(anchor, 'material.thickness = thickness * mix(1.0, bsOpticalPath(), uOpticalProfile.x);');
}
