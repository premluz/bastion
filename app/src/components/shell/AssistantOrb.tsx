
import { useRef } from 'react';
import { useLiquidOrb } from './useLiquidOrb';
import styles from './AssistantOrb.module.css';

export type AssistantActivity = 'idle' | 'listening' | 'thinking';

export interface AssistantOrbProps {
  activity?: AssistantActivity;
  expanded?: boolean;
  /** Voice output is playing — the orb pulses as if talking. */
  speaking?: boolean;
}

// App-shell decoration, not a scene node: no registry schema (§2.1/§2.14).
export function AssistantOrb({ activity = 'idle', expanded = false, speaking = false }: AssistantOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liquidSupported = useLiquidOrb(canvasRef, expanded && activity !== 'idle' ? activity : null);

  return (
    <span className={styles.root} data-activity={activity} data-expanded={expanded} data-speaking={speaking ? '' : undefined} aria-hidden="true">
      {expanded && <span className={styles.aura} />}
      <span className={styles.core} data-liquid-supported={liquidSupported === true}>
        {expanded && <canvas ref={canvasRef} className={styles.liquid} data-liquid-supported={liquidSupported === true} />}
      </span>
    </span>
  );
}
