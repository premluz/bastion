import { describe, expect, it } from 'vitest';
import { buildFundingScene, buildQuoteScene, parseBuyEthAmount } from './buyEthScenes';
import { ApprovalCardPropsSchema } from '../contracts/props/approval-card';
import { PurchaseDetailPropsSchema } from '../contracts/props/purchase-card';

describe('ETH demo intent and quote', () => {
  it.each([['I want to buy ETH', 800], ['buy Ethereum for $125.50', 125.5], ['Buy ETH for 1,000', 1000],
    ['show ETH history', null], ['buy BTC for $800', null], ['buy ETH for $0', null]])('parses %s', (query, amount) => {
    expect(parseBuyEthAmount(query)).toBe(amount);
  });
  it.each(['USDT', 'USDC'] as const)('keeps %s throughout the quote', (currency) => {
    const scene = buildQuoteScene(200, currency, false);
    expect(scene.layout.props?.currency).toBe(currency);
    const rows = scene.layout.children!;
    expect(rows.find((row) => row.id === 'spend')?.props?.value).toBe(`200.00 ${currency}`);
    expect(rows.find((row) => row.id === 'receive')?.props?.value).toBe('0.0745 ETH');
    rows.forEach((row) => expect(PurchaseDetailPropsSchema.safeParse(row.props).success).toBe(true));
  });
  it('validates funding and locks a confirmed quote', () => {
    expect(ApprovalCardPropsSchema.safeParse(buildFundingScene(800, null).layout.props).success).toBe(true);
    expect(buildQuoteScene(800, 'USDT', true).layout.children?.find((row) => row.id === 'confirm')?.props?.confirmed).toBe(true);
  });
});
