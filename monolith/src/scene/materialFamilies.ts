import { PALETTE } from '../brand/palette';
import type { AppearancePreset } from './appearance';
import { FROSTED_GLASS, GRAPHITE_CERAMIC, type SurfaceFinish } from './surfaceFinish';
import type { Appearance } from '../settings';

export type MaterialFamily = 'current' | 'ceramic' | 'frosted' | 'opal' | 'obsidian' | 'spectral';

export const isReferenceMaterial = (family: MaterialFamily): boolean =>
  family === 'ceramic' || family === 'frosted' || family === 'opal' || family === 'spectral';

export const MATERIAL_FAMILIES: readonly { id: MaterialFamily; label: string; description: string }[] = [
  { id: 'current', label: 'Current', description: 'The existing graphite and frosted-light finish, with orange structural seams.' },
  { id: 'ceramic', label: 'Ivory Ceramic', description: '01. Dense matte-satin ceramic with shallow, localized subsurface illumination. Ivory in light mode; graphite in dark.' },
  { id: 'frosted', label: 'Frosted Glass', description: '02. Milky optical glass: rough refraction, thickness-dependent absorption and soft internal scattering, not reduced opacity.' },
  { id: 'opal', label: 'Opal Pearl', description: '03. Mostly opaque optical ceramic with restrained grazing-angle interference. Frontal surfaces remain neutral; pearl colour emerges in reflected light.' },
  { id: 'obsidian', label: 'Obsidian / amber', description: '07 outside, 06 inside. A substantial opaque shell that reveals warm amber depth as optical expression increases.' },
  { id: 'spectral', label: 'Prismatic / spectral', description: '04 + 09. Expressive optical glass with angle-dependent thin-film colour and dispersion; orange seams retain the identity.' },
];

interface FamilyFinish {
  readonly base: string;
  readonly surface: SurfaceFinish;
  readonly dispersion: number;
  readonly film: readonly [number, number];
}

const OPTICS = {
  ceramic: { transmission: 0.02, iridescence: 0, clearcoat: 0.08, roughnessScale: 0.95, thickness: 2.2 },
  frosted: { transmission: 0.62, iridescence: 0, clearcoat: 0.12, roughnessScale: 0.75, thickness: 2.4 },
  opal: { transmission: 0.24, iridescence: 0.65, clearcoat: 0.24, roughnessScale: 0.55, thickness: 2 },
  obsidian: { transmission: 0.08, iridescence: 0, clearcoat: 0.8, roughnessScale: 0.35, thickness: 2 },
  spectral: { transmission: 0.62, iridescence: 0.9, clearcoat: 0.45, roughnessScale: 0.4, thickness: 1.6 },
} as const;
const FILM: Record<MaterialFamily, readonly [number, number]> = {
  current: [100, 400], ceramic: [180, 320], frosted: [180, 320], opal: [280, 440], obsidian: [100, 400], spectral: [220, 520],
};
const DISPERSION: Record<MaterialFamily, number> = { current: 0, ceramic: 0, frosted: 0, opal: 0.025, obsidian: 0.08, spectral: 0.8 };

export function materialTranslucency(family: MaterialFamily, appearance: Appearance): number {
  if (family !== 'current') return OPTICS[family].transmission;
  return (appearance === 'light' ? FROSTED_GLASS : GRAPHITE_CERAMIC).transmission;
}

export function familyFinish(family: MaterialFamily, preset: AppearancePreset): FamilyFinish {
  if (family === 'current') return { base: preset.base, surface: preset.surface, dispersion: 0, film: FILM.current };
  const light = preset.lightGround > 0;
  const optical = family === 'opal' || family === 'spectral';
  const base = light ? (optical ? PALETTE.groundLight : PALETTE.ceramic) : PALETTE.graphite;
  const surface = {
    ...preset.surface, ...OPTICS[family],
    depthColor: family === 'obsidian' ? PALETTE.glassDepth : PALETTE.pearl,
    depthDistance: light ? 3.5 : 1.8,
    sheen: family === 'opal' ? 0.2 : 0,
    sheenColor: PALETTE.pearl,
    ...(isReferenceMaterial(family) ? {
      depthColor: optical ? PALETTE.groundLight : PALETTE.glassDepth, depthDistance: 1.8, ior: 1.46,
      clearcoatRoughness: 0.48, sheen: 0, fallbackLift: 0,
    } : {}),
  };
  return { base, surface, dispersion: DISPERSION[family], film: FILM[family] };
}
