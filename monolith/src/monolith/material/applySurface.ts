import type { MeshPhysicalMaterial } from 'three';
import type { SurfaceFinish } from '../../scene/surfaceFinish';
import type { AppearancePreset } from '../../scene/appearance';
import type { MaterialParams } from '../../settings';
import { familyFinish } from '../../scene/materialFamilies';
import { ceramicSource } from './opticalCeramic';
import { REFERENCE_OPTICS } from './referenceOptics';
import { applyOpticalTuning } from './applyOpticalTuning';

const FILM_IOR = { current: 1.3, ceramic: 1.3, frosted: 1.3, opal: 1.85, obsidian: 1.3, spectral: 2 } as const;
const SATIN_METALNESS = 0.02;
const AMBER_INTERIOR_TRANSMISSION = 0.72;

interface SurfaceControls {
  readonly base: string;
  readonly roughness: number;
  readonly reflectance: number;
  /** False drops glass transmission (it re-renders the scene behind the glass), keeping the rest of the finish. */
  readonly transmission: boolean;
}

const enabled = (m: MeshPhysicalMaterial): string =>
  [m.transmission > 0, m.clearcoat > 0, m.iridescence > 0, m.sheen > 0, m.dispersion > 0].join();

/** Applies a finish and the surface controls; recompiles only when a physical feature switches on or off. */
export function applySurface(m: MeshPhysicalMaterial, finish: SurfaceFinish, controls: SurfaceControls): void {
  const before = enabled(m);
  m.color.set(controls.base);
  m.roughness = controls.roughness * finish.roughnessScale;
  m.specularIntensity = controls.reflectance;
  const solid = finish.transmission > 0 && !controls.transmission;
  m.transmission = solid ? 0 : finish.transmission;
  if (solid) m.emissive.set(finish.fallbackColor);
  else m.emissive.setScalar(0);
  m.emissiveIntensity = solid ? finish.fallbackLift : 1;
  m.thickness = finish.thickness;
  m.ior = finish.ior;
  m.attenuationColor.set(finish.depthColor);
  m.attenuationDistance = finish.depthDistance;
  m.clearcoat = finish.clearcoat;
  m.clearcoatRoughness = finish.clearcoatRoughness;
  m.iridescence = finish.iridescence;
  m.sheen = finish.sheen;
  m.sheenColor.set(finish.sheenColor);
  if (enabled(m) !== before) m.needsUpdate = true;
}

/** Thin-film and dispersion are native MeshPhysicalMaterial features, not painted colour maps. */
export function applyMaterial(m: MeshPhysicalMaterial, preset: AppearancePreset, params: MaterialParams, transmission: boolean): void {
  const before = enabled(m);
  const resolved = familyFinish(params.family, preset);
  const source = ceramicSource(m);
  const surface = params.family === 'obsidian' && source?.surface === 'wall'
    ? { ...resolved.surface, transmission: AMBER_INTERIOR_TRANSMISSION } : resolved.surface;
  const finish = controlledFinish(surface, params);
  applySurface(m, finish, { base: resolved.base, roughness: params.roughness, reflectance: params.reflectance * params.gloss, transmission });
  m.roughness = 1 - params.gloss * (1 - m.roughness);
  m.metalness = SATIN_METALNESS * params.gloss;
  m.dispersion = resolved.dispersion * params.spectral * finish.transmission;
  m.iridescenceThicknessRange = [...resolved.film];
  m.iridescenceIOR = FILM_IOR[params.family];
  if (source !== undefined) source.uniforms.uFilmVariation.value = params.family === 'current' ? 0 : params.spectral;
  if (source !== undefined) source.uniforms.uOpticalProfile.value.set(...REFERENCE_OPTICS[params.family]);
  applyOpticalTuning(m, source?.uniforms, params);
  if (enabled(m) !== before) m.needsUpdate = true;
}

function controlledFinish(finish: SurfaceFinish, params: MaterialParams): SurfaceFinish {
  return {
    ...finish,
    transmission: params.translucency ?? finish.transmission,
    clearcoat: finish.clearcoat * params.gloss,
    clearcoatRoughness: 1 - params.gloss * (1 - finish.clearcoatRoughness),
    sheen: finish.sheen * params.gloss,
    iridescence: finish.iridescence * params.spectral * params.gloss,
  };
}
