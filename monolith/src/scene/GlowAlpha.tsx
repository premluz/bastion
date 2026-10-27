import { BlendFunction, Effect } from 'postprocessing';
import { useMemo } from 'react';

// On a transparent canvas the glow is colour written where nothing was drawn: alpha 0 with rgb above
// it, which is not a valid premultiplied pixel. Chromium adds it as light; WebKit (Safari, the iOS
// shell) treats it as near-opaque colour, so a light-ground glow showed as a flat pale disc with a
// hard edge where the bloom ran out (2026-10-27, direct feedback). Last in the chain: coverage is
// raised to at least the colour it carries, so every browser composites the glow the same, softly.
// The bloom's far tail is a faint wash over the whole canvas; given coverage it would show the canvas's
// square edge, so off the body it fades to nothing below a few 8-bit steps.
const FRAGMENT = /* glsl */ `
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = clamp(inputColor.rgb, 0.0, 1.0);
  float light = max(color.r, max(color.g, color.b));
  float air = 1.0 - clamp(inputColor.a, 0.0, 1.0);
  float keep = mix(1.0, smoothstep(0.012, 0.06, light), air);
  color *= keep;
  outputColor = vec4(color, max(inputColor.a, light * keep));
}
`;

class GlowAlphaEffect extends Effect {
  constructor() {
    super('GlowAlphaEffect', FRAGMENT, { blendFunction: BlendFunction.SET });
  }
}

/** Must sit inside the EffectComposer, after tone mapping; only for a transparent canvas. */
export function GlowAlpha() {
  const effect = useMemo(() => new GlowAlphaEffect(), []);
  return <primitive object={effect} dispose={null} />;
}
