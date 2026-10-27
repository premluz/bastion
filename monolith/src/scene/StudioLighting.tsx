import { Environment, Lightformer } from '@react-three/drei';
import type { Appearance } from '../settings';
import type { AppearancePreset } from './appearance';

interface StudioLightingProps {
  readonly appearance: Appearance;
  readonly preset: AppearancePreset;
}

/** Large soft area lights only — no visible sources and no floor. */
export function StudioLighting({ appearance, preset }: StudioLightingProps) {
  return (
    <>
      <ambientLight intensity={preset.ambient} />
      <directionalLight position={[-3, 7, 4]} intensity={preset.key} />
      <directionalLight position={[6, 2, -2]} intensity={preset.fill} />
      <Environment key={appearance} resolution={256} frames={1} environmentIntensity={preset.environment}>
        {preset.room !== null && <color attach="background" args={[preset.room]} />}
        <Lightformer form="rect" intensity={2.2} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[-7, 1.5, 4]} rotation-y={Math.PI / 2.6} scale={[8, 5, 1]} />
        <Lightformer form="rect" intensity={0.7} position={[7, 0.5, -2]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.3} position={[-3, 2, 9]} scale={[9, 6, 1]} />
        <Lightformer form="rect" intensity={0.55} position={[9, 1, -3]} rotation-y={Math.PI / 2} scale={[9, 6, 1]} />
        <Lightformer form="rect" intensity={0.35} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
        {preset.accents.map((accent) => (
          <Lightformer
            key={`${accent.color}-${accent.position.join()}`}
            form="rect"
            color={accent.color}
            intensity={accent.intensity}
            position={[...accent.position]}
            rotation-y={accent.rotationY}
            scale={[...accent.scale, 1]}
          />
        ))}
      </Environment>
    </>
  );
}
