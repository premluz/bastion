import type { MeshPhysicalMaterial } from 'three';
import type { SurfaceFinish } from '../../scene/surfaceFinish';

interface SurfaceControls {
  readonly base: string;
  readonly roughness: number;
  readonly reflectance: number;
  /** False drops glass transmission (it re-renders the scene behind the glass), keeping the rest of the finish. */
  readonly transmission: boolean;
}

const enabled = (m: MeshPhysicalMaterial): string =>
  [m.transmission > 0, m.clearcoat > 0, m.iridescence > 0, m.sheen > 0].join();

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
