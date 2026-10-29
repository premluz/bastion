import { describe, expect, it } from 'vitest';
import { bandsOfSpectrum, rmsOfBytes, shapeValue, shapeVoice, SILENT_VOICE, VOICE_RESPONSE } from './voiceLevels';

describe('voice levels', () => {
  it('reads silence as 0 and a full-scale square wave as 1', () => {
    expect(rmsOfBytes(new Uint8Array(64).fill(128))).toBe(0);
    expect(rmsOfBytes(Uint8Array.from({ length: 64 }, (_, index) => (index % 2 === 0 ? 0 : 255)))).toBeCloseTo(1, 1);
    expect(rmsOfBytes([])).toBe(0);
  });

  it('puts energy in the band its frequencies fall in', () => {
    const binHz = 187.5;
    const spectrum = new Uint8Array(128);
    spectrum.fill(255, 0, 3);
    const lows = bandsOfSpectrum(spectrum, binHz);
    expect(lows.low).toBeGreaterThan(0.6);
    expect(lows.mid).toBe(0);
    expect(lows.high).toBe(0);
    const highs = new Uint8Array(128);
    highs.fill(255, 16, 40);
    expect(bandsOfSpectrum(highs, binHz).high).toBe(1);
  });

  it('gates quiet input, saturates loud input below 1 and never goes negative', () => {
    expect(shapeValue(0, VOICE_RESPONSE.threshold / 2, 1)).toBe(0);
    const loud = shapeValue(0, 1, 100);
    expect(loud).toBeGreaterThan(0.99);
    expect(loud).toBeLessThanOrEqual(1);
    expect(shapeValue(0.5, 0, 100)).toBeGreaterThanOrEqual(0);
  });

  it('rises faster than it settles', () => {
    const up = shapeValue(0, 0.5, 0.05);
    const down = 0.5 - shapeValue(0.5, 0, 0.05);
    expect(up / (1 - Math.exp(-0.5 * VOICE_RESPONSE.sensitivity * 2))).toBeGreaterThan(down / 0.5);
  });

  it('shapes all four values together', () => {
    const next = shapeVoice(SILENT_VOICE, { level: 0.4, low: 0.4, mid: 0.2, high: 0 }, 0.1);
    expect(next.level).toBeGreaterThan(0);
    expect(next.low).toBeGreaterThan(next.mid);
    expect(next.high).toBe(0);
  });
});
