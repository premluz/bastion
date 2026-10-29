import { cssDurationMs } from './cssDuration';

export const CUBE_TRAVEL_ID = 'dock-cube-travel';
let travel: Animation | null = null;
let from = 0;
let to = 0;

export function cubeTravelProgress(): number {
  const progress = travel?.effect?.getComputedTiming().progress ?? 1;
  return from + (to - from) * progress;
}

/** Keep the renderer mounted; only its live wrapper travels between measured slots. */
export function placeDockCube(cube: HTMLElement, slot: HTMLElement, centered: boolean, animate: boolean) {
  const source = cube.getBoundingClientRect();
  const destination = slot.getBoundingClientRect();
  const parent = cube.offsetParent;
  if (!(parent instanceof HTMLElement)) throw new Error('Live cube has no positioning layer');
  const origin = parent.getBoundingClientRect();
  from = cubeTravelProgress();
  to = centered ? 1 : 0;
  travel?.cancel();
  cube.style.setProperty('--dock-cube-x', `${destination.x - origin.x}px`);
  cube.style.setProperty('--dock-cube-y', `${destination.y - origin.y}px`);
  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { from = to; travel = null; return; }
  travel = cube.animate([
    { translate: `${source.x - destination.x}px ${source.y - destination.y}px` },
    { translate: '0px 0px' },
  ], { id: CUBE_TRAVEL_ID, duration: cssDurationMs('--dock-cube-travel-duration'),
    easing: getComputedStyle(document.documentElement).getPropertyValue('--dock-cube-travel-ease').trim(), fill: 'both' });
  const animation = travel;
  const transition = document.activeViewTransition;
  if (transition === null) return;
  animation.pause();
  void transition.ready.then(() => animation.play(), (error: unknown) => {
    animation.cancel();
    console.error('Live cube transition failed.', error);
  });
}
