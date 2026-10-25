import { above, below, type Direction } from '../geometry/bounds';
import type { VariantSpec } from '../geometry/types';

const SEAM_Y = 0.1;
// Front face: rises from (x −0.35, seam) to (x −0.05, top), running straight back across the top.
const FRONT_SLANT: Direction = [0.9, -0.3, 0];
const FRONT_SLANT_D = -0.345;
// Right face: falls from (z 0, top) to (z 0.45, seam).
const SIDE_SLANT: Direction = [0, 1, 2];
const SIDE_SLANT_D = 1;

export const angularSlideA: VariantSpec = {
  id: 'angular-slide-a',
  code: '02',
  name: 'Angular Slide A',
  pieces: [
    { id: 'base', cells: [[below('y', SEAM_Y)]] },
    { id: 'left', cells: [[above('y', SEAM_Y), below(FRONT_SLANT, FRONT_SLANT_D)]] },
    {
      id: 'rear',
      cells: [[above('y', SEAM_Y), above(FRONT_SLANT, FRONT_SLANT_D), below(SIDE_SLANT, SIDE_SLANT_D)]],
    },
    {
      id: 'prow',
      cells: [[above('y', SEAM_Y), above(FRONT_SLANT, FRONT_SLANT_D), above(SIDE_SLANT, SIDE_SLANT_D)]],
    },
  ],
};
