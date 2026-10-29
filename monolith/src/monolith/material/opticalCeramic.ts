import { AdditiveBlending, Color, DoubleSide, MeshPhysicalMaterial, Vector3, Vector4, type IUniform, type Material } from 'three';
import type { Segment } from '../geometry/types';
import { MAX_MOTES } from '../intelligence/field';
import { MAX_OPENINGS } from '../limits';
import {
  FRAGMENT_COLOR,
  FRAGMENT_DISSOLVE,
  FRAGMENT_EMISSION,
  FRAGMENT_HEADER,
  FRAGMENT_ROUGHNESS,
  PALE_PLASMA,
  VERTEX_BODY,
  VERTEX_HEADER,
} from './ceramicShader';
import { FRAGMENT_CLEARCOAT_FACING, FRAGMENT_FACING } from './facingShader';
import { OPTICAL_FILM, OPTICAL_FILM_HEADER } from './opticalFilm';
import { REFERENCE_HEADER, REFERENCE_EMISSION, referenceTransmission } from './referenceOptics';
import { SEAM_LIGHT_HEADER } from './seamLight';

export interface CeramicUniforms {
  readonly uSeamTuning: IUniform<Vector4>;
  readonly uOpticalProfile: IUniform<Vector4>;
  readonly uFilmVariation: IUniform<number>;
  readonly [name: string]: IUniform;
  readonly uSegA: IUniform<Vector3[]>;
  readonly uSegB: IUniform<Vector3[]>;
  readonly uSegCount: IUniform<number>;
  readonly uAmber: IUniform<Color>;
  readonly uEdgeColor: IUniform<Color>;
  readonly uGlow: IUniform<number>;
  readonly uCore: IUniform<number>;
  readonly uCutLight: IUniform<number>;
  readonly uSpill: IUniform<number>;
  readonly uDiffusion: IUniform<number>;
  readonly uAbsorption: IUniform<number>;
  readonly uFalloff: IUniform<number>;
  readonly uEdge: IUniform<number>;
  readonly uWall: IUniform<number>;
  readonly uJunction: IUniform<Vector3>;
  readonly uCoreGlow: IUniform<number>;
  readonly uMotes: IUniform<Vector4[]>;
  readonly uMoteSpread: IUniform<number>;
  readonly uFieldBase: IUniform<number>;
  readonly uReveal: IUniform<number>;
  readonly uImpulse: IUniform<Vector3>;
  readonly uOpen: IUniform<number>;
  readonly uDissolve: IUniform<number>;
  readonly uGrainScale: IUniform<number>;
  readonly uGrainAmount: IUniform<number>;
  readonly uIncandescence: IUniform<number>;
  readonly uDrift: IUniform<number>;
  readonly uLightGround: IUniform<number>;
  readonly uStain: IUniform<number>;
  readonly uFlow: IUniform<Vector4>;
  readonly uPlasmaShape: IUniform<Vector3>;
  readonly uExterior: IUniform<number>;
  readonly uEdgeLight: IUniform<number>;
  readonly uBodyLight: IUniform<number>;
  readonly uPaleWarmth: IUniform<number>;
}

export function createCeramicUniforms(openings: readonly Segment[]): CeramicUniforms {
  if (openings.length > MAX_OPENINGS) {
    throw new Error(`Piece has ${openings.length} slot openings; the shader holds ${MAX_OPENINGS}`);
  }
  const pad = (pick: 0 | 1): Vector3[] =>
    Array.from({ length: MAX_OPENINGS }, (_, i) => {
      const p = openings[i]?.[pick];
      return p === undefined ? new Vector3() : new Vector3(p[0], p[1], p[2]);
    });
  return {
    uOpticalProfile: { value: new Vector4() },
    uSeamTuning: { value: new Vector4(1, 1, 1, 1) },
    uFilmVariation: { value: 0 },
    uSegA: { value: pad(0) },
    uSegB: { value: pad(1) },
    uSegCount: { value: openings.length },
    uAmber: { value: new Color() },
    uEdgeColor: { value: new Color() },
    uGlow: { value: 0 },
    uCore: { value: 1 },
    uCutLight: { value: 1 },
    uSpill: { value: 0 },
    uDiffusion: { value: 0.03 },
    uAbsorption: { value: 0.5 },
    uFalloff: { value: 2 },
    uEdge: { value: 0 },
    uWall: { value: 1 },
    uJunction: { value: new Vector3() },
    uCoreGlow: { value: 0 },
    uMotes: { value: Array.from({ length: MAX_MOTES }, () => new Vector4()) },
    uMoteSpread: { value: 0.2 },
    uFieldBase: { value: 0 },
    uReveal: { value: 0 },
    uImpulse: { value: new Vector3() },
    uOpen: { value: 0 },
    uDissolve: { value: 0 },
    uGrainScale: { value: 1400 },
    uGrainAmount: { value: 0.5 },
    uIncandescence: { value: 0 },
    uDrift: { value: 0 },
    uLightGround: { value: 0 },
    uStain: { value: 0 },
    uFlow: { value: new Vector4() },
    uPlasmaShape: { value: new Vector3(0.5, 0.5, 0) },
    uExterior: { value: 1 },
    uEdgeLight: { value: 0 },
    uBodyLight: { value: 0 },
    uPaleWarmth: { value: 0 },
  };
}

export type CeramicSurface = 'skin' | 'wall';

/** scene — the normal shaded surface; glow — emission only, every face, no depth, accumulated. */
export type CeramicPass = 'scene' | 'glow';

const SOURCES = new WeakMap<Material, { surface: CeramicSurface; uniforms: CeramicUniforms }>();

/** The surface and live uniforms behind a scene ceramic material, so a glow pass can mirror it. */
export const ceramicSource = (material: Material) => SOURCES.get(material);

/** Emission written straight out — the light each face sends into the room, visible or not. */
const FRAGMENT_GLOW_OUT = /* glsl */ `
// Pale warmth: on a light ground the body reads as amber glass where its inner light reaches, filtering the cream behind
// and the light it reflects; where the light is low the body keeps its own pale colour.
gl_FragColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.6, 0.36), uPaleWarmth * uLightGround * bsWarmHere);
// The moving patch must survive frosted transmission and studio lighting without tinting untouched ceramic.
gl_FragColor.rgb *= mix(vec3(1.0), uAmber, clamp(bsPatchHere * uLightGround * ${PALE_PLASMA.postTint}, 0.0, 1.0));
#ifdef BS_GLOW_PASS
gl_FragColor = vec4(totalEmissiveRadiance, 1.0);
#endif
`;

export function createCeramicMaterial(
  surface: CeramicSurface,
  uniforms: CeramicUniforms,
  pass: CeramicPass = 'scene',
): MeshPhysicalMaterial {
  const material = new MeshPhysicalMaterial({
    metalness: 0.02,
    clearcoat: 0.1,
    clearcoatRoughness: 0.5,
  });
  // Add to three's own defines (STANDARD, PHYSICAL) — replacing them silently disables the physical features.
  material.defines = {
    ...material.defines,
    MAX_OPENINGS: String(MAX_OPENINGS),
    MAX_MOTES: String(MAX_MOTES),
    ...(surface === 'wall' ? { BS_WALL: '' } : {}),
    ...(pass === 'glow' ? { BS_GLOW_PASS: '' } : {}),
  };
  if (pass === 'glow') {
    material.side = DoubleSide;
    material.depthTest = false;
    material.depthWrite = false;
    material.transparent = true;
    material.blending = AdditiveBlending;
  } else {
    SOURCES.set(material, { surface, uniforms });
  }
  material.customProgramCacheKey = () => `bastion-ceramic-${surface}-${pass}`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = inject(shader.vertexShader, '#include <common>', VERTEX_HEADER);
    shader.vertexShader = inject(shader.vertexShader, '#include <begin_vertex>', VERTEX_BODY);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <common>', FRAGMENT_HEADER);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <common>', OPTICAL_FILM_HEADER);
    shader.fragmentShader = shader.fragmentShader.replace(FRAGMENT_HEADER, `${FRAGMENT_HEADER}\n${REFERENCE_HEADER}\n${SEAM_LIGHT_HEADER}`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <transmission_fragment>', referenceTransmission());
    shader.fragmentShader = inject(shader.fragmentShader, '#include <lights_physical_fragment>', OPTICAL_FILM);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <clipping_planes_fragment>', FRAGMENT_DISSOLVE);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <color_fragment>', FRAGMENT_COLOR);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <roughnessmap_fragment>', FRAGMENT_ROUGHNESS);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <normal_fragment_maps>', FRAGMENT_FACING);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <clearcoat_normal_fragment_maps>', FRAGMENT_CLEARCOAT_FACING);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <emissivemap_fragment>',
      `if (uOpticalProfile.x > 0.5) { ${REFERENCE_EMISSION} } else { ${FRAGMENT_EMISSION} }`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <opaque_fragment>', FRAGMENT_GLOW_OUT);
  };
  return material;
}

function inject(source: string, anchor: string, code: string): string {
  if (!source.includes(anchor)) throw new Error(`Ceramic shader anchor "${anchor}" not found in three.js shader`);
  return source.replace(anchor, `${anchor}\n${code}`);
}
