import { BastionMonolith, type Composition, type Sequence } from '@bastion/monolith';
import { useCallback, useMemo } from 'react';
import { monolithRef } from '../state/monolithRef';
import { useAssembly } from '../state/assemblyStore';
import { useCube } from '../state/cubeStore';
import { useFractal } from '../state/fractalStore';
import { useStudio } from '../state/studioStore';

export type StagePage = 'monolith' | 'assembly' | 'cube' | 'fractal';

const SEQUENCE: Record<StagePage, Sequence> = {
  monolith: 'rest',
  assembly: 'shape-to-shape',
  cube: 'shape-to-shape',
  fractal: 'assemble',
};

/** The studio's stores, mapped onto the monolith component's props. */
export function Stage({ page }: { readonly page: StagePage }) {
  const appearance = useStudio((s) => s.appearance);
  const variant = useStudio((s) => s.variant);
  const material = useStudio((s) => s.material);
  const intelligence = useStudio((s) => s.intelligence);
  const autoRotate = useStudio((s) => s.autoRotate);
  const rotationSpeed = useStudio((s) => s.rotationSpeed);
  const cube = useCube();
  const fractal = useFractal();

  const composition = useMemo<Composition>(() => {
    if (page === 'cube') return { kind: 'cube', elements: cube.count, seed: cube.seed, searchAttempts: cube.trials };
    if (page === 'fractal') {
      return { kind: 'fractal', levels: fractal.levels, granularity: fractal.granularity, seed: fractal.seed, searchAttempts: fractal.trials };
    }
    return { kind: 'monolith', variant };
  }, [page, variant, cube.count, cube.seed, cube.trials, fractal.levels, fractal.granularity, fractal.seed, fractal.trials]);
  const settings = useMemo(
    () => ({ material, intelligence, camera: { autoRotate, rotationSpeed } }),
    [material, intelligence, autoRotate, rotationSpeed],
  );
  const progress = useCallback(() => useAssembly.getState().progress, []);
  const tick = useCallback((delta: number) => useAssembly.getState().advance(delta), []);
  // The assembly clock only runs on pages that play a sequence.
  const clock = page === 'monolith' ? {} : { onFrame: tick };

  return (
    <BastionMonolith
      ref={monolithRef}
      composition={composition}
      appearance={appearance}
      sequence={SEQUENCE[page]}
      progress={progress}
      settings={settings}
      transition="immediate"
      {...clock}
    />
  );
}
