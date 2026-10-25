import { useMemo } from 'react';
import { FractalMonolith } from '../fractal/FractalMonolith';
import { BEVEL } from '../fractal/geometry/bevel';
import { buildCube } from '../fractal/geometry/buildFractal';
import { useCube } from '../state/cubeStore';
import { useStudio } from '../state/studioStore';
import type { AppearancePreset } from './appearance';

interface CubeStageProps {
  readonly preset: AppearancePreset;
  readonly progress: () => number;
}

/** One cube, broken into the chosen number of elements, assembling with the same search motion. */
export function CubeStage({ preset, progress }: CubeStageProps) {
  const material = useStudio((s) => s.material);
  const intelligence = useStudio((s) => s.intelligence);
  const count = useCube((s) => s.count);
  const trials = useCube((s) => s.trials);
  const seed = useCube((s) => s.seed);
  const settings = useMemo(() => ({ trials, seed }), [trials, seed]);
  const model = useMemo(() => buildCube({ seed, count, cutWidth: material.cutWidth, bevel: BEVEL }), [seed, count, material.cutWidth]);

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
