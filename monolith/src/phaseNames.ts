import { cubePhaseName, fractalPhaseName } from './fractal/assembly/fractalTimeline';
import { withRelease } from './monolith/assembly/shapeToShape';
import { phaseName } from './monolith/assembly/timeline';
import type { Composition, Sequence } from './props';

/** The label for the current moment of a sequence ("Release", "Alignment", "Stillness"…), for host UI. */
export function phaseNameFor(kind: Composition['kind'], sequence: Sequence): (progress: number) => string {
  const base = kind === 'fractal' ? fractalPhaseName : kind === 'cube' ? cubePhaseName : phaseName;
  return sequence === 'shape-to-shape' ? withRelease(base) : base;
}
