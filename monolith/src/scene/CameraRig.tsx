import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type ComponentRef } from 'react';
import { Vector3 } from 'three';

/** Three-quarter view onto the front, right and top faces, matching the reference artwork. */
export const DEFAULT_CAMERA: [number, number, number] = [7.4, 6.1, 7.4];
const DEFAULT_HOME = new Vector3(...DEFAULT_CAMERA);
const MIN_DISTANCE = 7.5;
const MAX_DISTANCE = 16;
/** Aimed a little below the centre so the monolith clears the bottom control dock. */
const FOCUS: [number, number, number] = [0, -0.32, 0];
const ORIGIN = new Vector3(...FOCUS);
const RESET_RATE = 5;

interface CameraRigProps {
  readonly autoRotate: boolean;
  readonly rotationSpeed: number;
  /** Pointer orbit and zoom. */
  readonly interactive: boolean;
  /** Increment to ease the camera back to its default view. */
  readonly resetToken: number;
  /** Zoom of the default view; 1 leaves it as authored. */
  readonly framing: number;
}

export function CameraRig({ autoRotate, rotationSpeed, interactive, resetToken, framing }: CameraRigProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const home = useMemo(() => DEFAULT_HOME.clone().divideScalar(framing), [framing]);
  const { camera } = useThree();
  const resetting = useRef(false);

  useEffect(() => {
    if (resetToken > 0) resetting.current = true;
  }, [resetToken]);

  // A new framing re-aims the camera along the same direction at once; it is a composition choice, not a gesture.
  useEffect(() => {
    camera.position.copy(home);
  }, [camera, home]);

  useFrame(({ camera }, delta) => {
    const rig = controls.current;
    if (!resetting.current || rig === null) return;
    const k = 1 - Math.exp(-delta * RESET_RATE);
    camera.position.lerp(home, k);
    rig.target.lerp(ORIGIN, k);
    rig.update();
    if (camera.position.distanceTo(home) < 0.002) resetting.current = false;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={FOCUS}
      enablePan={false}
      enableRotate={interactive}
      enableZoom={interactive}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.55}
      zoomSpeed={0.5}
      minDistance={MIN_DISTANCE / framing}
      maxDistance={MAX_DISTANCE / framing}
      minPolarAngle={0.25}
      maxPolarAngle={1.62}
      autoRotate={autoRotate}
      autoRotateSpeed={rotationSpeed}
      onStart={() => {
        resetting.current = false;
      }}
    />
  );
}
