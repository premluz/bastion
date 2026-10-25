import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, type ComponentRef } from 'react';
import { Vector3 } from 'three';
import { useStudio } from '../state/studioStore';

/** Three-quarter view onto the front, right and top faces, matching the reference artwork. */
export const DEFAULT_CAMERA: [number, number, number] = [7.4, 6.1, 7.4];
const HOME = new Vector3(...DEFAULT_CAMERA);
/** Aimed a little below the centre so the monolith clears the bottom control dock. */
const FOCUS: [number, number, number] = [0, -0.32, 0];
const ORIGIN = new Vector3(...FOCUS);
const RESET_RATE = 5;

export function CameraRig() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const autoRotate = useStudio((s) => s.autoRotate);
  const rotationSpeed = useStudio((s) => s.rotationSpeed);
  const resetToken = useStudio((s) => s.cameraResetToken);
  const resetting = useRef(false);

  useEffect(() => {
    if (resetToken > 0) resetting.current = true;
  }, [resetToken]);

  useFrame(({ camera }, delta) => {
    const rig = controls.current;
    if (!resetting.current || rig === null) return;
    const k = 1 - Math.exp(-delta * RESET_RATE);
    camera.position.lerp(HOME, k);
    rig.target.lerp(ORIGIN, k);
    rig.update();
    if (camera.position.distanceTo(HOME) < 0.002) resetting.current = false;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={FOCUS}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.55}
      zoomSpeed={0.5}
      minDistance={7.5}
      maxDistance={16}
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
