import { LIQUID_ORB_FRAGMENT_SHADER, LIQUID_ORB_VERTEX_SHADER } from './liquidOrbShaders';

type Rgb = readonly [number, number, number];

export interface LiquidOrbRenderer {
  resize: () => void;
  render: (time: number) => void;
  updatePalette: () => void;
  dispose: () => void;
}

const FALLBACK_COLOR: Rgb = [1, 1, 1];

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Liquid orb could not create a shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown shader error';
    gl.deleteShader(shader);
    throw new Error(`Liquid orb shader compilation failed: ${log}`);
  }
  return shader;
}

function readCssColor(value: string, context: CanvasRenderingContext2D): Rgb {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = 'transparent';
  context.fillStyle = value.trim();
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  if (red === 0 && green === 0 && blue === 0 && value.trim() !== 'black') return FALLBACK_COLOR;
  return [red / 255, green / 255, blue / 255];
}

export function createLiquidOrbRenderer(canvas: HTMLCanvasElement): LiquidOrbRenderer | null {
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  });
  if (!context) return null;
  const gl: WebGL2RenderingContext = context;

  const colorCanvas = document.createElement('canvas');
  const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });
  if (!colorContext) throw new Error('Liquid orb could not create a color parser.');
  const parser: CanvasRenderingContext2D = colorContext;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, LIQUID_ORB_VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, LIQUID_ORB_FRAGMENT_SHADER);
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
  };

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
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
    gl.useProgram(program);
    gl.uniform3fv(uniforms.colorA, colorA);
    gl.uniform3fv(uniforms.colorB, colorB);
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
