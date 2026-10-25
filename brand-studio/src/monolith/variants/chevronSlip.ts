import { above, below, type Direction } from '../geometry/bounds';
import type { VariantSpec } from '../geometry/types';

// One plane tilted down toward the front corner, so it reads as a chevron on the two front faces.
const CHEVRON: Direction = [0.13, 1, 0.13];
const CHEVRON_D = 0.66;

export const chevronSlip: VariantSpec = {
  id: 'chevron-slip',
  code: '05',
  name: 'Chevron Slip',
  pieces: [
    { id: 'cap', cells: [[above(CHEVRON, CHEVRON_D)]] },
    { id: 'body', cells: [[below(CHEVRON, CHEVRON_D)]] },
  ],
};
