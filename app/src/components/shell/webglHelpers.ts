// Shared by the WebGL layers (the liquid orb, the chat sweep): compile a shader and read a theme colour for a uniform.
export type Rgb = readonly [number, number, number];

const FALLBACK_COLOR: Rgb = [1, 1, 1];

/** `owner` names the layer in the error, so a failure says whose shader broke. */
export function compileShader(gl: WebGL2RenderingContext, type: number, source: string, owner: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error(`${owner} could not create a shader.`);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown shader error';
    gl.deleteShader(shader);
    throw new Error(`${owner} shader compilation failed: ${log}`);
  }
  return shader;
}

/** A CSS colour (any syntax the canvas understands, oklch included) as 0–1 sRGB channels. */
export function readCssColor(value: string, context: CanvasRenderingContext2D): Rgb {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = 'transparent';
  context.fillStyle = value.trim();
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  if (red === 0 && green === 0 && blue === 0 && value.trim() !== 'black') return FALLBACK_COLOR;
  return [red / 255, green / 255, blue / 255];
}
