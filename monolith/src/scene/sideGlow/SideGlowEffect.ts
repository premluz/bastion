import { BlendFunction, Effect } from 'postprocessing';
import { Uniform, type Texture } from 'three';

// Adds the blurred all-faces emission around the silhouette. The blurred coverage (alpha) marks the
// body itself, where the glow is faded out so it reads as light in the air, not haze on the front face.
export const SIDE_GLOW_FRAGMENT = /* glsl */ `
uniform sampler2D glowMap;
uniform float strength;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (strength <= 0.0) {
    outputColor = vec4(0.0);
    return;
  }
  vec4 glow = texture2D(glowMap, uv);
  float body = smoothstep(0.3, 1.0, min(glow.a, 1.0));
  body *= body;
  // Scattered light keeps its warmth: hold the energy, pull the hue toward signal amber, so a hot,
  // near-white body still throws an amber halo rather than a desaturated olive one.
  float energy = dot(glow.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 warm = mix(glow.rgb, vec3(1.0, 0.36, 0.07) * energy * 2.4, 0.7);
  // Sub-quantum dither: a wide, dark gradient otherwise bands into rings on an 8-bit display.
  float dither = (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  outputColor = vec4(warm * strength * (1.0 - body) + dither, 0.0);
}
`;

export class SideGlowEffect extends Effect {
  private readonly glowUniform: Uniform<Texture | null>;
  private readonly strengthUniform: Uniform<number>;

  constructor() {
    const glowUniform = new Uniform<Texture | null>(null);
    const strengthUniform = new Uniform(0);
    super('SideGlowEffect', SIDE_GLOW_FRAGMENT, {
      blendFunction: BlendFunction.ADD,
      uniforms: new Map<string, Uniform>([
        ['glowMap', glowUniform],
        ['strength', strengthUniform],
      ]),
    });
    this.glowUniform = glowUniform;
    this.strengthUniform = strengthUniform;
  }

  set glowMap(texture: Texture | null) {
    this.glowUniform.value = texture;
  }

  set strength(value: number) {
    this.strengthUniform.value = value;
  }
}
