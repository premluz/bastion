import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from './settings';
import { DEFAULT_STATES, easeSettings, mergeSettings, resolveState } from './states';

describe('states', () => {
  it('merges defaults ← host settings ← state, each part separately', () => {
    const merged = mergeSettings({ material: { core: 0.2, spill: 0.5 } }, DEFAULT_STATES.thinking);
    expect(merged.material.core).toBe(0.2);
    expect(merged.material.spill).toBe(0.5);
    expect(merged.material.halo).toBe(0.3);
    expect(merged.intelligence.mode).toBe('thinking');
    expect(merged.material.roughness).toBe(DEFAULT_SETTINGS.material.roughness);
  });

  it('resolves named and inline states, and fails loudly on an unknown name', () => {
    expect(resolveState('idle')).toBe(DEFAULT_STATES.idle);
    expect(resolveState({ material: { halo: 1 } })).toEqual({ material: { halo: 1 } });
    expect(resolveState(undefined)).toBeUndefined();
    expect(() => resolveState('nope')).toThrow(/Unknown monolith state "nope"/);
  });

  it('eases numbers gradually, never in one step, and adopts discrete values at once', () => {
    const target = mergeSettings({ material: { core: 1, halo: 0.9, glowMode: 'incandescent', cutWidth: 0.06 } });
    let current = DEFAULT_SETTINGS;
    const start = current.material.core;
    let largest = 0;
    for (let i = 0; i < 600; i += 1) {
      const next = easeSettings(current, target, 1 / 60);
      largest = Math.max(largest, Math.abs(next.material.core - current.material.core));
      current = next;
    }
    // An exponential approach moves 1 − e^(−rate·dt) of the remaining distance on its first step: 6.4% here.
    expect(largest / Math.abs(1 - start)).toBeLessThan(0.08);
    expect(current.material.core).toBeCloseTo(1, 2);
    const first = easeSettings(DEFAULT_SETTINGS, target, 1 / 60);
    expect(first.material.glowMode).toBe('incandescent');
    expect(first.material.cutWidth).toBe(0.06);
    expect(first.material.core).toBeGreaterThan(start);
    expect(first.material.core).toBeLessThan(start + 0.08 * (1 - start));
  });

  it('is frame-rate independent', () => {
    const target = mergeSettings({ material: { core: 1 } });
    const run = (fps: number): number => {
      let current = DEFAULT_SETTINGS;
      for (let i = 0; i < fps; i += 1) current = easeSettings(current, target, 1 / fps);
      return current.material.core;
    };
    expect(run(30)).toBeCloseTo(run(144), 3);
  });
});
