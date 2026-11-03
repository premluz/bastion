import { describe, expect, it } from 'vitest';
import { rollAnimationCount, rollSlots } from './rollingSlots';

const kinds = (from: string, to: string) => rollSlots(from, to).map((slot) => slot.kind[0]).join('');

describe('rollSlots', () => {
  it('pairs figures from the right: only changed digits move, the last one first', () => {
    const slots = rollSlots('$3,475.45', '$3,285.45');
    expect(slots.map((slot) => slot.kind[0]).join('')).toBe('sssrrssss');
    expect(slots.filter((slot) => slot.kind === 'roll').map((slot) => slot.order)).toEqual([1, 0]);
  });
  it('closes up the before part of a caption, leaving its outcome still', () => {
    expect(kinds('$3,475.45 → $3,285.45', '$3,285.45')).toBe('l'.repeat(12) + 's'.repeat(9));
  });
  it('masks and unmasks a balance, opening room for the longer text', () => {
    expect(kinds('••••••', '$8,921.15')).toBe('eeerrrrrr');
    expect(rollAnimationCount(rollSlots('••••••', '$8,921.15'))).toBe(3 + 6 * 2);
  });
});
