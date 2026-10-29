import { cssDurationMs } from './cssDuration';
import { cubeTravelProgress } from './dockCubeTravel';

const FULL_TURN = Math.PI * 2;

/** Rotation follows translation's spring progress, including overshoot, without a second easing stage. */
export function dockCubeTurn(now = performance.now()): number {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  // A shared time origin keeps newly mounted chat/voice canvases aligned with the nav cube.
  const idle = now / cssDurationMs('--dock-cube-idle-period') * FULL_TURN;
  const root = document.documentElement;
  const turn = Number(getComputedStyle(root).getPropertyValue('--dock-cube-turn').trim()) * FULL_TURN;
  return idle - turn * cubeTravelProgress();
}

