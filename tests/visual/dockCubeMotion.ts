type RotationModule = typeof import('../../app/src/components/shell/dockCubeTurn');
export async function recordCubeIdle() {
  const moduleUrl = '/app/src/components/shell/dockCubeTurn.ts';
  const rotation: RotationModule = await import(moduleUrl);
  return [0, 1000, 15_000, 30_000].map((now) => rotation.dockCubeTurn(now));
}

export async function freezeCubeImage(label: string) {
  document.documentElement.style.setProperty('--dock-cube-idle-period', '1000000000s');
  const trigger = document.querySelector(`button[aria-label="${label}"]`);
  if (!(trigger instanceof HTMLButtonElement)) throw new Error('Cube image trigger unavailable');
  trigger.click();
  const transition = document.activeViewTransition;
  if (transition === null) throw new Error('Cube image check requires a transition');
  await transition.ready;
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  document.getAnimations().filter((animation) => animation.id === 'dock-cube-travel' || typeof animation.currentTime === 'number'
    || (animation instanceof CSSAnimation && animation.animationName === 'dock-live-hold'))
    .forEach((animation) => { animation.pause(); animation.currentTime = 50; });
  for (let frame = 0; frame < 60; frame++) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const moduleUrl = '/app/src/components/shell/dockCubeTurn.ts';
  const rotation: RotationModule = await import(moduleUrl);
  return { rotation: rotation.dockCubeTurn(0), animations: document.getAnimations().filter((animation) => animation.id === 'dock-cube-travel')
    .map((animation) => ({ time: animation.currentTime, state: animation.playState })) };
}

export async function cubePixelDifference({ reference, sample }: { reference: string; sample: string }) {
  async function pixels(encoded: string) {
    const blob = await (await fetch(`data:image/png;base64,${encoded}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('Cube pixel comparison requires a 2D context');
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    return context.getImageData(0, 0, canvas.width, canvas.height).data;
  }
  const [first, second] = await Promise.all([pixels(reference), pixels(sample)]);
  if (first.length !== second.length) throw new Error('Cube comparison image sizes differ');
  let difference = 0;
  for (let index = 0; index < first.length; index++) difference += Math.abs((first[index] ?? 0) - (second[index] ?? 0));
  return difference / first.length;
}
export type ControlFrame = { id: string | null; opacity: number; delay: number; duration: number };
export interface CubeEntryFrame {
  active: boolean;
  rotation: number;
  turnProgress: number;
  cubeX: number;
  composerY: number;
  composerWidth: number;
  gap: number;
  inputOpacity: number;
  inputHit: boolean;
  target: string;
  delay: number;
  duration: number;
  controls: ControlFrame[];
  sameCanvas: boolean;
  liveOpacity: string;
}

export async function recordCubeEntry() {
  const root = document.documentElement, canvas = document.querySelector('[data-live-dock-cube] canvas');
  const trigger = document.querySelector('button[aria-label="Open assistant"]');
  if (!(trigger instanceof HTMLButtonElement)) throw new Error('Cube trigger unavailable');
  trigger.click();
  const transition = document.activeViewTransition;
  if (transition === null) throw new Error('Cube entry requires a view transition');
  await transition.ready;
  const moduleUrl = '/app/src/components/shell/dockCubeTurn.ts';
  const rotation: RotationModule = await import(moduleUrl);
  const animations = document.getAnimations().filter((animation) => animation.id === 'dock-cube-travel' || (animation instanceof CSSAnimation
    && (animation.animationName.startsWith('-ua-view-transition') || animation.animationName.startsWith('dock-') || animation.animationName.includes('glow-composer-in'))));
  const travel = animations.find((animation) => animation.id === 'dock-cube-travel');
  const timing = travel?.effect?.getTiming();
  if (timing === undefined || typeof timing.duration !== 'number') throw new Error('Cube travel clock unavailable');
  animations.forEach((animation) => animation.pause());
  const frames: CubeEntryFrame[] = [];
  for (const moment of [0, timing.delay, ...[0.25, 0.5, 0.75, 1].map((fraction) => timing.delay + Number(timing.duration) * fraction), null]) {
    if (moment === null) { animations.forEach((animation) => animation.finish()); await transition.finished; }
    else animations.forEach((animation) => { animation.currentTime = moment; });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const active = root.matches(':active-view-transition');
    const cube = document.querySelector('[data-live-dock-cube]');
    const body = document.querySelector('.astryx-chat-composer > div');
    if (!(body instanceof HTMLElement) || !(cube instanceof HTMLElement)) throw new Error('Live composer/cube unavailable');
    const pose = cube.getBoundingClientRect();
    const bounds = body.getBoundingClientRect();
    const target = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    frames.push({ active, rotation: rotation.dockCubeTurn(0), turnProgress: active && moment !== null ? (moment - timing.delay) / Number(timing.duration) : 0,
      cubeX: pose.x, composerY: bounds.y, composerWidth: bounds.width,
      gap: pose.y - bounds.bottom, inputOpacity: Number(getComputedStyle(body).opacity),
      inputHit: Boolean(target?.closest('.astryx-chat-composer')), target: target?.outerHTML.slice(0, 250) ?? 'none',
      controls: Array.from(document.querySelectorAll<HTMLElement>('[data-dock-item]'), (element) => {
        const style = getComputedStyle(element);
        return { id: element.getAttribute('data-dock-item'), opacity: Number(style.opacity), delay: parseFloat(style.animationDelay), duration: parseFloat(style.animationDuration) };
      }), delay: timing.delay / 1000, duration: Number(timing.duration) / 1000,
      sameCanvas: canvas !== null && canvas === cube.querySelector('canvas'), liveOpacity: getComputedStyle(cube).opacity });
  }
  return frames;
}

export async function recordCubeReturn() {
  const canvas = document.querySelector('[data-live-dock-cube] canvas');
  const trigger = document.querySelector('button[aria-label="Back"]');
  if (!(trigger instanceof HTMLButtonElement)) throw new Error('Chat back button unavailable');
  trigger.click();
  const transition = document.activeViewTransition;
  if (transition === null) throw new Error('Cube return requires a view transition');
  await transition.ready;
  const moduleUrl = '/app/src/components/shell/dockCubeTurn.ts';
  const rotation: RotationModule = await import(moduleUrl);
  const animations = document.getAnimations().filter((animation) => animation.id === 'dock-cube-travel' || (animation instanceof CSSAnimation
    && (animation.animationName.startsWith('-ua-view-transition') || animation.animationName.startsWith('dock-'))));
  const travel = animations.find((animation) => animation.id === 'dock-cube-travel');
  const timing = travel?.effect?.getTiming();
  if (timing === undefined || typeof timing.duration !== 'number') throw new Error('Cube return clock unavailable');
  animations.forEach((animation) => animation.pause());
  const frames: { rotation: number; x: number; composerY: number; composerWidth: number; sameCanvas: boolean }[] = [];
  for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
    animations.forEach((animation) => { animation.currentTime = timing.delay + Number(timing.duration) * fraction; });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const cube = document.querySelector('[data-live-dock-cube]');
    if (!(cube instanceof HTMLElement)) throw new Error('Live return cube unavailable');
    const bar = getComputedStyle(document.documentElement, '::view-transition-group(dock-bar)');
    frames.push({ rotation: rotation.dockCubeTurn(0), x: cube.getBoundingClientRect().x, sameCanvas: canvas !== null && canvas === cube.querySelector('canvas'),
      composerY: new DOMMatrixReadOnly(bar.transform).m42, composerWidth: parseFloat(bar.width) });
  }
  animations.forEach((animation) => animation.finish());
  await transition.finished;
  return frames;
}
