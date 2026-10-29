import { describe, expect, it } from 'vitest';
import { NoBlending, ShaderMaterial } from 'three';
import { EdgeCoveragePass } from './EdgeCoverage';

describe('small-canvas coverage resolve', () => {
  it.each([[4, 1, 4], [4, 2, 2], [4, 3, 4 / 3], [1, 2, 1]])(
    'averages one physical display pixel at render ratio %s and display ratio %s',
    (renderRatio, displayRatio, span) => {
      const pass = new EdgeCoveragePass(renderRatio, displayRatio);
      const material = pass.fullscreenMaterial;
      if (!(material instanceof ShaderMaterial)) throw new Error('Coverage resolve requires a shader material');
      expect(material.uniforms.coverageSpan?.value).toBe(span);
      expect(material.defines.COVERAGE_SAMPLES).toBe(4);
      expect(material.blending).toBe(NoBlending);
      pass.dispose();
    },
  );

  it('updates the sampling footprint when the framebuffer changes size', () => {
    const pass = new EdgeCoveragePass(4, 1);
    pass.setSize(640, 320);
    expect(pass.coverageTexel.value.toArray()).toEqual([1 / 640, 1 / 320]);
    pass.setSize(320, 640);
    expect(pass.coverageTexel.value.toArray()).toEqual([1 / 320, 1 / 640]);
    pass.dispose();
  });
});
