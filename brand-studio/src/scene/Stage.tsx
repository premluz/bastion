import { EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { Canvas, useFrame } from '@react-three/fiber';
import { ToneMappingMode } from 'postprocessing';
import { useCallback, useMemo } from 'react';
import { formationTurn, releaseThenAssemble } from '../monolith/assembly/shapeToShape';
import { useAssembly } from '../state/assemblyStore';
import { useStudio } from '../state/studioStore';
import { APPEARANCES } from './appearance';
import { AppearanceSnapshot } from './AppearanceSnapshot';
import { CameraRig, DEFAULT_CAMERA } from './CameraRig';
import { OuterGlowBloom } from './OuterGlowBloom';
import { SideGlow } from './sideGlow/SideGlow';
import { Exporter } from './export/Exporter';
import { CubeStage } from './CubeStage';
import { luminance, toneMappedGround } from './groundColor';
import { FractalStage } from './FractalStage';
import styles from './Stage.module.css';
import { StudioLighting } from './StudioLighting';
import { TurningGroup } from './TurningGroup';
import { VariantStage } from './VariantStage';

export type StagePage = 'monolith' | 'assembly' | 'cube' | 'fractal';

/** Longest frame step fed to the assembly clock, so a backgrounded tab does not jump the sequence. */
const MAX_FRAME_STEP = 0.1;

function AssemblyClock() {
  useFrame((_, delta) => {
    useAssembly.getState().advance(Math.min(delta, MAX_FRAME_STEP));
  });
  return null;
}

/**
 * Orange carries little luminance, so the knob must lower the threshold quickly for the cut light to
 * reach the scatter at all. Outer glow is the bloom of the monolith's own emitted light — cuts, spill and veil — never a sprite:
 * the knob lowers the threshold toward the glowing regions, strengthens and widens the scatter.
 */
const HALO = { gain: 2.5, radius: 0.15, incandescentGain: 1.1, side: 1 } as const;

/** Headroom between the ground's own luminance and the bloom threshold. */
const GROUND_MARGIN = 1.15;
const GROUND_PAD = 0.05;

const ASSEMBLED = (): number => 1;
const STILL = (): number => 0;

export function Stage({ page }: { readonly page: StagePage }) {
  const appearance = useStudio((s) => s.appearance);
  const variant = useStudio((s) => s.variant);
  const resetCamera = useStudio((s) => s.resetCamera);
  const preset = APPEARANCES[appearance];
  const incandescent = useStudio((s) => s.material.glowMode === 'incandescent');
  const halo = useStudio((s) => s.material.halo);
  const assemblyProgress = useCallback(() => useAssembly.getState().progress, []);
  const shapeToShape = useCallback(() => releaseThenAssemble(useAssembly.getState().progress), []);
  const turn = useCallback(() => formationTurn(useAssembly.getState().progress), []);
  const shaped = page === 'assembly' || page === 'cube';
  // The ground is drawn into an opaque canvas so glow scatters onto it; drawn pre-tone-mapping, it
  // must stay below the bloom threshold or the whole background would glow.
  const ground = useMemo(() => toneMappedGround(preset.ground), [preset]);
  const groundCeiling = luminance(ground) * GROUND_MARGIN + GROUND_PAD;
  const baseThreshold = Math.max(1, groundCeiling);
  const floorThreshold = Math.max(preset.haloThreshold, groundCeiling);

  return (
    <Canvas
      className={styles.stage}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 22, near: 0.1, far: 100, position: DEFAULT_CAMERA }}
      onDoubleClick={resetCamera}
    >
      <color attach="background" args={[ground.r, ground.g, ground.b]} />
      <StudioLighting appearance={appearance} preset={preset} />
      {page === 'fractal' && <FractalStage preset={preset} progress={assemblyProgress} />}
      <TurningGroup turn={shaped ? turn : STILL}>
        {page === 'cube' && <CubeStage preset={preset} progress={shapeToShape} />}
        {(page === 'monolith' || page === 'assembly') && (
          <VariantStage preset={preset} progress={page === 'assembly' ? shapeToShape : ASSEMBLED} />
        )}
      </TurningGroup>
      {page !== 'monolith' && <AssemblyClock />}
      <CameraRig />
      <AppearanceSnapshot />
      <Exporter base={preset.base} nameParts={page === 'monolith' || page === 'assembly' ? [page, variant, appearance] : [page, appearance]} />
      <EffectComposer multisampling={4}>
        <SideGlow strength={preset.lightGround > 0 ? 0 : HALO.side * halo} />
        <OuterGlowBloom
          threshold={baseThreshold + (floorThreshold - baseThreshold) * Math.sqrt(halo)}
          smoothing={0.25 + 0.2 * halo}
          intensity={preset.bloom * (1 + HALO.gain * halo) * (incandescent ? HALO.incandescentGain : 1)}
          radius={0.62 + HALO.radius * halo}
        />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  );
}
