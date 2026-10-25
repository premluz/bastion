import { useMemo } from 'react';
import { FractalMonolith } from '../fractal/FractalMonolith';
import { BEVEL } from '../fractal/geometry/bevel';
import { buildFractal } from '../fractal/geometry/buildFractal';
import { useFractal } from '../state/fractalStore';
import { useStudio } from '../state/studioStore';
import type { AppearancePreset } from './appearance';

interface FractalStageProps {
  readonly preset: AppearancePreset;
  readonly progress: () => number;
}

/** The fractal monolith with the studio's shared material and intelligence settings. */
export function FractalStage({ preset, progress }: FractalStageProps) {
  const material = useStudio((s) => s.material);
  const intelligence = useStudio((s) => s.intelligence);
  const levels = useFractal((s) => s.levels);
  const granularity = useFractal((s) => s.granularity);
  const trials = useFractal((s) => s.trials);
  const seed = useFractal((s) => s.seed);
  const settings = useMemo(() => ({ trials, seed }), [trials, seed]);
  const model = useMemo(
    () => buildFractal({ seed, levels, granularity, cutWidth: material.cutWidth, bevel: BEVEL }),
    [seed, levels, granularity, material.cutWidth],
  );

  return (
    <FractalMonolith
      model={model}
      settings={settings}
      material={material}
      intelligence={intelligence}
      preset={preset}
      progress={progress}
    />
  );
}
