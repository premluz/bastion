import { above, below, type Direction } from '../geometry/bounds';
import type { VariantSpec } from '../geometry/types';

const SEAM_Y = 0.1;
const STEP_X = -0.1;
const STEP_Z = -0.2;
const STRIP_X = 0.55;
// Diagonal on the right face: from the top edge near the back down to the bottom edge mid-face.
const DIAGONAL: Direction = [0, 0.5, 1];
const DIAGONAL_D = -0.35;

export const stepAngle: VariantSpec = {
  id: 'step-angle',
  code: '01',
  name: 'Step & Angle',
  pieces: [
    {
      id: 'upper',
      cells: [
        [below('x', STEP_X), above('y', SEAM_Y)],
        [above('z', STEP_Z), above('y', SEAM_Y)],
        [above('x', STRIP_X), above(DIAGONAL, DIAGONAL_D), above('y', SEAM_Y)],
      ],
    },
    {
      id: 'notch',
      cells: [[above('x', STEP_X), below('x', STRIP_X), below('z', STEP_Z), above('y', SEAM_Y)]],
    },
    {
      id: 'wedge',
      cells: [[above('x', STRIP_X), below(DIAGONAL, DIAGONAL_D)]],
    },
    {
      id: 'base',
      cells: [
        [below('y', SEAM_Y), below('x', STRIP_X)],
        [below('y', SEAM_Y), above(DIAGONAL, DIAGONAL_D)],
      ],
    },
  ],
};
