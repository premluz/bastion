import styles from './ActivityOrb.module.css';

// The activity orbs (2026-10-28, direct request: rebuilt from aicss.dev's "Orbs" registry block, variants S1 and G1
// only for now). Compact animated indicators that say what the agent is doing without taking the thread: DOM and CSS,
// no canvas, in the ink of whatever surrounds them. Rebuilt, not copied: the colours are currentColor, the timings
// are motion tokens, and the globe's 40 dots are placed by CSS trigonometry from one animated angle instead of
// per-dot inline keyframe values.
//   S1  Thinking    a 3×3 lattice; a swell radiates out from the centre
//   S2  Processing  the same lattice; a broad band of light crosses it on the diagonal (the thinking state's orb)
//   G1  Processing  a dotted globe turning on a slight tilt
export type ActivityOrbVariant = 'S1' | 'S2' | 'G1';
export type ActivityOrbSize = 'sm' | 'md' | 'lg';

const TASKS: Record<ActivityOrbVariant, string> = { S1: 'Thinking', S2: 'Processing', G1: 'Processing' };

const LATTICE_CELLS = 9;
const GLOBE_RINGS = 5;
const DOTS_PER_RING = 8;
const range = (count: number) => Array.from({ length: count }, (_, index) => index);

export interface ActivityOrbProps {
  variant?: ActivityOrbVariant;
  size?: ActivityOrbSize;
  /** What a screen reader hears; the variant's own task ("Thinking…") by default. */
  label?: string;
  className?: string;
}

export function ActivityOrb({ variant = 'S1', size = 'md', label, className }: ActivityOrbProps) {
  return (
    <span className={className ? `${styles.root} ${className}` : styles.root} data-variant={variant} data-size={size}
      role="img" aria-label={label ?? `${TASKS[variant]}…`}>
      {variant !== 'G1'
        ? <span className={styles.lattice}>{range(LATTICE_CELLS).map((cell) => <span key={cell} className={styles.cell} />)}</span>
        : <span className={styles.globe}>
          {range(GLOBE_RINGS).map((ring) => <span key={ring} className={styles.latitude}>
            {range(DOTS_PER_RING).map((dot) => <span key={dot} className={styles.dot} />)}
          </span>)}
        </span>}
    </span>
  );
}
