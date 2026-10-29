import { describe, expect, it } from 'vitest';
import { FRAGMENT_EMISSION, FRAGMENT_HEADER } from './ceramicShader';

describe('ceramic shader transitions', () => {
  it('uses defined ascending smoothstep edges for both the core field and materialization', () => {
    expect(FRAGMENT_HEADER).toContain('1.0 - smoothstep(uReveal - 0.8, uReveal + 0.8, r)');
    expect(FRAGMENT_EMISSION).toContain('1.0 - smoothstep(uDissolve, uDissolve + 0.05, bsGrain)');
  });
});
