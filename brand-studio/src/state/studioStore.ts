import { DEFAULT_SETTINGS, type Appearance, type IntelligenceSettings, type MaterialParams, type VariantId } from '@bastion/monolith';
import { create } from 'zustand';

export type { Appearance, GlowMode, IntelligenceSettings, MaterialParams } from '@bastion/monolith';

interface StudioState {
  readonly variant: VariantId;
  readonly appearance: Appearance;
  readonly material: MaterialParams;
  readonly intelligence: IntelligenceSettings;
  readonly autoRotate: boolean;
  readonly rotationSpeed: number;
  readonly setVariant: (variant: VariantId) => void;
  readonly setAppearance: (appearance: Appearance) => void;
  readonly setMaterial: (patch: Partial<MaterialParams>) => void;
  readonly setIntelligence: (patch: Partial<IntelligenceSettings>) => void;
  readonly resetLight: () => void;
  readonly setAutoRotate: (autoRotate: boolean) => void;
  readonly setRotationSpeed: (speed: number) => void;
}

export const useStudio = create<StudioState>((set) => ({
  variant: 'step-angle',
  appearance: 'dark',
  material: DEFAULT_SETTINGS.material,
  intelligence: DEFAULT_SETTINGS.intelligence,
  autoRotate: false,
  rotationSpeed: 0.6,
  setVariant: (variant) => set({ variant }),
  setAppearance: (appearance) => set({ appearance }),
  setMaterial: (patch) => set((s) => ({ material: { ...s.material, ...patch } })),
  setIntelligence: (patch) => set((s) => ({ intelligence: { ...s.intelligence, ...patch } })),
  resetLight: () => set({ material: DEFAULT_SETTINGS.material, intelligence: DEFAULT_SETTINGS.intelligence }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),
}));
