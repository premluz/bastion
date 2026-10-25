import { BastionMonolith } from '@bastion/monolith';
import type { AssemblyClock } from './useAssemblyClock';
import { MONOLITH_ORB_STATES, type MonolithOrbMood } from './monolithOrbStates';

const COMPOSITION = { kind: 'monolith', variant: 'step-angle' } as const;
// The canvas is a few dozen pixels across, so the full device ratio and the top quality tier cost almost
// nothing, and anything less shows as jagged edges and dotted cut lines at this size.
const MAX_PIXEL_RATIO = 3;

interface MonolithCanvasProps {
  mood: MonolithOrbMood;
  appearance: 'dark' | 'light';
  /** Camera zoom. The canvas is larger than the box it represents, so its glow has room to fade. */
  framing: number;
  paused?: boolean;
  /** Plays the assembly once, driven by the host; omit for the finished monolith. */
  assembly?: AssemblyClock;
}

// Default export: this is the lazy-loaded half (three.js and the renderer), kept out of the main bundle.
// Transparent: nothing sits under the monolith, and its glow adds light over whatever is behind.
export default function MonolithCanvas({ mood, appearance, framing, paused = false, assembly }: MonolithCanvasProps) {
  const sequence = assembly === undefined ? {} : { sequence: 'assemble' as const, progress: assembly.progress, onFrame: assembly.onFrame };
  return (
    <BastionMonolith
      composition={COMPOSITION}
      appearance={appearance}
      states={MONOLITH_ORB_STATES}
      state={mood}
      quality="high"
      maxPixelRatio={MAX_PIXEL_RATIO}
      interactive={false}
      framing={framing}
      paused={paused}
      transparent
      {...sequence}
    />
  );
}
