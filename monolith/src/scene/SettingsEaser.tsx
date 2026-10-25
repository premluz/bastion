import { useFrame } from '@react-three/fiber';
import type { LiveSettings } from '../live';
import { easeSettings } from '../states';

/** Longest frame step fed to any clock, so a backgrounded tab does not jump the motion. */
export const MAX_FRAME_STEP = 0.1;
/** Before the scene's own per-frame work (priority 0), so everything reads this frame's values. */
const BEFORE_SCENE = -1;

interface SettingsEaserProps {
  readonly live: LiveSettings;
  readonly transition: 'ease' | 'immediate';
}

/** Moves the eased settings toward the target, once per frame, without re-rendering anything. */
export function SettingsEaser({ live, transition }: SettingsEaserProps) {
  useFrame((_, delta) => {
    live.eased.current =
      transition === 'immediate' ? live.target : easeSettings(live.eased.current, live.target, Math.min(delta, MAX_FRAME_STEP));
  }, BEFORE_SCENE);
  return null;
}
