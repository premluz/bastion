const OPAQUE_ALPHA = 240;
const WARMUP_FRAMES = 60;

function extent(context: CanvasRenderingContext2D, source: HTMLCanvasElement) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.drawImage(source, 0, 0, context.canvas.width, context.canvas.height);
  const image = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  let left = image.width, right = 0, top = image.height, bottom = 0;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if ((image.data[(y * image.width + x) * 4 + 3] ?? 0) < OPAQUE_ALPHA) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  return Math.max(0, right - left) + Math.max(0, bottom - top);
}

async function readyExtent(context: CanvasRenderingContext2D, source: HTMLCanvasElement) {
  for (let frame = 0; frame < WARMUP_FRAMES; frame++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const size = extent(context, source);
    if (size > 0) return size;
  }
  throw new Error('Chat cube did not render opaque coverage during warmup');
}

export async function recordChatCubeAssembly(buttonName: string) {
  const source = document.querySelector('[data-live-dock-cube] canvas');
  // Only a button the user could press: the home behind the open composer is inert, and has its own "Send" (2026-10-30).
  const button = Array.from(document.querySelectorAll('button')).find((element) => element.closest('[inert]') === null
    && (element.getAttribute('aria-label') === buttonName || element.textContent?.trim() === buttonName));
  if (!(source instanceof HTMLCanvasElement) || button === undefined) throw new Error(`Cube or ${buttonName} unavailable`);
  if (document.hidden) throw new Error('Cube assembly probe requires a visible page');
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(source.getBoundingClientRect().width);
  canvas.height = Math.round(source.getBoundingClientRect().height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context === null) throw new Error('Cube assembly probe requires a 2D context');
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--dock-cube-assembly-duration').trim();
  const duration = parseFloat(raw) * (raw.endsWith('ms') ? 1 : 1000);
  if (!Number.isFinite(duration)) throw new Error(`Invalid assembly duration: ${raw}`);
  const initial = await readyExtent(context, source);
  let maximum = initial, final = initial, frames = 0, elapsed = 0;
  button.click();
  let previous = performance.now();
  while (elapsed < duration) {
    const now = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    // Use the renderer's capped frame clock, not automation round-trip time.
    elapsed += Math.min(now - previous, 100);
    previous = now;
    final = extent(context, source);
    maximum = Math.max(maximum, final);
    frames++;
  }
  return { initial, maximum, final, frames, sameCanvas: source === document.querySelector('[data-live-dock-cube] canvas') };
}
