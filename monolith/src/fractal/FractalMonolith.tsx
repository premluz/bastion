import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { applySurface } from '../monolith/material/applySurface';
import { PALETTE } from '../brand/palette';
import { pieceGeometry } from '../monolith/geometry/toBufferGeometry';
import { IntelligenceDriver } from '../monolith/intelligence/driver';
import { incandescenceTarget } from '../monolith/intelligence/glowTarget';
import { writeFrameUniforms } from '../monolith/material/frameUniforms';
import { createCeramicMaterial, createCeramicUniforms } from '../monolith/material/opticalCeramic';
import type { AppearancePreset } from '../scene/appearance';
import type { LiveSettings } from '../live';
import type { QualitySpec } from '../quality';
import { agentImpulse, deployProgress, fractalLight } from './assembly/fractalTimeline';
import { fractalMotions, pieceWorld, type MotionSettings } from './assembly/fractalMotion';
import type { FractalModel } from './geometry/buildFractal';

/** Past this share of the deploy the agent's pieces light from their own junction. */
const AGENT_OWN_LIGHT = 0.5;

export interface FractalMonolithProps {
  /** Built by the caller (fractal or single cube), memoised on its own parameters. */
  readonly model: FractalModel;
  /** How many wrong orientations each piece tries, and the pattern seed. */
  readonly search: MotionSettings;
  readonly settings: LiveSettings;
  readonly quality: QualitySpec;
  readonly preset: AppearancePreset;
  /** Read every frame, so the store can drive it without re-rendering. */
  readonly progress: () => number;
}

export function FractalMonolith({ model, search, settings, quality, preset, progress }: FractalMonolithProps) {
  const motion = useMemo(() => fractalMotions(model, search), [model, search]);
  const parts = useMemo(
    () =>
      model.pieces.map((piece) => {
        const uniforms = createCeramicUniforms(piece.model.openings);
        return {
          id: piece.model.id,
          level: piece.level,
          geometry: pieceGeometry(piece.model),
          uniforms,
          materials: [createCeramicMaterial('skin', uniforms), createCeramicMaterial('wall', uniforms)],
        };
      }),
    [model],
  );
  useEffect(
    () => () => {
      for (const part of parts) {
        part.geometry.dispose();
        for (const m of part.materials) m.dispose();
      }
    },
    [parts],
  );

  useEffect(() => {
    const { material } = settings.eased.current;
    for (const part of parts) {
      for (const m of part.materials) {
        applySurface(m, preset.surface, { base: preset.base, roughness: material.roughness, reflectance: material.reflectance, transmission: quality.transmission });
      }
      part.uniforms.uAmber.value.set(PALETTE.signal);
      part.uniforms.uEdgeColor.value.set(preset.edgeColor);
    }
  }, [parts, preset, quality.transmission, settings.eased]);

  const groups = useRef<(Group | null)[]>([]);
  const driver = useRef<IntelligenceDriver | null>(null);

  useFrame((_, delta) => {
    const { material, intelligence } = settings.eased.current;
    const incandescence = incandescenceTarget(material);
    driver.current ??= new IntelligenceDriver(intelligence, incandescence);
    driver.current.step(delta, intelligence, incandescence, intelligence.paused);
    const t = progress();
    const frame = {
      light: fractalLight(t),
      field: driver.current.field(model.junctions, intelligence),
      core: model.junctions.core,
    };
    const deployed = deployProgress(t);
    const pulse = agentImpulse(t);
    parts.forEach((part, i) => {
      const group = groups.current[i];
      if (group === null || group === undefined) return;
      const { rigid, openness } = pieceWorld(motion, i, t);
      group.quaternion.set(...rigid.rotation);
      group.position.set(...rigid.translation);
      group.scale.setScalar(rigid.scale);

      for (const m of part.materials) {
        applySurface(m, preset.surface, { base: preset.base, roughness: material.roughness, reflectance: material.reflectance, transmission: quality.transmission });
      }
      writeFrameUniforms(part.uniforms, frame, material, preset);
      part.uniforms.uDissolve.value = 0;
      // The agent's inner faces were slot walls; they quiet down as it leaves, so it reads as a whole cube.
      part.uniforms.uOpen.value = part.level >= 1 ? Math.max(openness, deployed) : openness;
      if (model.agentCore !== null && part.level >= 1 && deployed > AGENT_OWN_LIGHT) {
        part.uniforms.uJunction.value.set(...model.agentCore);
        if (pulse.strength > 0) part.uniforms.uImpulse.value.set(pulse.radius, pulse.strength, 0);
      }
    });
  });

  return (
    <group>
      {parts.map((part, i) => (
        <group
          key={part.id}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <mesh geometry={part.geometry} material={part.materials} />
        </group>
      ))}
    </group>
  );
}
