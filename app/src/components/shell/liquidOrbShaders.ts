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

const float VIEW_SCALE = 0.58;
const float MORPH_SPEED = 1.3;
const float DEFORM_STRENGTH = 0.045;

mat2 rotate(float angle) {
  float cosine = cos(angle);
  float sine = sin(angle);
  return mat2(cosine, -sine, sine, cosine);
}

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

float fractalNoise(vec3 point) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int index = 0; index < 2; index++) {
    value += amplitude * valueNoise(point);
    point *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

float liquidField(vec3 point) {
  float time = u_time;
  point *= 2.2;
  point.xy *= rotate(time * 0.15);
  point.yz *= rotate(time * 0.10);
  vec3 warp = vec3(
    fractalNoise(point + time * 0.2),
    fractalNoise(point + vec3(4.3, 1.2, -time * 0.15)),
    fractalNoise(point.zxy + vec3(7.7, 2.3, time * 0.10))
  );
  return fractalNoise(point + 1.8 * warp);
}

float blobField(vec3 point) {
  float time = u_time * MORPH_SPEED;
  float lobes = 0.0;
  lobes += sin(point.x * 5.2 + time);
  lobes += sin(point.y * 5.8 - time * 0.8 + 1.3);
  lobes += sin(point.z * 6.4 + time * 1.2 + 2.7);
  lobes += sin((point.x + point.z) * 4.4 - time * 0.9 + 4.1);
  lobes += sin((point.y - point.x) * 4.8 + time * 0.7 + 0.6);
  return lobes * DEFORM_STRENGTH;
}

float mapBlob(vec3 point) {
  float time = u_time * 0.18;
  point.xy *= rotate(time * 0.7);
  point.yz *= rotate(time * 0.5);
  return length(point) - 0.72 - blobField(point);
}

vec3 normalAt(vec3 point) {
  vec2 epsilon = vec2(0.0015, 0.0);
  return normalize(vec3(
    mapBlob(point + epsilon.xyy) - mapBlob(point - epsilon.xyy),
    mapBlob(point + epsilon.yxy) - mapBlob(point - epsilon.yxy),
    mapBlob(point + epsilon.yyx) - mapBlob(point - epsilon.yyx)
  ));
}

void main() {
  vec2 point = (v_uv * 2.0 - 1.0) * VIEW_SCALE;
  point.x *= u_resolution.x / u_resolution.y;

  vec3 rayOrigin = vec3(0.0, 0.0, 3.0);
  vec3 rayDirection = normalize(vec3(point, -1.8));
  float distanceAlongRay = 0.0;
  float closestDistance = 1e3;
  vec3 hitPoint = rayOrigin;
  bool hit = false;

  for (int index = 0; index < 48; index++) {
    hitPoint = rayOrigin + rayDirection * distanceAlongRay;
    float distanceToSurface = mapBlob(hitPoint);
    closestDistance = min(closestDistance, distanceToSurface);
    if (distanceToSurface < 0.001) {
      hit = true;
      break;
    }
    distanceAlongRay += distanceToSurface * 0.40;
    if (distanceAlongRay > 6.0) break;
  }

  vec3 emissive = vec3(0.0);
  if (hit) {
    vec3 normal = normalAt(hitPoint);
    vec3 view = -rayDirection;
    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.0);
    vec3 liquidPoint = hitPoint + rayDirection * 0.04;
    float transmission = 1.0;
    vec3 liquid = vec3(0.0);

    for (int index = 0; index < 5; index++) {
      float raw = liquidField(liquidPoint);
      float density = smoothstep(0.20, 0.58, raw);
      float filament = pow(1.0 - abs(2.0 * raw - 1.0), 3.0);
      vec3 color = mix(u_colorB, u_colorA,
        0.5 + 0.5 * sin(raw * 6.0 + u_time * 0.3 + liquidPoint.y * 2.5));
      vec3 emission = color * density * 0.55
        + color * filament * 1.4
        + vec3(1.0) * pow(filament, 3.0) * 0.85;
      emission += u_colorA * smoothstep(0.5, 0.0, length(liquidPoint)) * 0.3;
      liquid += transmission * emission * 0.28;
      transmission *= 0.84;
      liquidPoint += rayDirection * 0.11;
      if (length(liquidPoint) > 1.0) break;
    }

    vec3 light = normalize(vec3(0.6, 0.85, 0.6));
    float diffuse = max(dot(normal, light), 0.0);
    emissive += mix(u_colorA, u_colorB, 0.7 + diffuse * 0.3)
      * (0.45 + diffuse * 0.45) * (1.0 - fresnel * 0.35);
    emissive += liquid * (1.0 - fresnel * 0.6) * 1.25;
    emissive += mix(u_colorB, u_colorA, 0.5 + 0.5 * (normal.x * 0.7 + normal.y * 0.45)) * fresnel * 1.3;
    vec3 halfVector = normalize(light + view);
    emissive += vec3(1.0) * pow(max(dot(normal, halfVector), 0.0), 140.0) * 2.0;
    vec3 fillLight = normalize(vec3(-0.7, 0.25, 0.55));
    vec3 fillHalf = normalize(fillLight + view);
    emissive += u_colorB * pow(max(dot(normal, fillHalf), 0.0), 64.0) * 1.2;
  } else {
    float glow = exp(-closestDistance * 5.5);
    float angle = atan(rayDirection.y, rayDirection.x);
    vec3 glowColor = mix(u_colorA, u_colorB, 0.5 + 0.5 * sin(angle * 3.0 + u_time * 0.5));
    emissive += glowColor * glow * 1.6 + u_colorB * pow(glow, 3.0) * 0.8;
  }

  float alpha = clamp(max(emissive.r, max(emissive.g, emissive.b)), 0.0, 1.0);
  vec3 color = emissive / (1.0 + emissive);
  fragColor = vec4(color, alpha);
}`;
