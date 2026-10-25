import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Monolith } from '../monolith/Monolith';
import { useStudio } from '../state/studioStore';
import type { AppearancePreset } from './appearance';
import { DISSOLVE_IN_SECONDS, DISSOLVE_OUT_SECONDS, dissolveIn, dissolveOut, outPhaseFor } from './dissolveCurve';

type Phase = 'idle' | 'out' | 'in';

interface VariantStageProps {
  readonly preset: AppearancePreset;
  readonly progress: () => number;
}

/** Shows the selected variant, dissolving out of the old geometry and into the new one on change. */
export function VariantStage({ preset, progress }: VariantStageProps) {
  const target = useStudio((s) => s.variant);
  const material = useStudio((s) => s.material);
  const intelligence = useStudio((s) => s.intelligence);
  const [shown, setShown] = useState(target);
  const dissolve = useRef(0);
  const phase = useRef<Phase>('idle');

  /** Linear progress through the current dissolve phase; the visible level is its eased curve. */
  const phaseT = useRef(0);

  useEffect(() => {
    if (target === shown || phase.current === 'out') return;
    // Continue from the current level, so a switch during the fade-in does not jump.
    phaseT.current = outPhaseFor(dissolve.current);
    phase.current = 'out';
  }, [target, shown]);

  useFrame((_, delta) => {
    if (phase.current === 'out') {
      phaseT.current = Math.min(1, phaseT.current + delta / DISSOLVE_OUT_SECONDS);
      dissolve.current = dissolveOut(phaseT.current);
      if (phaseT.current >= 1) {
        setShown(useStudio.getState().variant);
        phaseT.current = 0;
        phase.current = 'in';
      }
    } else if (phase.current === 'in') {
      phaseT.current = Math.min(1, phaseT.current + delta / DISSOLVE_IN_SECONDS);
      dissolve.current = dissolveIn(phaseT.current);
      if (phaseT.current >= 1) phase.current = 'idle';
    }
  });

  const readDissolve = useCallback(() => dissolve.current, []);

  return (
    <Monolith
      variant={shown}
      material={material}
      intelligence={intelligence}
      preset={preset}
      progress={progress}
      dissolve={readDissolve}
    />
  );
}
