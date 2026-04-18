/**
 * RainRenderer — composites the Raindrops simulation's water-map
 * canvas over a foreground/background texture pair with a WebGL
 * fragment shader that does the per-pixel refraction. Ported from
 * codrops/RainEffect's rain-renderer.js.
 */

import { VERT_SHADER, FRAG_SHADER } from "./shaders";
import {
  activeTexture,
  createProgram,
  createTexture,
  createUniform,
  drawRect,
  getContext,
  updateTexture,
} from "./webgl";

export interface RainRendererOptions {
  renderShadow: boolean;
  minRefraction: number;
  maxRefraction: number;
  brightness: number;
  alphaMultiply: number;
  alphaSubtract: number;
  parallaxBg: number;
  parallaxFg: number;
}

export const DEFAULT_RENDERER_OPTIONS: RainRendererOptions = {
  renderShadow: false,
  minRefraction: 256,
  maxRefraction: 512,
  brightness: 1,
  alphaMultiply: 20,
  alphaSubtract: 5,
  parallaxBg: 5,
  parallaxFg: 20,
};

export class RainRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly canvasLiquid: HTMLCanvasElement;
  private readonly imageFg: HTMLImageElement | HTMLCanvasElement;
  private readonly imageBg: HTMLImageElement | HTMLCanvasElement;
  private readonly imageShine: HTMLImageElement | null;
  private readonly options: RainRendererOptions;

  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private rafId: number | null = null;

  /** Applied on each frame — mouse-parallax the scene for a little
   *  atmosphere. Zero by default. */
  parallaxX = 0;
  parallaxY = 0;

  private readonly textures: Array<{
    name: string;
    img: HTMLImageElement | HTMLCanvasElement;
  }>;

  constructor(
    canvas: HTMLCanvasElement,
    canvasLiquid: HTMLCanvasElement,
    imageFg: HTMLImageElement | HTMLCanvasElement,
    imageBg: HTMLImageElement | HTMLCanvasElement,
    imageShine: HTMLImageElement | null = null,
    options: Partial<RainRendererOptions> = {}
  ) {
    this.canvas = canvas;
    this.canvasLiquid = canvasLiquid;
    this.imageFg = imageFg;
    this.imageBg = imageBg;
    this.imageShine = imageShine;
    this.options = { ...DEFAULT_RENDERER_OPTIONS, ...options };

    this.textures = [
      { name: "textureShine", img: imageShine ?? fallbackCanvas() },
      { name: "textureFg", img: imageFg },
      { name: "textureBg", img: imageBg },
    ];

    this.init();
  }

  private init() {
    const gl = getContext(this.canvas, { alpha: false });
    if (!gl) {
      console.warn("Rain effect disabled — WebGL unavailable.");
      return;
    }
    this.gl = gl;

    this.program = createProgram(gl, VERT_SHADER, FRAG_SHADER);
    if (!this.program) return;
    gl.useProgram(this.program);

    createUniform(gl, this.program, "2f", "resolution", this.canvas.width, this.canvas.height);
    const ratio =
      ("width" in this.imageBg ? this.imageBg.width : 1) /
      ("height" in this.imageBg ? this.imageBg.height : 1);
    createUniform(gl, this.program, "1f", "textureRatio", ratio);
    createUniform(gl, this.program, "1i", "renderShine", this.imageShine ? 1 : 0);
    createUniform(gl, this.program, "1i", "renderShadow", this.options.renderShadow ? 1 : 0);
    createUniform(gl, this.program, "1f", "minRefraction", this.options.minRefraction);
    createUniform(gl, this.program, "1f", "refractionDelta", this.options.maxRefraction - this.options.minRefraction);
    createUniform(gl, this.program, "1f", "brightness", this.options.brightness);
    createUniform(gl, this.program, "1f", "alphaMultiply", this.options.alphaMultiply);
    createUniform(gl, this.program, "1f", "alphaSubtract", this.options.alphaSubtract);
    createUniform(gl, this.program, "1f", "parallaxBg", this.options.parallaxBg);
    createUniform(gl, this.program, "1f", "parallaxFg", this.options.parallaxFg);

    // Texture 0 = the water map (Raindrops canvas).
    createTexture(gl, null, 0);
    createUniform(gl, this.program, "1i", "waterMap", 0);

    // Textures 1+ = the scene.
    this.textures.forEach((t, i) => {
      createTexture(gl, t.img, i + 1);
      createUniform(gl, this.program!, "1i", t.name, i + 1);
    });

    this.draw();
  }

  private draw = () => {
    if (!this.gl || !this.program) return;
    this.gl.useProgram(this.program);
    createUniform(this.gl, this.program, "2f", "parallax", this.parallaxX, this.parallaxY);

    // Water map updates every frame — the drops have moved.
    activeTexture(this.gl, 0);
    updateTexture(this.gl, this.canvasLiquid);

    drawRect(this.gl);
    this.rafId = requestAnimationFrame(this.draw);
  };

  /** Re-upload the scene textures (useful on weather change — unused
   *  here but kept for parity with the upstream API). */
  updateTextures() {
    if (!this.gl) return;
    this.textures.forEach((t, i) => {
      activeTexture(this.gl!, i + 1);
      updateTexture(this.gl!, t.img);
    });
  }

  destroy() {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
  }
}

function fallbackCanvas() {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 2;
  return c;
}
