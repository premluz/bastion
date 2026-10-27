import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Quaternion, Vector3, type Group } from 'three';
import { BEVEL, cornerRadius } from '../fractal/geometry/bevel';
import { applySurface } from './material/applySurface';
import { PALETTE } from '../brand/palette';
import type { AppearancePreset } from '../scene/appearance';
import type { LiveSettings } from '../live';
import type { QualitySpec } from '../quality';
import { pieceMotions, pieceTransform } from './assembly/pieceMotion';
import { lightState } from './assembly/timeline';
import { buildMonolith } from './geometry/buildMonolith';
import { pieceGeometry } from './geometry/toBufferGeometry';
import type { VariantId } from './geometry/types';
import { IntelligenceDriver } from './intelligence/driver';
import { incandescenceTarget } from './intelligence/glowTarget';
import { writeFrameUniforms } from './material/frameUniforms';
import { createCeramicMaterial, createCeramicUniforms } from './material/opticalCeramic';
import { variantById } from './variants';


export interface MonolithProps {
  readonly variant: VariantId;
  readonly settings: LiveSettings;
  readonly quality: QualitySpec;
  readonly preset: AppearancePreset;
  /** Read every frame, so callers can drive it from a store without re-rendering. */
  readonly progress: () => number;
  readonly dissolve: () => number;
}

const rotation = new Quaternion();
const axis = new Vector3();
const pivot = new Vector3();
const rotatedPivot = new Vector3();

export function Monolith({ variant, settings, quality, preset, progress, dissolve }: MonolithProps) {
  const { cutWidth, softCorners } = settings.target.material;
  const round = cornerRadius(softCorners);
  const model = useMemo(
    () => buildMonolith(variantById(variant), { cutWidth, bevel: BEVEL, round }),
    [variant, cutWidth, round],
  );
  const motions = useMemo(() => pieceMotions(model), [model]);
  const parts = useMemo(
    () =>
      model.pieces.map((piece) => {
        const uniforms = createCeramicUniforms(piece.openings);
        return {
          id: piece.id,
          geometry: pieceGeometry(piece, round),
          uniforms,
          materials: [createCeramicMaterial('skin', uniforms), createCeramicMaterial('wall', uniforms)],
        };
      }),
    [model, round],
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
    const fade = dissolve();
    const frame = {
      light: lightState(t),
      field: driver.current.field(model.junctions, intelligence),
      core: model.junctions.core,
    };
    parts.forEach((part, i) => {
      const motion = motions[i];
      const group = groups.current[i];
      if (motion === undefined || group === null || group === undefined) return;
      const transform = pieceTransform(motion, t);
      rotation.setFromAxisAngle(axis.set(...transform.axis), transform.angle);
      pivot.set(...transform.pivot);
      rotatedPivot.copy(pivot).applyQuaternion(rotation);
      group.quaternion.copy(rotation);
      group.position.copy(pivot).sub(rotatedPivot).add(axis.set(...transform.translation));

      for (const m of part.materials) {
        applySurface(m, preset.surface, { base: preset.base, roughness: material.roughness, reflectance: material.reflectance, transmission: quality.transmission });
      }
      writeFrameUniforms(part.uniforms, frame, material, preset);
      part.uniforms.uDissolve.value = fade;
      part.uniforms.uOpen.value = transform.openness;
    });
  });

  return (
    <group>
      {parts.map((part, i) => (
        <group
          key={`${model.variant}-${part.id}`}
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
