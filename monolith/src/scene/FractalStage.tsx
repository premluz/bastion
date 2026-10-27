import { useMemo } from 'react';
import { FractalMonolith } from '../fractal/FractalMonolith';
import { BEVEL, cornerRadius } from '../fractal/geometry/bevel';
import { buildFractal } from '../fractal/geometry/buildFractal';
import type { LiveSettings } from '../live';
import type { QualitySpec } from '../quality';
import type { AppearancePreset } from './appearance';

interface FractalStageProps {
  readonly levels: number;
  readonly granularity: number;
  readonly seed: number;
  readonly searchAttempts: number;
  readonly settings: LiveSettings;
  readonly quality: QualitySpec;
  readonly preset: AppearancePreset;
  readonly progress: () => number;
}

/** The fractal monolith: levels of cubes within cubes, the first level leaving as an agent. */
export function FractalStage({ levels, granularity, seed, searchAttempts, settings, quality, preset, progress }: FractalStageProps) {
  const { cutWidth, softCorners } = settings.target.material;
  const round = cornerRadius(softCorners);
  const search = useMemo(() => ({ trials: searchAttempts, seed }), [searchAttempts, seed]);
  const model = useMemo(
    () => buildFractal({ seed, levels, granularity, cutWidth, bevel: BEVEL, round }),
    [seed, levels, granularity, cutWidth, round],
  );

  return <FractalMonolith model={model} search={search} settings={settings} quality={quality} preset={preset} progress={progress} />;
}
