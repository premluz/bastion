import { describe, expect, it } from 'vitest';
import { homeAccounts } from './homeAccounts';

describe('home accounts', () => {
  it('totals Money and Investments to the cent', () => {
    expect(homeAccounts(3475.45, 5445.7)).toEqual({ money: 3475.45, investments: 5445.7, total: 8921.15 });
  });

  it('adds in cents, so float drift never shows in the total', () => {
    expect(homeAccounts(0.1, 0.2).total).toBe(0.3);
  });
});
