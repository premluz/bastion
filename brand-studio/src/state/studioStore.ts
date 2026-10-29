import { DEFAULT_SETTINGS, MONOLITH_ORB_STATES, type Appearance, type IntelligenceSettings, type MaterialParams, type VariantId } from '@bastion/monolith';
import { create } from 'zustand';

const STUDIO_CUT_LIGHT = 0.82;
const STUDIO_BODY_LIGHT = 0.52;
const STUDIO_MATERIAL = { ...DEFAULT_SETTINGS.material, cornerRadius: 0, cutLight: STUDIO_CUT_LIGHT, bodyLight: STUDIO_BODY_LIGHT };

export type StudioPreset = 'light' | 'dark' | 'web-light' | 'web-dark';

function profileSettings(preset: StudioPreset): {
  appearance: Appearance;
  material: MaterialParams;
  intelligence: IntelligenceSettings;
} {
  if (preset === 'light' || preset === 'dark') {
    return { appearance: preset, material: STUDIO_MATERIAL, intelligence: DEFAULT_SETTINGS.intelligence };
  }
  const appearance: Appearance = preset === 'web-light' ? 'light' : 'dark';
  const state = appearance === 'light' ? MONOLITH_ORB_STATES.restLight : MONOLITH_ORB_STATES.rest;
  return {
    appearance,
    material: { ...DEFAULT_SETTINGS.material, ...state.material },
    intelligence: { ...DEFAULT_SETTINGS.intelligence, ...state.intelligence },
  };
}

export type { Appearance, GlowMode, IntelligenceSettings, MaterialParams } from '@bastion/monolith';

interface StudioState {
  readonly preset: StudioPreset;
  readonly variant: VariantId;
  readonly appearance: Appearance;
  readonly material: MaterialParams;
  readonly intelligence: IntelligenceSettings;
  readonly autoRotate: boolean;
  readonly rotationSpeed: number;
  readonly setVariant: (variant: VariantId) => void;
  readonly setPreset: (preset: StudioPreset) => void;
  readonly setAppearance: (appearance: Appearance) => void;
  readonly setMaterial: (patch: Partial<MaterialParams>) => void;
  readonly setIntelligence: (patch: Partial<IntelligenceSettings>) => void;
  readonly resetLight: () => void;
  readonly setAutoRotate: (autoRotate: boolean) => void;
  readonly setRotationSpeed: (speed: number) => void;
}

export const useStudio = create<StudioState>((set) => ({
  preset: 'dark',
  variant: 'step-angle',
  appearance: 'dark',
  // The studio opens lit through (2026-10-27, direct feedback: the cube felt too solid); the component's own default is 0.
  material: STUDIO_MATERIAL,
  intelligence: DEFAULT_SETTINGS.intelligence,
  autoRotate: false,
  rotationSpeed: 0.6,
  setVariant: (variant) => set({ variant }),
  setPreset: (preset) => set({ preset, variant: 'step-angle', ...profileSettings(preset) }),
  setAppearance: (appearance) => set((state) => {
    const preset = state.preset.startsWith('web-') ? (appearance === 'light' ? 'web-light' : 'web-dark') : appearance;
    return state.preset.startsWith('web-') ? { preset, ...profileSettings(preset) } : { preset, appearance };
  }),
  setMaterial: (patch) => set((s) => ({ material: { ...s.material, ...patch } })),
  setIntelligence: (patch) => set((s) => ({ intelligence: { ...s.intelligence, ...patch } })),
  resetLight: () => set((state) => profileSettings(state.preset)),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),
}));
