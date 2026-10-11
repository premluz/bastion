
import { useRef } from 'react';
import { useLiquidOrb } from './useLiquidOrb';
import '../../theme/glow-dock.css';
import styles from './AssistantOrb.module.css';

export type AssistantActivity = 'idle' | 'listening' | 'thinking';

export interface AssistantOrbProps {
  activity?: AssistantActivity;
  expanded?: boolean;
  /** Voice output is playing — the orb pulses as if talking. */
  speaking?: boolean;
  /**
   * `unbounded` (2026-10-10): only the morphing shader, as a soft circle of light —
   * no ring, disc, border or aura, and no clip: it dissolves into whatever is behind it.
   */
  variant?: 'bounded' | 'unbounded';
}

// App-shell decoration, not a scene node: no registry schema (§2.1/§2.14).
export function AssistantOrb({ activity = 'idle', expanded = false, speaking = false, variant = 'bounded' }: AssistantOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unbounded = variant === 'unbounded';
  const liquidSupported = useLiquidOrb(canvasRef, unbounded ? 'listening' : expanded && activity !== 'idle' ? activity : null, { unbounded });

  if (unbounded) {
    // `pending` until the shader is up, so the CSS fallback only shows where WebGL is missing.
    return (
      <span className={styles.unbounded} data-liquid={liquidSupported === null ? 'pending' : String(liquidSupported)} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.unboundedCanvas} />
      </span>
    );
  }

  return (
    <span className={styles.root} data-activity={activity} data-expanded={expanded} data-speaking={speaking ? '' : undefined} aria-hidden="true">
      {expanded && <span className={styles.aura} />}
      <span className={styles.core} data-liquid-supported={liquidSupported === true}>
        {expanded && <canvas ref={canvasRef} className={styles.liquid} data-liquid-supported={liquidSupported === true} />}
      </span>
    </span>
  );
}
