import { MeshBasicMaterial, type Material } from 'three';
import { ceramicSource, createCeramicMaterial } from './opticalCeramic';

/** Slot walls are enclosed: their light leaves only through the skin, so they emit nothing outward. */
const ENCLOSED = new MeshBasicMaterial({ visible: false });

const GLOW = new WeakMap<Material, Material>();

function glowFor(material: Material): Material | null {
  const cached = GLOW.get(material);
  if (cached !== undefined) return cached;
  const source = ceramicSource(material);
  if (source === undefined) return null;
  const glow = source.surface === 'wall' ? ENCLOSED : createCeramicMaterial('skin', source.uniforms, 'glow');
  GLOW.set(material, glow);
  if (glow !== ENCLOSED) material.addEventListener('dispose', () => glow.dispose());
  return glow;
}

/** The glow-pass stand-in for a mesh's ceramic material(s), or null if the mesh is not ceramic. */
export function glowMaterials(material: Material | Material[]): Material | Material[] | null {
  if (!Array.isArray(material)) return glowFor(material);
  const mapped = material.map(glowFor);
  return mapped.every((m): m is Material => m !== null) ? mapped : null;
}
