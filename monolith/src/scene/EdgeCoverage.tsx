import { useThree } from '@react-three/fiber';
import { ShaderPass } from 'postprocessing';
import { useEffect, useMemo } from 'react';
import { NoBlending, ShaderMaterial, Uniform, Vector2 } from 'three';

const COVERAGE_SAMPLES = 4;
const VERTEX = /* glsl */ `
varying vec2 coverageUv;
void main() {
  coverageUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
const FRAGMENT = /* glsl */ `
uniform sampler2D inputBuffer;
uniform vec2 coverageTexel;
uniform float coverageSpan;
varying vec2 coverageUv;
void main() {
  vec4 coverage = vec4(0.0);
  for (int y = 0; y < COVERAGE_SAMPLES; y++) {
    for (int x = 0; x < COVERAGE_SAMPLES; x++) {
      vec2 offset = (vec2(float(x), float(y)) + 0.5) / float(COVERAGE_SAMPLES) - 0.5;
      vec4 sampleColor = texture2D(inputBuffer, coverageUv + offset * coverageTexel * coverageSpan);
      // Resolve in display space, keeping every sample valid for premultiplied canvas compositing.
      vec3 displayColor = sampleColor.a > 0.0
        ? sRGBTransferOETF(vec4(clamp(sampleColor.rgb / sampleColor.a, 0.0, 1.0), sampleColor.a)).rgb * sampleColor.a
        : vec3(0.0);
      coverage += vec4(displayColor, sampleColor.a);
    }
  }
  gl_FragColor = coverage / float(COVERAGE_SAMPLES * COVERAGE_SAMPLES);
}
`;

/** Last pass: the browser's bilinear downscale can otherwise miss most supersamples. */
export class EdgeCoveragePass extends ShaderPass {
  readonly coverageTexel = new Uniform(new Vector2());

  constructor(renderRatio: number, displayRatio: number) {
    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      defines: { COVERAGE_SAMPLES },
      uniforms: {
        inputBuffer: new Uniform(null),
        coverageSpan: new Uniform(Math.max(1, renderRatio / displayRatio)),
      },
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
    });
    super(material);
    material.uniforms.coverageTexel = this.coverageTexel;
  }

  override setSize(width: number, height: number) {
    this.coverageTexel.value.set(1 / width, 1 / height);
  }
}

export function EdgeCoverage() {
  const renderRatio = useThree((state) => state.viewport.dpr);
  const displayRatio = window.devicePixelRatio;
  const pass = useMemo(() => new EdgeCoveragePass(renderRatio, displayRatio), [renderRatio, displayRatio]);
  useEffect(() => () => pass.dispose(), [pass]);
  return <primitive object={pass} />;
}
