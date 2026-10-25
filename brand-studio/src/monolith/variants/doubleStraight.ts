import { above, below } from '../geometry/bounds';
import type { VariantSpec } from '../geometry/types';

const SEAM_Y = -0.05;
const CROSS_Z = 0.25;
const NEST_X = 0.15;

export const doubleStraight: VariantSpec = {
  id: 'double-straight',
  code: '04',
  name: 'Double Straight',
  pieces: [
    { id: 'base-rear', cells: [[below('y', SEAM_Y), below('z', CROSS_Z)]] },
    { id: 'base-front', cells: [[below('y', SEAM_Y), above('z', CROSS_Z)]] },
    { id: 'rear', cells: [[above('y', SEAM_Y), below('z', CROSS_Z)]] },
    { id: 'front', cells: [[above('y', SEAM_Y), above('z', CROSS_Z), below('x', NEST_X)]] },
    { id: 'nest', cells: [[above('y', SEAM_Y), above('z', CROSS_Z), above('x', NEST_X)]] },
  ],
};
