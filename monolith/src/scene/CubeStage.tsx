import { useMemo } from 'react';
import { FractalMonolith } from '../fractal/FractalMonolith';
import { BEVEL } from '../fractal/geometry/bevel';
import { buildCube } from '../fractal/geometry/buildFractal';
import type { LiveSettings } from '../live';
import type { QualitySpec } from '../quality';
import type { AppearancePreset } from './appearance';

interface CubeStageProps {
  readonly elements: number;
  readonly seed: number;
  readonly searchAttempts: number;
  readonly settings: LiveSettings;
  readonly quality: QualitySpec;
  readonly preset: AppearancePreset;
  readonly progress: () => number;
}

/** One cube, broken into the chosen number of elements, assembling with the same search motion. */
export function CubeStage({ elements, seed, searchAttempts, settings, quality, preset, progress }: CubeStageProps) {
  const { cutWidth } = settings.target.material;
  const search = useMemo(() => ({ trials: searchAttempts, seed }), [searchAttempts, seed]);
  const model = useMemo(() => buildCube({ seed, count: elements, cutWidth, bevel: BEVEL }), [seed, elements, cutWidth]);

  return <FractalMonolith model={model} search={search} settings={settings} quality={quality} preset={preset} progress={progress} />;
}
