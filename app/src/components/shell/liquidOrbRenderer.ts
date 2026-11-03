import { LIQUID_ORB_FRAGMENT_SHADER, LIQUID_ORB_VERTEX_SHADER } from './liquidOrbShaders';
import { compileShader, readCssColor } from './webglHelpers';

export interface LiquidOrbRenderer {
  resize: () => void;
  render: (time: number) => void;
  updatePalette: () => void;
  dispose: () => void;
}

// The unbounded glow is a big, soft, feathered light: a fraction of the device
// pixels is plenty, and it makes the shader several times cheaper (it is rendered
// 576px wide behind the composer).
const UNBOUNDED_PIXEL_RATIO = 0.6;
// Below this width (CSS px) the saving is negligible and the low ratio shows as pixels: a
// small orb (the attention home's, in the navigation, 2026-10-23) renders at full ratio.
const UNBOUNDED_FULL_RATIO_BELOW_PX = 128;

export interface LiquidOrbOptions {
  /** Feather the picture into a soft circle instead of a sphere with a hard edge. */
  unbounded?: boolean;
}

export function createLiquidOrbRenderer(canvas: HTMLCanvasElement, options: LiquidOrbOptions = {}): LiquidOrbRenderer | null {
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    // Premultiplied (the shader outputs colour × alpha): WebKit — Safari and the iOS
    // wrapper — composites a non-premultiplied canvas wrongly, showing colour where
    // alpha is 0 (a pale square around the orb) and washing the hues out (2026-10-14).
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
  });
  if (!context) return null;
  const gl: WebGL2RenderingContext = context;

  const colorCanvas = document.createElement('canvas');
  const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });
  if (!colorContext) throw new Error('Liquid orb could not create a color parser.');
  const parser: CanvasRenderingContext2D = colorContext;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, LIQUID_ORB_VERTEX_SHADER, 'Liquid orb');
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, LIQUID_ORB_FRAGMENT_SHADER, 'Liquid orb');
  const program = gl.createProgram();
  if (!program) throw new Error('Liquid orb could not create a shader program.');
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown link error';
    throw new Error(`Liquid orb shader linking failed: ${log}`);
  }

  const vertexArray = gl.createVertexArray();
  const buffer = gl.createBuffer();
  if (!vertexArray || !buffer) throw new Error('Liquid orb could not create geometry.');
  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);
  gl.disable(gl.BLEND);

  const uniforms = {
    time: gl.getUniformLocation(program, 'u_time'),
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    colorA: gl.getUniformLocation(program, 'u_colorA'),
    colorB: gl.getUniformLocation(program, 'u_colorB'),
    colorC: gl.getUniformLocation(program, 'u_colorC'),
    unbounded: gl.getUniformLocation(program, 'u_unbounded'),
    lightGround: gl.getUniformLocation(program, 'u_lightGround'),
  };

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = options.unbounded && bounds.width >= UNBOUNDED_FULL_RATIO_BELOW_PX
      ? UNBOUNDED_PIXEL_RATIO : Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.floor(bounds.width * pixelRatio));
    const height = Math.max(1, Math.floor(bounds.height * pixelRatio));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  function updatePalette() {
    const styles = getComputedStyle(canvas);
    const colorA = readCssColor(styles.getPropertyValue('--assistant-orb-color-a'), parser);
    const colorB = readCssColor(styles.getPropertyValue('--assistant-orb-color-b'), parser);
    const colorC = readCssColor(styles.getPropertyValue('--assistant-orb-color-c'), parser);
    gl.useProgram(program);
    gl.uniform3fv(uniforms.colorA, colorA);
    gl.uniform3fv(uniforms.colorB, colorB);
    gl.uniform3fv(uniforms.colorC, colorC);
    gl.uniform1f(uniforms.unbounded, options.unbounded ? 1 : 0);
    const lightGround = Number.parseFloat(styles.getPropertyValue('--orb-light-ground'));
    if (Number.isNaN(lightGround)) throw new Error('Liquid orb: --orb-light-ground must be a number (0 or 1) in every theme.');
    gl.uniform1f(uniforms.lightGround, lightGround);
  }

  function render(time: number) {
    gl.useProgram(program);
    gl.uniform1f(uniforms.time, time);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
  }

  function dispose() {
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vertexArray);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    colorCanvas.width = 0;
    colorCanvas.height = 0;
  }

  resize();
  updatePalette();
  return { resize, render, updatePalette, dispose };
}
