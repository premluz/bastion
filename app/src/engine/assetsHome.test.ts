import { describe, expect, it } from 'vitest';
import { backfillForDisplay, resolveInvestmentsPeriodDelta, type PortfolioSeriesPoint } from './assetsHome';

const REAL: PortfolioSeriesPoint[] = [
  { t: '2026-09-07', price: 1000 },
  { t: '2026-09-12', price: 1100 },
];

describe('backfillForDisplay', () => {
  it('prepends weekly history and keeps every real point as given', () => {
    const result = backfillForDisplay(REAL, 'seed', 18);
    expect(result).toHaveLength(REAL.length + 18);
    expect(result.slice(-REAL.length)).toEqual(REAL);
  });

  it('runs weekly, oldest first, ending a week before the first real point', () => {
    const result = backfillForDisplay(REAL, 'seed', 4);
    const times = result.map((point) => new Date(point.t).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(times[3]! - times[2]!).toBe(7 * 86_400_000);
    expect(new Date(REAL[0]!.t).getTime() - times[3]!).toBe(7 * 86_400_000);
  });

  it('is deterministic per seed and never a data source for the delta', () => {
    expect(backfillForDisplay(REAL, 'a')).toEqual(backfillForDisplay(REAL, 'a'));
    expect(backfillForDisplay(REAL, 'a')).not.toEqual(backfillForDisplay(REAL, 'b'));
    expect(resolveInvestmentsPeriodDelta('7D', REAL)?.changeAbs).toBe(100);
  });

  it('returns the series untouched when there is nothing to anchor to', () => {
    expect(backfillForDisplay([], 'seed')).toEqual([]);
    expect(backfillForDisplay(REAL, 'seed', 0)).toBe(REAL);
  });
});
