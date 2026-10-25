import { create } from 'zustand';
import type { VariantId } from '../monolith/geometry/types';
import type { IntelligenceParams } from '../monolith/intelligence/field';

export type Appearance = 'dark' | 'light';

/** contained — light only escapes through the cuts; incandescent — the whole body glows from within. */
export type GlowMode = 'contained' | 'incandescent';

/** Light channels and diffusion are 0–1 artistic levels; the scene maps them to physical-ish values. */
export interface MaterialParams {
  /** Slot width in model units (the cube spans 2). */
  readonly cutWidth: number;
  readonly roughness: number;
  readonly reflectance: number;
  readonly edge: number;
  /** Grain frequency per model unit — high values push the texture below visibility. */
  readonly grainScale: number;
  readonly grainAmount: number;
  /** A — brightness of the hidden source. */
  readonly core: number;
  /** B — brightness of the slot walls. */
  readonly cutLight: number;
  /** C — internal light reaching the exterior ceramic. */
  readonly spill: number;
  /** D — how far that light penetrates beneath the surface. */
  readonly diffusion: number;
  readonly absorption: number;
  readonly falloff: number;
  readonly glowMode: GlowMode;
  /** Incandescent mode only: how hot the body runs, from ember to near white. */
  readonly incandescence: number;
  /** Outer glow around the monolith, in either glow mode. */
  readonly halo: number;
}

export const DEFAULT_MATERIAL: MaterialParams = {
  cutWidth: 0.034,
  roughness: 0.72,
  reflectance: 0.45,
  edge: 0.3,
  grainScale: 1400,
  grainAmount: 0.5,
  core: 0.75,
  cutLight: 0.65,
  spill: 0.08,
  diffusion: 0.15,
  absorption: 0.6,
  falloff: 2,
  glowMode: 'contained',
  incandescence: 0.7,
  halo: 0.2,
};

export interface IntelligenceSettings extends IntelligenceParams {
  readonly paused: boolean;
}

export const DEFAULT_INTELLIGENCE: IntelligenceSettings = {
  activity: 0.25,
  flowSpeed: 0.18,
  impulse: 0.4,
  mode: 'thinking',
  style: 'currents',
  paused: false,
};

interface StudioState {
  readonly variant: VariantId;
  readonly appearance: Appearance;
  readonly material: MaterialParams;
  readonly intelligence: IntelligenceSettings;
  readonly autoRotate: boolean;
  readonly rotationSpeed: number;
  readonly cameraResetToken: number;
  readonly setVariant: (variant: VariantId) => void;
  readonly setAppearance: (appearance: Appearance) => void;
  readonly setMaterial: (patch: Partial<MaterialParams>) => void;
  readonly setIntelligence: (patch: Partial<IntelligenceSettings>) => void;
  readonly resetLight: () => void;
  readonly setAutoRotate: (autoRotate: boolean) => void;
  readonly setRotationSpeed: (speed: number) => void;
  readonly resetCamera: () => void;
}

export const useStudio = create<StudioState>((set) => ({
  variant: 'step-angle',
  appearance: 'dark',
  material: DEFAULT_MATERIAL,
  intelligence: DEFAULT_INTELLIGENCE,
  autoRotate: false,
  rotationSpeed: 0.6,
  cameraResetToken: 0,
  setVariant: (variant) => set({ variant }),
  setAppearance: (appearance) => set({ appearance }),
  setMaterial: (patch) => set((s) => ({ material: { ...s.material, ...patch } })),
  setIntelligence: (patch) => set((s) => ({ intelligence: { ...s.intelligence, ...patch } })),
  resetLight: () => set({ material: DEFAULT_MATERIAL, intelligence: DEFAULT_INTELLIGENCE }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),
  resetCamera: () => set((s) => ({ cameraResetToken: s.cameraResetToken + 1 })),
}));
