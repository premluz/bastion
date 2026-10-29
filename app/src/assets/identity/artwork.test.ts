import { describe, expect, it } from 'vitest';
import { cryptoArtwork, fiatFlag, forexFlags, marketArtwork, requiredCryptoArtwork } from './artwork';

describe('canonical asset artwork', () => {
  it.each(['btc', 'eth', 'sol', 'usdc', 'usdt', 'xrp', 'bnb', 'xlm', 'gala', 'lsk', 'hype', 'juno', 'ksm', 'lunc'])('resolves %s without a generic mark', (id) => {
    expect(cryptoArtwork(id)?.src).toBeTruthy();
    expect(cryptoArtwork(id.toUpperCase())?.src).toBe(cryptoArtwork(id)?.src);
  });

  it.each(['USD', 'EUR', 'GBP'])('resolves the %s flag', (code) => {
    expect(fiatFlag(code)).toMatch(/^(data:image\/svg\+xml,|.+\.svg$)/);
    expect(fiatFlag(code.toLowerCase())).toBe(fiatFlag(code));
  });

  it.each(['hpe', 'dell', 'crwd', 'orcl', 'nflx', 'spx', 'ndx'])('resolves market ticker %s', (id) => {
    expect(marketArtwork(id)?.src).toBeTruthy();
    expect(marketArtwork(id.toUpperCase())?.src).toBe(marketArtwork(id)?.src);
  });

  it.each(['eurusd', 'gbpusd'])('resolves both flags for %s', (id) => {
    expect(forexFlags(id)).toHaveLength(2);
    expect(forexFlags(id)?.[1]).toBe(fiatFlag('USD'));
  });

  it('does not assign a real logo to fictional assets', () => {
    expect(cryptoArtwork('mock-crypto-0')).toBeUndefined();
    expect(cryptoArtwork('mock-covered-bond-0')).toBeUndefined();
    expect(marketArtwork('mock-credit-fund-0')).toBeUndefined();
  });

  it('fails loudly if a purchase uses unmapped art', () => {
    expect(() => requiredCryptoArtwork('unknown')).toThrow('Missing crypto artwork for unknown');
  });
});
