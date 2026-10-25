import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LiveSettings } from '../live';
import { Monolith } from '../monolith/Monolith';
import type { VariantId } from '../monolith/geometry/types';
import type { QualitySpec } from '../quality';
import type { AppearancePreset } from './appearance';
import { DISSOLVE_IN_SECONDS, DISSOLVE_OUT_SECONDS, dissolveIn, dissolveOut, outPhaseFor } from './dissolveCurve';

type Phase = 'idle' | 'out' | 'in';

interface VariantStageProps {
  readonly variant: VariantId;
  readonly settings: LiveSettings;
  readonly quality: QualitySpec;
  readonly preset: AppearancePreset;
  readonly progress: () => number;
}

/** Shows the selected variant, dissolving out of the old geometry and into the new one on change. */
export function VariantStage({ variant: target, settings, quality, preset, progress }: VariantStageProps) {
  const [shown, setShown] = useState(target);
  const latest = useRef(target);
  latest.current = target;
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
        setShown(latest.current);
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

  return <Monolith variant={shown} settings={settings} quality={quality} preset={preset} progress={progress} dissolve={readDissolve} />;
}
