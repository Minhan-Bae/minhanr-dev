/**
 * Raindrops — 2D canvas simulation of beading / falling / merging water
 * drops. Ported to TypeScript from Lucas Bebber's codrops/RainEffect
 * (licensed for free integration per the upstream README).
 *
 * The simulation output is a canvas (`this.canvas`) whose pixels encode
 * where drops currently sit and in what direction each point should
 * refract the background through them — that canvas is then consumed
 * by `RainRenderer` as a WebGL water-map texture.
 *
 * Shape encoding produced here (read by water.frag):
 *   • alpha  → drop mask (outside drops = 0)
 *   • R      → Y component of the refraction normal
 *   • G      → X component of the refraction normal
 *   • B      → drop "thickness" (larger drops refract more)
 *
 * All positions / sizes are in CSS pixels. `scale` is the DPR.
 */

const DROP_SIZE = 64;

export interface RaindropsOptions {
  minR: number;
  maxR: number;
  maxDrops: number;
  rainChance: number;
  rainLimit: number;
  dropletsRate: number;
  dropletsSize: [number, number];
  dropletsCleaningRadiusMultiplier: number;
  raining: boolean;
  globalTimeScale: number;
  trailRate: number;
  autoShrink: boolean;
  spawnArea: [number, number];
  trailScaleRange: [number, number];
  collisionRadius: number;
  collisionRadiusIncrease: number;
  dropFallMultiplier: number;
  collisionBoostMultiplier: number;
  collisionBoost: number;
}

export const DEFAULT_OPTIONS: RaindropsOptions = {
  minR: 10,
  maxR: 40,
  maxDrops: 900,
  rainChance: 0.3,
  rainLimit: 3,
  dropletsRate: 50,
  dropletsSize: [2, 4],
  dropletsCleaningRadiusMultiplier: 0.43,
  raining: true,
  globalTimeScale: 1,
  trailRate: 1,
  autoShrink: true,
  spawnArea: [-0.1, 0.95],
  trailScaleRange: [0.2, 0.5],
  collisionRadius: 0.65,
  collisionRadiusIncrease: 0.01,
  dropFallMultiplier: 1,
  collisionBoostMultiplier: 0.05,
  collisionBoost: 1,
};

interface Drop {
  x: number;
  y: number;
  r: number;
  spreadX: number;
  spreadY: number;
  momentum: number;
  momentumX: number;
  lastSpawn: number;
  nextSpawn: number;
  parent: Drop | null;
  isNew: boolean;
  killed: boolean;
  shrink: number;
}

function makeDrop(patch: Partial<Drop> = {}): Drop {
  return {
    x: 0,
    y: 0,
    r: 0,
    spreadX: 0,
    spreadY: 0,
    momentum: 0,
    momentumX: 0,
    lastSpawn: 0,
    nextSpawn: 0,
    parent: null,
    isNew: true,
    killed: false,
    shrink: 0,
    ...patch,
  };
}

type Interpolation = (n: number) => number;

function random(
  from: number | null = null,
  to: number | null = null,
  interp: Interpolation | null = null
): number {
  let f = from;
  let t = to;
  if (f == null) {
    f = 0;
    t = 1;
  } else if (f != null && t == null) {
    t = f;
    f = 0;
  }
  const delta = (t as number) - f;
  const fn = interp ?? ((n: number) => n);
  return f + fn(Math.random()) * delta;
}

function chance(c: number) {
  return Math.random() <= c;
}

function times(n: number, fn: (i: number) => void) {
  for (let i = 0; i < n; i++) fn(i);
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

export class Raindrops {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  private readonly dropAlpha: HTMLImageElement;
  private readonly dropColor: HTMLImageElement;
  options: RaindropsOptions;

  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  private readonly dropletsPixelDensity = 1;
  private readonly droplets: HTMLCanvasElement;
  private readonly dropletsCtx: CanvasRenderingContext2D;
  private dropletsCounter = 0;

  private drops: Drop[] = [];
  private dropsGfx: HTMLCanvasElement[] = [];
  private clearDropletsGfx: HTMLCanvasElement | null = null;
  private textureCleaningIterations = 0;
  private lastRender: number | null = null;
  private rafId: number | null = null;

  constructor(
    width: number,
    height: number,
    scale: number,
    dropAlpha: HTMLImageElement,
    dropColor: HTMLImageElement,
    options: Partial<RaindropsOptions> = {}
  ) {
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.dropAlpha = dropAlpha;
    this.dropColor = dropColor;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d")!;

    this.droplets = createCanvas(
      width * this.dropletsPixelDensity,
      height * this.dropletsPixelDensity
    );
    this.dropletsCtx = this.droplets.getContext("2d")!;

    this.renderDropsGfx();
    this.update();
  }

  /** Pre-render 255 versions of a drop with thickness encoded in blue. */
  private renderDropsGfx() {
    const dropBuffer = createCanvas(DROP_SIZE, DROP_SIZE);
    const dropBufferCtx = dropBuffer.getContext("2d")!;

    this.dropsGfx = Array.from({ length: 255 }, (_, i) => {
      const drop = createCanvas(DROP_SIZE, DROP_SIZE);
      const dropCtx = drop.getContext("2d")!;

      dropBufferCtx.clearRect(0, 0, DROP_SIZE, DROP_SIZE);

      // Color — the refraction-encoding image (R = y, G = x of the
      // normal, at each pixel of the drop shape).
      dropBufferCtx.globalCompositeOperation = "source-over";
      dropBufferCtx.drawImage(this.dropColor, 0, 0, DROP_SIZE, DROP_SIZE);

      // Blue overlay encodes drop thickness (the shader uses it to
      // scale the refraction amount — bigger drops refract more).
      dropBufferCtx.globalCompositeOperation = "screen";
      dropBufferCtx.fillStyle = `rgba(0,0,${i},1)`;
      dropBufferCtx.fillRect(0, 0, DROP_SIZE, DROP_SIZE);

      // Alpha — clamps the whole drop to the soft-edged circle shape.
      dropCtx.globalCompositeOperation = "source-over";
      dropCtx.drawImage(this.dropAlpha, 0, 0, DROP_SIZE, DROP_SIZE);

      dropCtx.globalCompositeOperation = "source-in";
      dropCtx.drawImage(dropBuffer, 0, 0, DROP_SIZE, DROP_SIZE);

      return drop;
    });

    // Circle brush used for "cleaning" the droplets layer when a drop
    // slides over it — this is what makes the wet streak behind a
    // falling drop look wiped-clean.
    this.clearDropletsGfx = createCanvas(128, 128);
    const ctx = this.clearDropletsGfx.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();
  }

  private get deltaR() {
    return this.options.maxR - this.options.minR;
  }
  private get area() {
    return (this.width * this.height) / this.scale;
  }
  private get areaMultiplier() {
    return Math.sqrt(this.area / (1024 * 768));
  }

  private drawDroplet(x: number, y: number, r: number) {
    const d = makeDrop({
      x: x * this.dropletsPixelDensity,
      y: y * this.dropletsPixelDensity,
      r: r * this.dropletsPixelDensity,
    });
    this.drawDrop(this.dropletsCtx, d);
  }

  private drawDrop(ctx: CanvasRenderingContext2D, drop: Drop) {
    if (this.dropsGfx.length === 0) return;
    const { x, y, r, spreadX, spreadY } = drop;
    const scaleX = 1;
    const scaleY = 1.5;

    let d = Math.max(0, Math.min(1, ((r - this.options.minR) / this.deltaR) * 0.9));
    d *= 1 / ((drop.spreadX + drop.spreadY) * 0.5 + 1);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    const idx = Math.floor(d * (this.dropsGfx.length - 1));
    ctx.drawImage(
      this.dropsGfx[idx],
      (x - r * scaleX * (spreadX + 1)) * this.scale,
      (y - r * scaleY * (spreadY + 1)) * this.scale,
      r * 2 * scaleX * (spreadX + 1) * this.scale,
      r * 2 * scaleY * (spreadY + 1) * this.scale
    );
  }

  private clearDroplets(x: number, y: number, r = 30) {
    if (!this.clearDropletsGfx) return;
    const ctx = this.dropletsCtx;
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(
      this.clearDropletsGfx,
      (x - r) * this.dropletsPixelDensity * this.scale,
      (y - r) * this.dropletsPixelDensity * this.scale,
      r * 2 * this.dropletsPixelDensity * this.scale,
      r * 2 * this.dropletsPixelDensity * this.scale * 1.5
    );
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private createDrop(patch: Partial<Drop>): Drop | null {
    if (this.drops.length >= this.options.maxDrops * this.areaMultiplier) return null;
    return makeDrop(patch);
  }

  clearDrops() {
    this.drops.forEach((drop) => {
      setTimeout(
        () => {
          drop.shrink = 0.1 + random(0.5)!;
        },
        random(1200)!
      );
    });
    this.textureCleaningIterations = 50;
  }

  private updateRain(timeScale: number): Drop[] {
    const fresh: Drop[] = [];
    if (!this.options.raining) return fresh;

    const limit = this.options.rainLimit * timeScale * this.areaMultiplier;
    let count = 0;
    while (
      chance(this.options.rainChance * timeScale * this.areaMultiplier) &&
      count < limit
    ) {
      count++;
      const r = random(this.options.minR, this.options.maxR, (n) => Math.pow(n, 3))!;
      const d = this.createDrop({
        x: random(this.width / this.scale)!,
        y: random(
          (this.height / this.scale) * this.options.spawnArea[0],
          (this.height / this.scale) * this.options.spawnArea[1]
        )!,
        r,
        momentum: 1 + (r - this.options.minR) * 0.1 + random(2)!,
        spreadX: 1.5,
        spreadY: 1.5,
      });
      if (d) fresh.push(d);
    }
    return fresh;
  }

  private updateDroplets(timeScale: number) {
    if (this.textureCleaningIterations > 0) {
      this.textureCleaningIterations -= 1 * timeScale;
      this.dropletsCtx.globalCompositeOperation = "destination-out";
      this.dropletsCtx.fillStyle = `rgba(0,0,0,${0.05 * timeScale})`;
      this.dropletsCtx.fillRect(
        0,
        0,
        this.width * this.dropletsPixelDensity,
        this.height * this.dropletsPixelDensity
      );
    }
    if (this.options.raining) {
      this.dropletsCounter +=
        this.options.dropletsRate * timeScale * this.areaMultiplier;
      times(this.dropletsCounter, () => {
        this.dropletsCounter--;
        this.drawDroplet(
          random(this.width / this.scale)!,
          random(this.height / this.scale)!,
          random(
            this.options.dropletsSize[0],
            this.options.dropletsSize[1],
            (n) => n * n
          )!
        );
      });
    }
    this.ctx.drawImage(this.droplets, 0, 0, this.width, this.height);
  }

  private updateDrops(timeScale: number) {
    let newDrops: Drop[] = [];

    this.updateDroplets(timeScale);
    const rainDrops = this.updateRain(timeScale);
    newDrops = newDrops.concat(rainDrops);

    // Sort so collision checks against downstream drops are stable
    // (i.e. a drop tests only against drops below-right of it).
    this.drops.sort((a, b) => {
      const va = a.y * (this.width / this.scale) + a.x;
      const vb = b.y * (this.width / this.scale) + b.x;
      return va > vb ? 1 : va === vb ? 0 : -1;
    });

    this.drops.forEach((drop, i) => {
      if (drop.killed) return;

      // Gravity kicks in only for drops big enough to overcome
      // surface tension — small drops just sit.
      if (
        chance(
          (drop.r - this.options.minR * this.options.dropFallMultiplier) *
            (0.1 / this.deltaR) *
            timeScale
        )
      ) {
        drop.momentum += random((drop.r / this.options.maxR) * 4)!;
      }

      // Clean up drops that have shrunk below the min size.
      if (this.options.autoShrink && drop.r <= this.options.minR && chance(0.05 * timeScale)) {
        drop.shrink += 0.01;
      }
      drop.r -= drop.shrink * timeScale;
      if (drop.r <= 0) drop.killed = true;

      // Trail — moving drops spawn smaller drops behind them as a
      // wet streak.
      if (this.options.raining) {
        drop.lastSpawn += drop.momentum * timeScale * this.options.trailRate;
        if (drop.lastSpawn > drop.nextSpawn) {
          const trail = this.createDrop({
            x: drop.x + random(-drop.r, drop.r)! * 0.1,
            y: drop.y - drop.r * 0.01,
            r:
              drop.r *
              random(
                this.options.trailScaleRange[0],
                this.options.trailScaleRange[1]
              )!,
            spreadY: drop.momentum * 0.1,
            parent: drop,
          });
          if (trail) {
            newDrops.push(trail);
            drop.r *= Math.pow(0.97, timeScale);
            drop.lastSpawn = 0;
            drop.nextSpawn =
              random(this.options.minR, this.options.maxR)! -
              drop.momentum * 2 * this.options.trailRate +
              (this.options.maxR - drop.r);
          }
        }
      }

      drop.spreadX *= Math.pow(0.4, timeScale);
      drop.spreadY *= Math.pow(0.7, timeScale);

      const moved = drop.momentum > 0;
      if (moved && !drop.killed) {
        drop.y += drop.momentum * this.options.globalTimeScale;
        drop.x += drop.momentumX * this.options.globalTimeScale;
        if (drop.y > this.height / this.scale + drop.r) drop.killed = true;
      }

      const checkCollision = (moved || drop.isNew) && !drop.killed;
      drop.isNew = false;

      if (checkCollision) {
        this.drops.slice(i + 1, i + 70).forEach((drop2) => {
          if (
            drop !== drop2 &&
            drop.r > drop2.r &&
            drop.parent !== drop2 &&
            drop2.parent !== drop &&
            !drop2.killed
          ) {
            const dx = drop2.x - drop.x;
            const dy = drop2.y - drop.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (
              d <
              (drop.r + drop2.r) *
                (this.options.collisionRadius +
                  drop.momentum *
                    this.options.collisionRadiusIncrease *
                    timeScale)
            ) {
              const pi = Math.PI;
              const a1 = pi * (drop.r * drop.r);
              const a2 = pi * (drop2.r * drop2.r);
              let targetR = Math.sqrt((a1 + a2 * 0.8) / pi);
              if (targetR > this.options.maxR) targetR = this.options.maxR;
              drop.r = targetR;
              drop.momentumX += dx * 0.1;
              drop.spreadX = 0;
              drop.spreadY = 0;
              drop2.killed = true;
              drop.momentum = Math.max(
                drop2.momentum,
                Math.min(
                  40,
                  drop.momentum +
                    targetR * this.options.collisionBoostMultiplier +
                    this.options.collisionBoost
                )
              );
            }
          }
        });
      }

      // Slow momentum decay.
      drop.momentum -=
        Math.max(1, this.options.minR * 0.5 - drop.momentum) * 0.1 * timeScale;
      if (drop.momentum < 0) drop.momentum = 0;
      drop.momentumX *= Math.pow(0.7, timeScale);

      if (!drop.killed) {
        newDrops.push(drop);
        if (moved && this.options.dropletsRate > 0) {
          this.clearDroplets(
            drop.x,
            drop.y,
            drop.r * this.options.dropletsCleaningRadiusMultiplier
          );
        }
        this.drawDrop(this.ctx, drop);
      }
    });

    this.drops = newDrops;
  }

  private update = () => {
    this.clearCanvas();

    const now = Date.now();
    if (this.lastRender == null) this.lastRender = now;
    const deltaT = now - this.lastRender;
    let timeScale = deltaT / ((1 / 60) * 1000);
    if (timeScale > 1.1) timeScale = 1.1;
    timeScale *= this.options.globalTimeScale;
    this.lastRender = now;

    this.updateDrops(timeScale);

    this.rafId = requestAnimationFrame(this.update);
  };

  destroy() {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
  }
}
