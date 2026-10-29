import { BastionMonolith, type Appearance, type MaterialFamily } from '@bastion/monolith';
import { useCallback, useRef, useState } from 'react';
import styles from './materials.module.css';

const PREVIEW_FRAMES = 8;
const COMPOSITION = { kind: 'monolith', variant: 'step-angle' } as const;
const PREVIEW = { cornerRadius: 0.04, bodyLight: 0, spill: 0.08, halo: 0.15, cutLight: 1, core: 1 } as const;

/** Freeze after shader warmup so the picker does not continually render extra scenes. */
export function MaterialPreview({ family, appearance }: { readonly family: MaterialFamily; readonly appearance: Appearance }) {
  const frames = useRef(0);
  const [paused, setPaused] = useState(false);
  const tick = useCallback(() => {
    frames.current += 1;
    if (frames.current === PREVIEW_FRAMES) setPaused(true);
  }, []);
  return (
    <div className={styles.preview} aria-hidden="true">
      <BastionMonolith composition={COMPOSITION} appearance={appearance}
        settings={{ material: { ...PREVIEW, family }, intelligence: { paused: true } }}
        interactive={false} maxPixelRatio={1} paused={paused} onFrame={tick} />
    </div>
  );
}
