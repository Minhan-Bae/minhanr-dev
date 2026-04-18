/**
 * WebGL helpers — thin wrappers around the raw GL calls the rain
 * renderer needs. Ported from codrops/RainEffect's webgl.js + gl-obj.js
 * into a single narrow TypeScript module.
 *
 * The abstraction is minimal on purpose: the fragment shader does all
 * the real work, and the JS side just needs to hand it a set of
 * textures (the water map, the background, the foreground) and a
 * handful of scalar uniforms on each frame.
 */

type TexSource =
  | HTMLCanvasElement
  | HTMLImageElement
  | ImageBitmap;

export function getContext(
  canvas: HTMLCanvasElement,
  options: WebGLContextAttributes = {}
): WebGLRenderingContext | null {
  const names: Array<"webgl" | "experimental-webgl"> = [
    "webgl",
    "experimental-webgl",
  ];
  for (const n of names) {
    try {
      const ctx = canvas.getContext(n, options) as WebGLRenderingContext | null;
      if (ctx) return ctx;
    } catch {
      // try next
    }
  }
  return null;
}

function createShader(
  gl: WebGLRenderingContext,
  script: string,
  type: number
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, script);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader);
    console.error("Rain shader compile error:", err);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vert: string,
  frag: string
): WebGLProgram | null {
  const vs = createShader(gl, vert, gl.VERTEX_SHADER);
  const fs = createShader(gl, frag, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(program);
    console.error("Rain program link error:", err);
    gl.deleteProgram(program);
    return null;
  }

  // Position & texCoord buffers — the quad the shader paints onto.
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  return program;
}

export function activeTexture(gl: WebGLRenderingContext, i: number) {
  const unit = (gl as unknown as Record<string, number>)[`TEXTURE${i}`];
  gl.activeTexture(unit);
}

export function updateTexture(gl: WebGLRenderingContext, source: TexSource) {
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    // TexImageSource accepts all three of our source types.
    source as TexImageSource
  );
}

export function createTexture(
  gl: WebGLRenderingContext,
  source: TexSource | null,
  i: number
): WebGLTexture | null {
  const texture = gl.createTexture();
  activeTexture(gl, i);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (source != null) updateTexture(gl, source);
  return texture;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function createUniform(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  type: string,
  name: string,
  ...args: any[]
) {
  const location = gl.getUniformLocation(program, "u_" + name);
  const fn = (gl as unknown as Record<string, (...a: any[]) => void>)[
    "uniform" + type
  ];
  fn.call(gl, location, ...args);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function drawRect(gl: WebGLRenderingContext) {
  const x1 = -1;
  const x2 = 1;
  const y1 = -1;
  const y2 = 1;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
