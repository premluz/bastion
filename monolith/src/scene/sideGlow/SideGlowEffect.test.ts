import { describe, expect, it } from 'vitest';
import { SIDE_GLOW_FRAGMENT } from './SideGlowEffect';

describe('side glow effect', () => {
  it('returns a transparent pixel before sampling an unset glow map at zero strength', () => {
    const guard = SIDE_GLOW_FRAGMENT.indexOf('if (strength <= 0.0)');
    const sample = SIDE_GLOW_FRAGMENT.indexOf('texture2D(glowMap, uv)');
    expect(guard).toBeGreaterThanOrEqual(0);
    expect(SIDE_GLOW_FRAGMENT.slice(guard, sample)).toContain('outputColor = vec4(0.0);');
    expect(SIDE_GLOW_FRAGMENT.slice(guard, sample)).toContain('return;');
    expect(sample).toBeGreaterThan(guard);
  });
});
