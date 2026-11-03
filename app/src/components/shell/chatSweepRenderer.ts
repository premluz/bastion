import { CHAT_SWEEP_FRAGMENT_SHADER } from './chatSweepShader';
import { cssDurationMs } from './cssDuration';
import { LIQUID_ORB_VERTEX_SHADER } from './liquidOrbShaders';
import { compileShader, readCssColor } from './webglHelpers';

export interface ChatSweep { finished: Promise<void>; cancel: () => void }

// Device pixels: the band is soft and wide, so a capped ratio costs nothing visible (the liquid orb's own cap).
const MAX_PIXEL_RATIO = 1.5;

function readEase(canvas: HTMLCanvasElement, name: string) {
  const ease = getComputedStyle(canvas).getPropertyValue(name).trim();
  if (!ease) throw new Error(`Chat sweep: ${name} is not set (theme/chat-sweep.css).`);
  return ease;
}

/** One sweep across `canvas`: the band travels on the token's duration and curve, then the canvas fades out. Returns null
 *  where WebGL2 is unavailable; the sweep is decoration, so the caller simply shows none. */
export function playChatSweep(canvas: HTMLCanvasElement): ChatSweep | null {
  const context = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!context) return null;
  const gl: WebGL2RenderingContext = context;
  const vertex = compileShader(gl, gl.VERTEX_SHADER, LIQUID_ORB_VERTEX_SHADER, 'Chat sweep');
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, CHAT_SWEEP_FRAGMENT_SHADER, 'Chat sweep');
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) throw new Error('Chat sweep could not create its program.');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Chat sweep shader linking failed: ${gl.getProgramInfoLog(program) ?? 'unknown'}`);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
  canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
  gl.viewport(0, 0, canvas.width, canvas.height);

  const styles = getComputedStyle(canvas);
  const parser = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!parser) throw new Error('Chat sweep could not create a colour parser.');
  for (const [uniform, token] of [['u_colorA', '--prism-blue'], ['u_colorB', '--prism-violet'], ['u_colorC', '--prism-pink']] as const)
    gl.uniform3fv(gl.getUniformLocation(program, uniform), readCssColor(styles.getPropertyValue(token), parser));
  const strength = Number.parseFloat(styles.getPropertyValue('--chat-sweep-strength'));
  if (!Number.isFinite(strength)) throw new Error('Chat sweep: --chat-sweep-strength must be a number (theme/chat-sweep.css).');
  gl.uniform1f(gl.getUniformLocation(program, 'u_strength'), strength);
  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
  const time = gl.getUniformLocation(program, 'u_time');
  const progress = gl.getUniformLocation(program, 'u_progress');

  // The curve is a CSS token: an empty animation with its timing is read for the eased progress each frame.
  const travel = canvas.animate([], { duration: cssDurationMs('--chat-sweep-duration'), easing: readEase(canvas, '--chat-sweep-ease'), fill: 'forwards' });
  const start = performance.now();
  let frame = requestAnimationFrame(function draw(now) {
    gl.uniform1f(time, (now - start) / 1000);
    gl.uniform1f(progress, Number(travel.effect?.getComputedTiming().progress ?? 1));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame = requestAnimationFrame(draw);
  });
  let fade: Animation | undefined;
  const dispose = () => {
    cancelAnimationFrame(frame);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  };
  const finished = travel.finished
    .then(() => (fade = canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: cssDurationMs('--chat-sweep-fade'), easing: readEase(canvas, '--chat-sweep-fade-ease'), fill: 'forwards' })).finished)
    .then(() => undefined)
    .finally(dispose);
  return { finished, cancel: () => { travel.cancel(); fade?.cancel(); } };
}
