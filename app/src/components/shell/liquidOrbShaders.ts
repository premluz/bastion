export const LIQUID_ORB_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const LIQUID_ORB_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_unbounded;
// 1 on a light theme: the orb is painted plainly over paper, not screened over a dark page.
uniform float u_lightGround;

// A soft luminous ribbon (2026-10-21, direct feedback: closer to a blurred ring of
// light, richer than copper alone): a ring whose radius is bent by slow noise and
// whose body swells and thins around it, glowing on a wide gaussian with a tighter
// hot edge on part of its inner side. Colour drifts around it between the three
// palette colours (copper, champagne, slate). Procedural and 2D — a handful of
// noise reads per pixel, far cheaper than the raymarched blob it replaces.
const float RING_RADIUS = 0.44;
const float RING_BEND = 0.05;
const float RING_WIDTH = 0.04;
const float DRIFT_SPEED = 0.32;

float hash13(vec3 point) {
  point = fract(point * 0.1031);
  point += dot(point, point.zyx + 31.32);
  return fract((point.x + point.y) * point.z);
}

float valueNoise(vec3 point) {
  vec3 cell = floor(point);
  vec3 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);
  return mix(
    mix(
      mix(hash13(cell), hash13(cell + vec3(1.0, 0.0, 0.0)), local.x),
      mix(hash13(cell + vec3(0.0, 1.0, 0.0)), hash13(cell + vec3(1.0, 1.0, 0.0)), local.x),
      local.y
    ),
    mix(
      mix(hash13(cell + vec3(0.0, 0.0, 1.0)), hash13(cell + vec3(1.0, 0.0, 1.0)), local.x),
      mix(hash13(cell + vec3(0.0, 1.0, 1.0)), hash13(cell + vec3(1.0, 1.0, 1.0)), local.x),
      local.y
    ),
    local.z
  );
}

void main() {
  vec2 point = v_uv * 2.0 - 1.0;
  point.x *= u_resolution.x / u_resolution.y;
  // The fade-out is measured on the canvas; the ribbon itself is drawn zoomed in, the
  // big feathered glow more than the small orb, so it fills what it is given.
  float canvasRadius = length(point);
  point *= mix(0.88, 0.58, u_unbounded);
  float radius = length(point);
  vec2 direction = point / max(radius, 0.0001);
  float angle = atan(direction.y, direction.x);
  float time = u_time * DRIFT_SPEED;

  // Noise on the circle of directions (seamless at the atan wrap), drifting in time.
  float bend = valueNoise(vec3(direction * 1.5, time)) - 0.5;
  float fineBend = valueNoise(vec3(direction * 3.2 + 7.0, time * 1.4)) - 0.5;
  float swell = valueNoise(vec3(direction * 1.2 + 3.0, time * 0.8));
  float heat = smoothstep(0.32, 0.7, valueNoise(vec3(direction * 2.1 + 11.0, time * 1.1)));

  // A near-round shell, its outline wobbling slowly (a little ellipse, a little noise).
  float ringRadius = RING_RADIUS + RING_BEND * (bend * 1.6 + fineBend * 0.5) + 0.03 * sin(2.0 * angle + time * 1.3) + 0.014 * sin(3.0 * angle - time * 0.9);
  float width = RING_WIDTH * (0.55 + 1.3 * swell);
  float offset = (radius - ringRadius) / width;

  float body = exp(-offset * offset * 2.2);
  // The crisp hot rim (2026-10-21, direct feedback: closer to a fiery shell): a thin bright
  // line on the outline, brightest where the noise heats it.
  float rimLine = exp(-offset * offset * 22.0) * (0.6 + 0.4 * heat);
  // The halo's width follows the noise, so it must not reach the middle (a crease there).
  float halo = 0.34 * exp(-offset * offset * 0.16) * smoothstep(0.12, 0.42, radius);
  // The hot edge hugs the ring's inner side and only lights where the noise allows.
  float inner = (radius - (ringRadius - width * 0.6)) / (width * 0.38);
  float core = exp(-inner * inner) * heat;

  // Colour drifts around the ring: each palette colour (copper, slate, champagne) owns a
  // stretch of it — three cosines a third of a turn apart, squared so one dominates
  // locally instead of averaging toward white — and the result is pushed a little richer.
  float phase = angle - time * 1.2 - bend * 3.0;
  float weightA = pow(0.5 + 0.5 * cos(phase), 2.0);
  float weightC = pow(0.5 + 0.5 * cos(phase - 2.0944), 2.0) * 0.5;
  float weightB = pow(0.5 + 0.5 * cos(phase + 2.0944), 2.0);
  vec3 tint = (u_colorA * weightA + u_colorC * weightC + u_colorB * weightB) / (weightA + weightB + weightC);
  tint = mix(vec3(dot(tint, vec3(0.299, 0.587, 0.114))), tint, 1.75);

  // The body (2026-10-21, direct feedback: a whole object, not a hollow ring): inside the
  // ribbon the same wobbly outline is filled with a soft, deeper-toned glow — the ribbon's
  // own drifting colour leaning slate toward the middle — so the bright edge reads as the
  // rim of a solid, luminous shape. A little centre falloff keeps it from going flat.
  float inside = 1.0 - smoothstep(ringRadius - width * 0.9, ringRadius + width * 0.3, radius);
  // Wisps drifting through the middle (Cartesian noise: no angle, so no seam), so it
  // reads as a glowing volume rather than a flat fill.
  float wisps = 0.55 + 0.85 * valueNoise(vec3(point * 3.1, time * 1.3));
  // (Fixed radius below: scaling by the bent one would crease the middle along the noise.)
  // Brightest just inside the rim, easing toward the middle but never dark (2026-10-21,
  // direct feedback: it read as a ring — it needs more inner fill).
  float depth = 0.55 + 0.45 * smoothstep(0.0, RING_RADIUS * 1.05, radius);
  // The ribbon's drifting colour toward the rim; a fixed copper–slate blend toward the
  // middle, where the angle (and so the drifting colour) is undefined — no pinwheel seam.
  float rim = smoothstep(RING_RADIUS * 0.45, RING_RADIUS * 1.05, radius);
  vec3 bodyTint = mix(mix(u_colorA, u_colorC, 0.18), mix(tint, u_colorC, 0.25), rim * rim);
  bodyTint = mix(vec3(dot(bodyTint, vec3(0.299, 0.587, 0.114))), bodyTint, 1.9);

  // The wide outer glow leans slate, so a warm ribbon sits in a cool atmosphere.
  // Hot, not white: the rim is the warm palette colour pushed bright, so it stays saturated.
  vec3 hot = mix(u_colorA, u_colorB, 0.5) * 1.5;
  vec3 emissive = tint * body * 0.9 + mix(tint, u_colorC, 0.22) * halo * 1.3
    + hot * (core * 0.5 + rimLine * 1.1) + bodyTint * inside * depth * wisps * 1.0;

  float peak = max(emissive.r, max(emissive.g, emissive.b));
  // Hue-preserving tone map, and everything dissolves radially so no edge ever shows. On a
  // light ground the colour keeps its full brightness and only the coverage fades: dimming
  // it too reads as a dark rim on paper (2026-10-23, direct feedback: orange, no dark shadow).
  vec3 color = emissive / mix(max(1.0, peak), max(peak, 0.0001), u_lightGround);
  float alpha = clamp(peak, 0.0, 1.0) * (1.0 - smoothstep(mix(0.7, 0.8, u_unbounded), 1.0, canvasRadius));
  // Premultiplied, to match the context (liquidOrbRenderer.ts).
  fragColor = vec4(color * alpha, alpha);
}`;
