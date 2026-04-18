/**
 * GLSL shaders — water refraction pair. Ported (verbatim structure,
 * tightened whitespace) from codrops/RainEffect's simple.vert and
 * water.frag. The fragment shader reads the Raindrops water-map and
 * refracts `u_textureFg` through each drop, composited over
 * `u_textureBg`. See raindrops.ts for what each channel of the water
 * map encodes.
 */

export const VERT_SHADER = `
precision mediump float;

attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAG_SHADER = `
precision mediump float;

uniform sampler2D u_waterMap;
uniform sampler2D u_textureShine;
uniform sampler2D u_textureFg;
uniform sampler2D u_textureBg;

uniform vec2  u_resolution;
uniform vec2  u_parallax;
uniform float u_parallaxFg;
uniform float u_parallaxBg;
uniform float u_textureRatio;
uniform bool  u_renderShine;
uniform bool  u_renderShadow;
uniform float u_minRefraction;
uniform float u_refractionDelta;
uniform float u_brightness;
uniform float u_alphaMultiply;
uniform float u_alphaSubtract;

vec4 blend(vec4 bg, vec4 fg) {
  vec3 bgm = bg.rgb * bg.a;
  vec3 fgm = fg.rgb * fg.a;
  float ia = 1.0 - fg.a;
  float a  = fg.a + bg.a * ia;
  vec3 rgb = a != 0.0 ? (fgm + bgm * ia) / a : vec3(0.0);
  return vec4(rgb, a);
}

vec2 pixel() {
  return vec2(1.0, 1.0) / u_resolution;
}

vec2 parallax(float v) {
  return u_parallax * pixel() * v;
}

vec2 texCoord() {
  return vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y) / u_resolution;
}

// Scales the bg up to fill the container proportionally.
vec2 scaledTexCoord() {
  float ratio = u_resolution.x / u_resolution.y;
  vec2 scale  = vec2(1.0);
  vec2 offset = vec2(0.0);
  float rd = ratio - u_textureRatio;
  if (rd >= 0.0) {
    scale.y  = 1.0 + rd;
    offset.y = rd / 2.0;
  } else {
    scale.x  = 1.0 - rd;
    offset.x = -rd / 2.0;
  }
  return (texCoord() + offset) / scale;
}

vec4 fgColor(float x, float y) {
  float p2 = u_parallaxFg * 2.0;
  vec2 s = vec2(
    (u_resolution.x + p2) / u_resolution.x,
    (u_resolution.y + p2) / u_resolution.y
  );
  vec2 st = texCoord() / s;
  vec2 off = vec2(
    (1.0 - (1.0 / s.x)) / 2.0,
    (1.0 - (1.0 / s.y)) / 2.0
  );
  return texture2D(
    u_waterMap,
    (st + off) + (pixel() * vec2(x, y)) + parallax(u_parallaxFg)
  );
}

void main() {
  vec4 bg = texture2D(u_textureBg, scaledTexCoord() + parallax(u_parallaxBg));
  vec4 cur = fgColor(0.0, 0.0);

  float d = cur.b;   // thickness
  float x = cur.g;   // refraction x
  float y = cur.r;   // refraction y

  float a = clamp(cur.a * u_alphaMultiply - u_alphaSubtract, 0.0, 1.0);

  vec2 refraction = (vec2(x, y) - 0.5) * 2.0;
  vec2 refractionParallax = parallax(u_parallaxBg - u_parallaxFg);
  vec2 refractionPos = scaledTexCoord()
    + (pixel() * refraction * (u_minRefraction + (d * u_refractionDelta)))
    + refractionParallax;

  vec4 tex = texture2D(u_textureFg, refractionPos);

  if (u_renderShine) {
    float maxShine = 490.0;
    float minShine = maxShine * 0.18;
    vec2 shinePos = vec2(0.5, 0.5)
      + ((1.0 / 512.0) * refraction) * -(minShine + ((maxShine - minShine) * d));
    vec4 shine = texture2D(u_textureShine, shinePos);
    tex = blend(tex, shine);
  }

  vec4 fg = vec4(tex.rgb * u_brightness, a);

  if (u_renderShadow) {
    float borderAlpha = fgColor(0.0, 0.0 - (d * 6.0)).a;
    borderAlpha = borderAlpha * u_alphaMultiply - (u_alphaSubtract + 0.5);
    borderAlpha = clamp(borderAlpha, 0.0, 1.0) * 0.2;
    fg = blend(vec4(0.0, 0.0, 0.0, borderAlpha), fg);
  }

  gl_FragColor = blend(bg, fg);
}
`;
