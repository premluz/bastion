export const FRAME_LIMITS = {
  count: 240,
  darkChannel: 50,
  opaqueAlpha: 0.95,
  minimumBodyPixels: 100,
  maximumDarkPixels: 4,
  burstDelta: 15,
  maximumBurstPixels: 15,
} as const;

interface FrameSample { time: number; opaque: number; dark: number; burst: number; bodyBurst: number; edgeBurst: number }
interface FramePixels { image: ImageData; brightness: Float32Array }

function captureContext(source: HTMLCanvasElement) {
  const canvas = document.createElement('canvas');
  const bounds = source.getBoundingClientRect();
  canvas.width = Math.round(bounds.width);
  canvas.height = Math.round(bounds.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context === null) throw new Error('Dock frame probe requires a 2D context');
  return context;
}

function inspectPixels(image: ImageData) {
  const brightness = new Float32Array(image.width * image.height);
  let opaque = 0;
  let dark = 0;
  for (let pixel = 0; pixel < brightness.length; pixel++) {
    const index = pixel * 4;
    const alpha = (image.data[index + 3] ?? 0) / 255;
    const light = Math.max(image.data[index] ?? 0, image.data[index + 1] ?? 0, image.data[index + 2] ?? 0);
    brightness[pixel] = light * alpha;
    if (alpha < FRAME_LIMITS.opaqueAlpha) continue;
    opaque++;
    if (light < FRAME_LIMITS.darkChannel) dark++;
  }
  return { brightness, opaque, dark };
}

function burstPixels(history: readonly FramePixels[]) {
  const [before, middle, after] = history;
  if (before === undefined || middle === undefined || after === undefined) return { burst: 0, bodyBurst: 0, edgeBurst: 0 };
  let burst = 0;
  let bodyBurst = 0;
  let edgeBurst = 0;
  for (let pixel = 0; pixel < middle.brightness.length; pixel++) {
    const neighbors = Math.max(before.brightness[pixel] ?? 0, after.brightness[pixel] ?? 0);
    if ((middle.brightness[pixel] ?? 0) - neighbors <= FRAME_LIMITS.burstDelta) continue;
    // Neighboring frames define the footprint: a white flash can temporarily make air opaque.
    const coverage = [before, after].map((frame) => (frame.image.data[pixel * 4 + 3] ?? 0) / 255 >= FRAME_LIMITS.opaqueAlpha);
    if (coverage[0] !== coverage[1]) edgeBurst++;
    // Travelling seam light intentionally changes body radiance; halo flashes occur in the air.
    else if (coverage[0]) bodyBurst++;
    else burst++;
  }
  return { burst, bodyBurst, edgeBurst };
}

function imageArtifact(image: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Dock frame artifact requires a 2D context');
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

export async function recordDockCubeFrames() {
  const source = document.querySelector('[data-live-dock-cube] canvas');
  if (!(source instanceof HTMLCanvasElement)) throw new Error('Dock frame probe cannot find the live canvas');
  if (document.hidden) throw new Error('Dock frame probe requires a visible page');
  const context = captureContext(source);
  const samples: FrameSample[] = [];
  const history: FramePixels[] = [];
  let artifact: string | null = null;
  for (let frame = 0; frame < FRAME_LIMITS.count; frame++) {
    const time = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.drawImage(source, 0, 0, context.canvas.width, context.canvas.height);
    const image = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const { brightness, opaque, dark } = inspectPixels(image);
    history.push({ image, brightness });
    if (history.length > 3) history.shift();
    const { burst, bodyBurst, edgeBurst } = burstPixels(history);
    samples.push({ time, opaque, dark, burst, bodyBurst, edgeBurst });
    if (artifact !== null) continue;
    if (dark > FRAME_LIMITS.maximumDarkPixels || opaque < FRAME_LIMITS.minimumBodyPixels) artifact = imageArtifact(image);
    else if (burst > FRAME_LIMITS.maximumBurstPixels && history[1] !== undefined) artifact = imageArtifact(history[1].image);
  }
  return { samples, artifact };
}
