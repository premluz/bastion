export const DEFAULT_OPTICAL_TUNING = Object.freeze({
  scatterStrength: 1, scatterReach: 1, opticalThickness: 1, attenuationDistance: 1,
  filmDepth: 1, dispersion: 1, seamSpeed: 1, hotspotFocus: 1, hotspotIntensity: 1, beamWidth: 1,
});
export type OpticalTuningKey = keyof typeof DEFAULT_OPTICAL_TUNING;
export type OpticalTuning = { readonly [Key in OpticalTuningKey]: number };
export const OPTICAL_TUNING_KEYS = [
  'scatterStrength', 'scatterReach', 'opticalThickness', 'attenuationDistance', 'filmDepth',
  'dispersion', 'seamSpeed', 'hotspotFocus', 'hotspotIntensity', 'beamWidth',
] as const satisfies readonly OpticalTuningKey[];

interface OpticalControl {
  readonly label: string;
  readonly group: 'material' | 'seams';
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly referenceOnly?: boolean;
}

/** Multipliers retain each material family's calibrated response at 1x. */
export const OPTICAL_CONTROLS: Readonly<Record<OpticalTuningKey, OpticalControl>> = {
  scatterStrength: { label: 'Scattering strength', group: 'material', min: 0, max: 3, step: 0.05, referenceOnly: true },
  scatterReach: { label: 'Scattering reach', group: 'material', min: 0.25, max: 3, step: 0.05, referenceOnly: true },
  opticalThickness: { label: 'Optical thickness', group: 'material', min: 0.25, max: 4, step: 0.05 },
  attenuationDistance: { label: 'Absorption distance', group: 'material', min: 0.25, max: 4, step: 0.05 },
  filmDepth: { label: 'Thin-film depth', group: 'material', min: 0.5, max: 2, step: 0.05 },
  dispersion: { label: 'Dispersion amount', group: 'material', min: 0, max: 3, step: 0.05 },
  seamSpeed: { label: 'Light travel speed', group: 'seams', min: 0, max: 3, step: 0.05 },
  hotspotFocus: { label: 'Hotspot focus', group: 'seams', min: 0.25, max: 3, step: 0.05 },
  hotspotIntensity: { label: 'Hotspot intensity', group: 'seams', min: 0, max: 3, step: 0.05 },
  beamWidth: { label: 'Cut beam width', group: 'seams', min: 0.25, max: 2, step: 0.05 },
};

export function opticalTuningValue(params: Partial<OpticalTuning>, key: OpticalTuningKey): number {
  const value = params[key] ?? DEFAULT_OPTICAL_TUNING[key];
  if (!Number.isFinite(value)) throw new RangeError('Non-finite optical control: ' + key);
  const { min, max } = OPTICAL_CONTROLS[key];
  return Math.max(min, Math.min(max, value));
}
