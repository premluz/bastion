import { above, below, hi, type Direction } from '../geometry/bounds';
import type { VariantSpec } from '../geometry/types';

// The base steps up from LOW_Y (left) to HIGH_Y (right) along a 45° ramp between RAMP_X0 and RAMP_X1.
const LOW_Y = -0.25;
const HIGH_Y = 0.15;
const RAMP_X0 = -0.4;
const RAMP_X1 = 0;
const RAMP: Direction = [-1, 1, 0];
const RAMP_D = 0.15;
// Front face: rises from the ramp's top (x 0, HIGH_Y) to (x 0.35, top).
const RISE: Direction = [0.85, -0.35, 0];
const RISE_D = -0.0525;
// Branch: a stepped cut on the top face, from the back edge at RAMP_X0 forward to BRANCH_Z.
const BRANCH_Z = -0.3;

export const angularSlideB: VariantSpec = {
  id: 'angular-slide-b',
  code: '03',
  name: 'Angular Slide B',
  pieces: [
    {
      id: 'base',
      cells: [[below('y', LOW_Y)], [below(RAMP, RAMP_D), below('y', HIGH_Y)]],
    },
    { id: 'prow', cells: [[above(RISE, RISE_D), above('y', HIGH_Y)]] },
    {
      id: 'branch',
      cells: [
        [above('x', RAMP_X0), below('z', BRANCH_Z), below(RISE, RISE_D), above(RAMP, RAMP_D)],
        [above('y', HIGH_Y), hi('x', RAMP_X1, 1), below(RISE, RISE_D), below('z', BRANCH_Z)],
      ],
    },
    {
      id: 'upper',
      cells: [
        [below('x', RAMP_X0), above('y', LOW_Y)],
        [above('z', BRANCH_Z), above('y', LOW_Y), above(RAMP, RAMP_D), below(RISE, RISE_D)],
        [above('z', BRANCH_Z), above('y', HIGH_Y), hi('x', RAMP_X1, 1), below(RISE, RISE_D)],
      ],
    },
  ],
};
