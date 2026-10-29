import { ShaderPass } from 'postprocessing';
import { NoBlending, ShaderMaterial, Uniform, WebGLRenderer, WebGLRenderTarget } from 'three';
import { EdgeCoveragePass } from './EdgeCoverage';

const DISPLAY_SIZE = 32;
const RENDER_RATIO = 4;
const CHANNEL_MAX = 255;
const FRAGMENT = /* glsl */ `
uniform int pattern;
varying vec2 coverageUv;
void main() {
  float diagonal = coverageUv.x + coverageUv.y * 0.37 - 0.55;
  float alpha = pattern == 0 ? step(diagonal, 0.0) : 1.0;
  float light = pattern == 1 ? step(0.012, abs(diagonal)) : 1.0;
  gl_FragColor = vec4(vec3(light * alpha), alpha);
}
`;

function readCoverage(renderer: WebGLRenderer) {
  const pixels = new Uint8Array(DISPLAY_SIZE * DISPLAY_SIZE * 4);
  const gl = renderer.getContext();
  gl.readPixels(0, 0, DISPLAY_SIZE, DISPLAY_SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let partialAlpha = 0;
  let partialLight = 0;
  let visible = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] ?? 0;
    const light = pixels[index] ?? 0;
    if (alpha > 0) visible++;
    if (alpha > 0 && alpha < CHANNEL_MAX) partialAlpha++;
    if (alpha === CHANNEL_MAX && light > 0 && light < CHANNEL_MAX) partialLight++;
  }
  return { partialAlpha, partialLight, visible };
}

/** Controlled binary inputs distinguish true coverage averaging from merely increasing canvas size. */
export function probeEdgeCoverage() {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false });
  renderer.setSize(DISPLAY_SIZE, DISPLAY_SIZE);
  const resolve = new EdgeCoveragePass(RENDER_RATIO, 1);
  const shader = resolve.fullscreenMaterial;
  if (!(shader instanceof ShaderMaterial)) throw new Error('Coverage probe requires a shader pass');
  const pattern = new Uniform(0);
  const source = new ShaderPass(new ShaderMaterial({ vertexShader: shader.vertexShader,
    fragmentShader: FRAGMENT, uniforms: { pattern }, blending: NoBlending, depthTest: false, depthWrite: false }));
  const target = new WebGLRenderTarget(DISPLAY_SIZE * RENDER_RATIO, DISPLAY_SIZE * RENDER_RATIO);
  resolve.setSize(target.width, target.height);
  resolve.renderToScreen = true;
  try {
    return [0, 1].map((value) => {
      pattern.value = value;
      source.renderToScreen = true;
      source.render(renderer, null, null);
      const unfiltered = readCoverage(renderer);
      source.renderToScreen = false;
      source.render(renderer, null, target);
      resolve.render(renderer, target, null);
      return { unfiltered, filtered: readCoverage(renderer) };
    });
  } finally {
    source.dispose();
    resolve.dispose();
    target.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
