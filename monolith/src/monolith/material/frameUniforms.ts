import type { AppearancePreset } from '../../scene/appearance';
import type { MaterialParams } from '../../settings';
import type { LightState } from '../assembly/timeline';
import type { Vec3 } from '../geometry/vec';
import type { IntelligenceField } from '../intelligence/field';
import type { CeramicUniforms } from './opticalCeramic';

/** Spill slider 0–1 → exterior emission; 8% spill gives a faint lip at the slot mouth. */
const SPILL_GAIN = 5;
/** Diffusion slider 0–1 → penetration radius in model units. */
const DIFFUSION_MIN = 0.035;
const DIFFUSION_RANGE = 0.42;
/** How much the outer-glow knob raises the surface's own emission at full setting. */
const OUTER_GLOW_RADIANCE = 1.5;

export interface FrameLight {
  readonly light: LightState;
  readonly field: IntelligenceField;
  readonly core: Vec3;
}

/** Values shared by every piece for this frame. */
export function writeFrameUniforms(u: CeramicUniforms, frame: FrameLight, m: MaterialParams, preset: AppearancePreset): void {
  const { light, field, core } = frame;
  u.uGlow.value = light.glow;
  u.uCore.value = m.core;
  u.uCutLight.value = m.cutLight;
  u.uInnerWallGlow.value = m.innerWallGlow;
  u.uSpill.value = m.spill * SPILL_GAIN * preset.skinGlow;
  u.uDiffusion.value = (DIFFUSION_MIN + DIFFUSION_RANGE * m.diffusion) * light.diffusionScale;
  u.uAbsorption.value = m.absorption;
  u.uFalloff.value = m.falloff;
  u.uEdge.value = m.edge * preset.edgeScale;
  u.uWall.value = preset.wallGlow;
  u.uGrainScale.value = m.grainScale;
  u.uGrainAmount.value = m.grainAmount;
  u.uIncandescence.value = field.incandescence;
  u.uDrift.value = field.drift;
  u.uLightGround.value = preset.lightGround;
  u.uStain.value = preset.stain;

  u.uJunction.value.set(...core);
  u.uCoreGlow.value = field.coreGlow * light.coreEmphasis;
  u.uFieldBase.value = field.base;
  u.uMoteSpread.value = field.moteSpread;
  u.uFlow.value.set(...field.flow, field.stretch);
  // Outer glow is real emission: the surface itself glows harder, and the bloom carries it outward.
  const radiance = 1 + OUTER_GLOW_RADIANCE * m.halo;
  u.uPlasmaShape.value.set(field.plasmaScale, field.contrast, field.veil * preset.skinGlow * radiance);
  u.uExterior.value = field.exterior * radiance;
  u.uEdgeLight.value = preset.surface.edgeLight;
  u.uBodyLight.value = m.bodyLight;
  u.uPaleWarmth.value = m.paleWarmth;
  field.motes.forEach((mote, i) => u.uMotes.value[i]?.set(...mote.position, mote.strength));
  u.uReveal.value = light.reveal;
  u.uImpulse.value.set(field.impulseRadius, field.impulseStrength, 0);
}
