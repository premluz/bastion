export { BastionMonolith } from './BastionMonolith';
export type { BastionMonolithHandle, BastionMonolithProps, Composition, Sequence } from './props';
export type { Quality } from './quality';
export type {
  Appearance,
  CameraSettings,
  GlowMode,
  IntelligenceSettings,
  MaterialParams,
  MonolithSettings,
  MonolithSettingsInput,
} from './settings';
export { DEFAULT_SETTINGS } from './settings';
export { MONOLITH_ORB_STATES, monolithOrbState } from './appCubeStates';
export type { MonolithOrbMood } from './appCubeStates';
export { DEFAULT_OPTICAL_TUNING, OPTICAL_CONTROLS, OPTICAL_TUNING_KEYS } from './opticalTuning';
export type { OpticalTuning, OpticalTuningKey } from './opticalTuning';
export { MATERIAL_FAMILIES, materialTranslucency, isReferenceMaterial } from './scene/materialFamilies';
export type { MaterialFamily } from './scene/materialFamilies';
export { MAX_CORNER_RADIUS, SOFT_CORNER_RADIUS } from './fractal/geometry/bevel';
export type { MonolithState } from './states';
export { DEFAULT_STATES } from './states';
export { phaseNameFor } from './phaseNames';

// For host UIs that expose the same choices.
export type { VariantId } from './monolith/geometry/types';
export { isVariantId, VARIANTS } from './monolith/variants';
export { CUBE_COUNT } from './fractal/geometry/cubeLayout';
export type { IntelligenceMode, MotionStyle } from './monolith/intelligence/styles';
export { STYLE_LABELS, STYLES } from './monolith/intelligence/styles';
export { clamp01 } from './monolith/assembly/timeline';
