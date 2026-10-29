import { BastionMonolith } from '@bastion/monolith';
import type { AssemblyClock } from './useAssemblyClock';
import { MONOLITH_ORB_STATES, monolithOrbState, type MonolithOrbMood } from './monolithOrbStates';
import { dockCubeTurn } from './dockCubeTurn';

const COMPOSITION = { kind: 'monolith', variant: 'step-angle' } as const;
// Cube assembly rotates the signature monolith pieces rather than replacing their cuts.
const CUBE_COMPOSITION = { ...COMPOSITION, assembly: 'cube' } as const;
// Thin moving cuts need subpixel coverage even on a 1× display; the tiny canvas can afford supersampling.
const RENDER_PIXEL_RATIO = 4;
const MAX_PIXEL_RATIO = 3;

interface MonolithCanvasProps {
  mood: MonolithOrbMood;
  appearance: 'dark' | 'light';
  /** Camera zoom. The canvas is larger than the box it represents, so its glow has room to fade. */
  framing: number;
  paused?: boolean;
  /** Plays the assembly once, driven by the host; omit for the finished monolith. */
  assembly?: AssemblyClock;
  turnWithDock?: boolean;
  cubeAssembly?: boolean;
}

// Default export: this is the lazy-loaded half (three.js and the renderer), kept out of the main bundle.
// Transparent: nothing sits under the monolith, and its glow adds light over whatever is behind.
export default function MonolithCanvas({ mood, appearance, framing, paused = false, assembly, turnWithDock = false, cubeAssembly = false }: MonolithCanvasProps) {
  const sequence = assembly === undefined ? {} : { sequence: cubeAssembly ? 'shape-to-shape' as const : 'assemble' as const, progress: assembly.progress, onFrame: assembly.onFrame };
  const rotation = turnWithDock ? { rotationY: dockCubeTurn } : {};
  const resolution = turnWithDock ? { pixelRatio: RENDER_PIXEL_RATIO } : { maxPixelRatio: MAX_PIXEL_RATIO };
  return (
    <BastionMonolith
      composition={cubeAssembly ? CUBE_COMPOSITION : COMPOSITION}
      appearance={appearance}
      states={MONOLITH_ORB_STATES}
      state={monolithOrbState(mood, appearance)}
      quality="high"
      interactive={false}
      framing={framing}
      paused={paused}
      transparent
      {...sequence}
      {...rotation}
      {...resolution}
    />
  );
}
