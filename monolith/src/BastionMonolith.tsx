import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { AppearanceFade } from './AppearanceFade';
import styles from './BastionMonolith.module.css';
import type { LiveSettings } from './live';
import { formationTurn, releaseThenAssemble } from './monolith/assembly/shapeToShape';
import type { BastionMonolithProps } from './props';
import { QUALITY } from './quality';
import { APPEARANCES } from './scene/appearance';
import { AppearanceCrossfade } from './scene/AppearanceCrossfade';
import { CameraRig, DEFAULT_CAMERA } from './scene/CameraRig';
import { CubeStage } from './scene/CubeStage';
import { ExportBridge, type ExportRequest } from './scene/export/ExportBridge';
import { FractalStage } from './scene/FractalStage';
import { luminance, toneMappedGround } from './scene/groundColor';
import { OuterGlowBloom } from './scene/OuterGlowBloom';
import { MAX_FRAME_STEP, SettingsEaser } from './scene/SettingsEaser';
import { SideGlow } from './scene/sideGlow/SideGlow';
import { StudioLighting } from './scene/StudioLighting';
import { TurningGroup } from './scene/TurningGroup';
import { VariantStage } from './scene/VariantStage';
import { mergeSettings, resolveState, DEFAULT_STATES } from './states';
import { useAppearanceTransition } from './useAppearanceTransition';

/**
 * Outer glow is the bloom of the monolith's own emitted light — cuts, spill and veil — never a sprite.
 * Orange carries little luminance, so the knob lowers the threshold quickly for the light to reach the
 * scatter at all, strengthens it and widens it.
 */
const HALO = { gain: 2.5, radius: 0.15, incandescentGain: 1.1, side: 1 } as const;
/** Headroom between the ground's own luminance and the bloom threshold, so the background never glows. */
const GROUND_MARGIN = 1.15;
const GROUND_PAD = 0.05;

function FrameTick({ onFrame }: { readonly onFrame: (deltaSeconds: number) => void }) {
  useFrame((_, delta) => onFrame(Math.min(delta, MAX_FRAME_STEP)));
  return null;
}

export function BastionMonolith({
  composition,
  appearance = 'dark',
  sequence = 'rest',
  progress,
  state,
  states,
  settings,
  transition = 'ease',
  quality = 'high',
  interactive = true,
  framing = 1,
  maxPixelRatio,
  transparent = false,
  paused = false,
  ground,
  onFrame,
  className,
  ref,
}: BastionMonolithProps) {
  // Transmission would sample the empty backdrop of a transparent canvas, so the body is lit from within instead.
  const spec = transparent ? { ...QUALITY[quality], transmission: false } : QUALITY[quality];
  const { displayed, fade, snapshot, failure, done } = useAppearanceTransition(appearance);
  const preset = APPEARANCES[displayed];

  const target = useMemo(
    () => mergeSettings(settings, resolveState(state, { ...DEFAULT_STATES, ...states })),
    [settings, state, states],
  );
  const eased = useRef(target);
  const live = useMemo<LiveSettings>(() => ({ target, eased }), [target]);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const readProgress = useCallback((): number => {
    const value = progressRef.current;
    return typeof value === 'function' ? value() : (value ?? 1);
  }, []);
  const staged = useCallback(
    (): number => (sequence === 'rest' ? 1 : sequence === 'shape-to-shape' ? releaseThenAssemble(readProgress()) : readProgress()),
    [sequence, readProgress],
  );
  const turn = useCallback((): number => (sequence === 'shape-to-shape' ? formationTurn(readProgress()) : 0), [sequence, readProgress]);
  const still = useCallback((): number => 0, []);

  const [resetToken, setResetToken] = useState(0);
  const exports = useRef<ExportRequest[]>([]);
  useImperativeHandle(
    ref,
    () => ({
      exportPng: () => new Promise((resolve, reject) => exports.current.push({ kind: 'png', resolve, reject })),
      exportSvg: () => new Promise((resolve, reject) => exports.current.push({ kind: 'svg', resolve, reject })),
      resetCamera: () => setResetToken((token) => token + 1),
    }),
    [],
  );

  // Drawn into an opaque canvas so glow can scatter onto it; pre-tone-mapped so it lands on the host colour.
  const groundHex = ground?.[displayed] ?? preset.ground;
  const groundColor = useMemo(() => (transparent ? null : toneMappedGround(groundHex)), [transparent, groundHex]);
  const groundCeiling = groundColor === null ? 0 : luminance(groundColor) * GROUND_MARGIN + GROUND_PAD;
  const baseThreshold = Math.max(1, groundCeiling);
  const floorThreshold = Math.max(preset.haloThreshold, groundCeiling);

  const { halo, glowMode } = target.material;
  const incandescent = glowMode === 'incandescent';
  const sideGlow = spec.sideGlow && preset.lightGround <= 0 ? HALO.side * halo : 0;

  return (
    <div className={`${styles.root}${className === undefined ? '' : ` ${className}`}`} data-interactive={interactive}>
      <Canvas
        className={styles.stage}
        dpr={[spec.dpr[0], maxPixelRatio ?? spec.dpr[1]]}
        frameloop={paused ? 'never' : 'always'}
        gl={{ antialias: false, alpha: transparent, powerPreference: 'high-performance' }}
        camera={{ fov: 22, near: 0.1, far: 100, position: DEFAULT_CAMERA }}
        onDoubleClick={interactive ? () => setResetToken((token) => token + 1) : undefined}
      >
        {groundColor !== null && <color attach="background" args={[groundColor.r, groundColor.g, groundColor.b]} />}
        <SettingsEaser live={live} transition={transition} />
        <StudioLighting appearance={displayed} preset={preset} />
        {composition.kind === 'fractal' && (
          <FractalStage {...composition} settings={live} quality={spec} preset={preset} progress={staged} />
        )}
        <TurningGroup turn={composition.kind === 'fractal' ? still : turn}>
          {composition.kind === 'cube' && <CubeStage {...composition} settings={live} quality={spec} preset={preset} progress={staged} />}
          {composition.kind === 'monolith' && (
            <VariantStage variant={composition.variant} settings={live} quality={spec} preset={preset} progress={staged} />
          )}
        </TurningGroup>
        {onFrame !== undefined && <FrameTick onFrame={onFrame} />}
        <CameraRig
          autoRotate={target.camera.autoRotate}
          rotationSpeed={target.camera.rotationSpeed}
          interactive={interactive}
          resetToken={resetToken}
          framing={framing}
        />
        <ExportBridge queue={exports} base={preset.base} />
        <AppearanceCrossfade requested={appearance} displayed={displayed} fading={fade !== null} onSnapshot={snapshot} onFailure={failure} />
        <EffectComposer multisampling={spec.multisampling}>
          {spec.sideGlow ? <SideGlow strength={sideGlow} /> : <></>}
          <OuterGlowBloom
            threshold={baseThreshold + (floorThreshold - baseThreshold) * Math.sqrt(halo)}
            smoothing={0.25 + 0.2 * halo}
            intensity={preset.bloom * (1 + HALO.gain * halo) * (incandescent ? HALO.incandescentGain : 1)}
            radius={0.62 + HALO.radius * halo}
          />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      </Canvas>
      {fade !== null && <AppearanceFade key={fade.key} bitmap={fade.bitmap} onDone={done} />}
    </div>
  );
}
