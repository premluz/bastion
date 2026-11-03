/* The chat sweep's band (2026-10-31, direct request with a reference). Ported from glimm 0.3.1's fragment shader
   (src/core/shader, the sweep's band, foil hue and crest highlight), with its defaults baked in and its cosine palette
   replaced by a cycle through three theme colours, so the colours stay in the token cascade. Licence below.

   MIT License

   Copyright (c) 2026 Noman Ijaz - iamnoman.com

   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
   documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
   rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
   persons to whom the Software is furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
   Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
   WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
   COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

/** The band's travel: off the bottom edge to off the top, as the home's contents leave bottom-up. */
export const SWEEP_START = -0.2;
export const SWEEP_END = 1.2;

export const CHAT_SWEEP_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_strength;
uniform float u_progress;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;

// glimm's defaults: band tightness 14, swell .55, ripple and speed 1. The edge's wave is Bastion's own (below).
const float BAND_TIGHT = 14.0;
// The crest bows like the reference (its middle leads, its sides trail) and two slow waves run along it, so the band
// reads as liquid, not a ruler (2026-10-31, direct feedback: "shader-like waving, like the reference"). In screen heights.
const float BOW = 0.05;
const float WAVE = 0.022;
const float RIPPLE_WAVE = 0.01;
const float SWELL = 0.55;
const float POS_START = ${SWEEP_START.toFixed(1)};
const float POS_END = ${SWEEP_END.toFixed(1)};

// The three theme colours as one loop, eased between stops so no stop reads as a seam.
vec3 chain(float t) {
  float s = fract(t) * 3.0;
  float f = smoothstep(0.0, 1.0, fract(s));
  if (s < 1.0) return mix(u_colorA, u_colorB, f);
  if (s < 2.0) return mix(u_colorB, u_colorC, f);
  return mix(u_colorC, u_colorA, f);
}

void main() {
  // Bottom to top (2026-10-31, direct feedback: up, with the contents leaving bottom-up).
  float axis = v_uv.y;
  float cross = v_uv.x;
  float pos = POS_START + u_progress * (POS_END - POS_START);

  float bow = (sin(cross * 3.14159265) - 0.5) * BOW;
  float wave = sin(cross * 5.0 - u_time * 3.0) * WAVE + sin(cross * 9.0 + u_time * 2.1 + 1.3) * RIPPLE_WAVE;
  // Measured in screen widths, so the band keeps the reference's thickness on a tall screen.
  float d = ((axis - pos) - bow - wave) * (u_resolution.y / u_resolution.x);
  float band = exp(-d * d * BAND_TIGHT);

  // Slope of the band along its travel only, as a surface normal: the hue turns with it (the foil).
  float slope = -2.0 * d * BAND_TIGHT * band;
  vec3 N = normalize(vec3(-slope * 0.18, 0.0, 1.0));

  // A short, faint wake behind the crest; a soft halo strongest mid-travel.
  float behind = max(-d, 0.0);
  float trail = smoothstep(0.0, 0.08, behind) * (1.0 - smoothstep(0.12, 0.65, behind)) * 0.10;
  float halo = exp(-d * d * 2.5) * 0.05 * 4.0 * u_progress * (1.0 - u_progress);
  float intensity = clamp(max(band, trail) + halo * (1.0 - band), 0.0, 1.0);

  float ripple = sin(cross * 12.0 + axis * 3.0 + u_time * 0.40) * 0.015;
  float t = N.x * 0.12 + axis * 0.90 + cross * 0.16 + ripple + u_time * 0.04;
  // Low-passed across neighbouring hues, so they flow instead of forming lanes.
  vec3 col = chain(t) * 0.50 + chain(t - 0.18) * 0.25 + chain(t + 0.18) * 0.25;

  // A fixed key light: a highlight that travels across the crest with the band.
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(normalize(vec3(0.35, 0.55, 0.9)) + V);
  float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  float spec = pow(clamp(dot(N, H), 0.0, 1.0), 80.0);

  // Faint as it enters and leaves the screen, full at mid-travel, so it never pops in at strength.
  float entry = mix(0.2, 1.0, 4.0 * u_progress * (1.0 - u_progress));
  float bodyA = intensity * entry;
  float highMask = band * entry * SWELL;
  vec3 highEmit = (col * fresnel * 0.55 + vec3(spec) * 1.1) * highMask;
  float highA = (fresnel * 0.4 + spec * 0.9) * highMask;
  // Premultiplied: WebKit composites a canvas wrongly otherwise (liquidOrbRenderer.ts).
  // Strength scales the whole premultiplied colour: the band stays the same shape, only quieter.
  outColor = vec4(col * bodyA + highEmit, min(bodyA + highA, 1.0)) * u_strength;
}`;
