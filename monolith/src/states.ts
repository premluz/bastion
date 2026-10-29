import { damp } from './monolith/intelligence/damp';
import { OPTICAL_TUNING_KEYS } from './opticalTuning';
import {
  DEFAULT_SETTINGS,
  type CameraSettings,
  type IntelligenceSettings,
  type MaterialParams,
  type MonolithSettings,
  type MonolithSettingsInput,
} from './settings';

/** A named, partial set of settings. Define as many as the product needs; they are plain data. */
export type MonolithState = MonolithSettingsInput;

/** Starting states. Add, rename or replace them — nothing else in the component depends on these names. */
export const DEFAULT_STATES: Readonly<Record<string, MonolithState>> = {
  idle: { intelligence: { mode: 'dormant' }, material: { halo: 0.1 } },
  thinking: { intelligence: { mode: 'thinking', style: 'currents' }, material: { halo: 0.3 } },
  awakening: { intelligence: { mode: 'awakening' }, material: { halo: 0.4 } },
  incandescent: { intelligence: { mode: 'thinking' }, material: { glowMode: 'incandescent', incandescence: 0.8, halo: 0.5 } },
};

/** Later inputs win: defaults ← host settings ← the active state. */
export function mergeSettings(...inputs: readonly (MonolithSettingsInput | undefined)[]): MonolithSettings {
  return inputs.reduce<MonolithSettings>(
    (acc, input) =>
      input === undefined
        ? acc
        : {
            material: { ...acc.material, ...input.material },
            intelligence: { ...acc.intelligence, ...input.intelligence },
            camera: { ...acc.camera, ...input.camera },
          },
    DEFAULT_SETTINGS,
  );
}

/** Resolves a state given by name or inline, against the registry; an unknown name is an error, not a silent default. */
export function resolveState(
  state: string | MonolithState | undefined,
  registry: Readonly<Record<string, MonolithState>> = DEFAULT_STATES,
): MonolithState | undefined {
  if (state === undefined || typeof state !== 'string') return state;
  const found = registry[state];
  if (found === undefined) {
    throw new Error(`Unknown monolith state "${state}". Known states: ${Object.keys(registry).join(', ')}`);
  }
  return found;
}

/** Numeric settings that glide between values. Everything else (geometry, discrete choices) applies at once. */
const EASED_MATERIAL: readonly (keyof MaterialParams)[] = [
  ...OPTICAL_TUNING_KEYS,
  'gloss', 'translucency', 'spectral',
  'roughness', 'reflectance', 'edge', 'grainAmount', 'core', 'cutLight', 'spill', 'diffusion', 'absorption', 'falloff', 'incandescence', 'halo', 'bodyLight', 'paleWarmth',
];
const EASED_INTELLIGENCE: readonly (keyof IntelligenceSettings)[] = ['activity', 'flowSpeed', 'impulse'];

/** Calm: ~95% of the way in 0.75 s. */
export const SETTINGS_EASE_RATE = 4;

function easeNumbers<T extends object>(current: T, target: T, keys: readonly (keyof T)[], dt: number): T {
  const next = { ...target };
  for (const key of keys) {
    const from = current[key];
    const to = target[key];
    if (typeof from === 'number' && typeof to === 'number') {
      (next as Record<keyof T, number>)[key] = damp(from, to, SETTINGS_EASE_RATE, dt);
    }
  }
  return next;
}

/** One step of the settings easing: numeric values approach the target; discrete values adopt it. */
export function easeSettings(current: MonolithSettings, target: MonolithSettings, deltaSeconds: number): MonolithSettings {
  return {
    material: easeNumbers<MaterialParams>(current.material, target.material, EASED_MATERIAL, deltaSeconds),
    intelligence: easeNumbers<IntelligenceSettings>(current.intelligence, target.intelligence, EASED_INTELLIGENCE, deltaSeconds),
    camera: target.camera,
  };
}

export type { CameraSettings };
