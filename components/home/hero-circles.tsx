"use client";

import { useEffect, useRef } from "react";
import { background, circle } from "./ponpon-shaders";

const SCREEN_VERT = `
precision highp float;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Chapters draws the circle on a plane viewport*3, sitting behind the camera's focus plane.
// At fov 45 and camera z 5 that plane reads as 2.5 screens tall.
const CIRCLE_VERT = `
precision highp float;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vec2 uv = position * 0.5 + 0.5;
  vUv = (uv - 0.5) / 2.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const PRELUDE = "precision highp float;\nprecision highp sampler2D;\n";
const HATCH_NAME = "BUDDY";

const ARCH_FILL = `
float map(float oldVal, float oldMin, float oldMax, float newMin, float newMax) {
  float old = oldMax - oldMin;
  float new = newMax - newMin;
  return (((oldVal - oldMin) * new) / old) + newMin;
}
float cmap(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
  return clamp(map(oldValue, oldMin, oldMax, newMin, newMax), min(newMax, newMin), max(newMin, newMax));
}
float archFill(vec2 uv, vec4 fluid) {
  vec2 maskUv = uv;
  maskUv.xy -= fluid.xy * 0.00005;
  maskUv.y += (1. - uIntro) * 0.15;
  float aspect = max(0.001, uResolution.x / uResolution.y);
  vec2 archP = vec2((maskUv.x - 0.5) * aspect, maskUv.y);
  float outlineW = 0.0045;
  float corner = 0.5 * aspect;
  float breathe = max(sin(uTime * .9) * 0.012, 0.0);
  float radius = min(corner * (1.0 + breathe), 0.9 - outlineW);
  float dist = length(archP);
  return step(dist, radius) * step(0.0, maskUv.y);
}
`;

const NAME_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D tText;
uniform sampler2D tFluid;
uniform vec2 uResolution;
uniform float uBlur;
uniform float uAlpha;
uniform float uTime;
uniform float uIntro;
uniform float uHovered;
out vec4 fragColor;
${ARCH_FILL}
vec4 glyph(vec2 screenPx) {
  vec2 uv = screenPx / uResolution;
  vec4 fluid = texture(tFluid, uv);
  return texture(tText, uv - fluid.rg * 0.0001);
}

void main() {
  vec2 origin = gl_FragCoord.xy;
  vec4 acc = glyph(origin);
  float weight = 1.0;
  if (uBlur > 0.5) {
    for (int i = 0; i < 10; i++) {
      float a = float(i) * 0.62831853;
      vec2 dir = vec2(cos(a), sin(a));
      acc += glyph(origin + dir * uBlur);
      acc += glyph(origin + dir * uBlur * 0.45);
      weight += 2.0;
    }
  }
  acc /= weight;
  vec2 uv = origin / uResolution;
  float onDark = archFill(uv, texture(tFluid, uv));
  vec3 ink = mix(vec3(0.0), vec3(1.0), onDark);
  fragColor = vec4(ink, acc.a * uAlpha);
}
`;

// Same dome as the comic portal: circle seated on the bottom edge, page color outside.
const ARCH_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D tMap;
uniform sampler2D tFluid;
uniform sampler2D tMask;
uniform vec2 uResolution;
uniform float uTime;
uniform float uIntro;
uniform float uStageWidth;
uniform float uHovered;
uniform float uPicture;
uniform sampler2D tCats;
uniform vec3 uBackgroundColor;
uniform vec3 uOutlineColor;
in vec2 vUv;
out vec4 fragColor;
${ARCH_FILL}
vec2 scaleUV(vec2 uv, vec2 scale, vec2 origin) {
  vec3 u = vec3(uv, 1.0);
  mat3 mo1 = mat3(1, 0, -origin.x, 0, 1, -origin.y, 0, 0, 1);
  mat3 mo2 = mat3(1, 0, origin.x, 0, 1, origin.y, 0, 0, 1);
  mat3 ms = mat3(1.0 / scale.x, 0, 0, 0, 1.0 / scale.y, 0, 0, 0, 1);
  u = u * mo1;
  u = u * ms;
  u = u * mo2;
  return u.xy;
}
vec2 scaleUV(vec2 uv, vec2 scale) {
  return scaleUV(uv, scale, vec2(0.5));
}

void main() {
  vec2 fluidUv = gl_FragCoord.xy / uResolution;
  vec2 uv = vUv;
  vec4 fluid = texture(tFluid, fluidUv);
  float maskR = archFill(uv, fluid);
  float aspect = max(0.001, uResolution.x / uResolution.y);
  vec2 maskUv = uv;
  maskUv.xy -= fluid.xy * 0.00005;
  maskUv.y += (1. - uIntro) * 0.15;
  vec2 archP = vec2((maskUv.x - 0.5) * aspect, maskUv.y);
  float outlineW = 0.0045;
  float corner = 0.5 * aspect;
  float breathe = max(sin(uTime * .9) * 0.012, 0.0);
  float radius = min(corner * (1.0 + breathe), 0.9 - outlineW);
  float dist = length(archP);
  float maskG = step(abs(dist - radius), 1.9 / uResolution.y) * step(0.0, maskUv.y);
  vec4 mask = vec4(maskR, maskG, 0., 1.);
  vec3 stroke = mix(vec3(0.), uOutlineColor, min(1., fluid.z * .23));
  vec3 color = uBackgroundColor;
  color = mix(color, stroke, mask.g);
  float alpha = max(1.0 - mask.r, mask.g);
  if (uPicture > 0.5) {
    vec2 shift = fluid.xy * 0.0001;
    vec4 scene = texture(tMap, uv - shift);
    vec4 cats = texture(tCats, uv - shift);
    color = mix(scene.rgb, uBackgroundColor, 1.0 - mask.r);
    color = mix(color, stroke, mask.g);
    color = mix(color, cats.rgb, cats.a);
    alpha = 1.0;
  }
  fragColor = vec4(color, alpha);
}
`;

function glslVert(source: string) {
  return `#version 300 es\n${source.replace(/\battribute\b/g, "in").replace(/\bvarying\b/g, "out")}`;
}

function glslFrag(source: string) {
  const body = source
    .replace(/\bvarying\b/g, "in")
    .replace(/\btexture2D\b/g, "texture")
    .replace(/\bgl_FragColor\b/g, "fragColor");
  return `#version 300 es\nprecision highp float;\nprecision highp sampler2D;\nout vec4 fragColor;\n${body}`;
}

const TRI = new Float32Array([-1, -1, 3, -1, -1, 3]);
const UV = new Float32Array([0, 0, 2, 0, 0, 2]);

type Rgb = [number, number, number];

function hex(value: string): Rgb {
  const n = Number.parseInt(value.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const PAIRS: Array<{ bg: Rgb; bg2: Rgb; c: Rgb; c2: Rgb }> = [
  { bg: hex("#FFC3DA"), bg2: hex("#FC6E0A"), c: hex("#EB8DB7"), c2: hex("#F87800") },
  { bg: hex("#F87800"), bg2: hex("#EB8DB7"), c: hex("#EB8DB7"), c2: hex("#F87800") },
  { bg: hex("#7E7EFF"), bg2: hex("#EB8DB7"), c: hex("#EB8DB7"), c2: hex("#7E7EFF") },
  { bg: hex("#F87800"), bg2: hex("#7E7EFF"), c: hex("#7E7EFF"), c2: hex("#F87800") },
  { bg: hex("#ED1E24"), bg2: hex("#FFBC03"), c: hex("#FFBC03"), c2: hex("#ED1E24") },
  { bg: hex("#7E7EFF"), bg2: hex("#ED1E24"), c: hex("#ED1E24"), c2: hex("#7E7EFF") },
  { bg: hex("#72DA7E"), bg2: hex("#F5B347"), c: hex("#F5B347"), c2: hex("#72DA7E") },
];

const HOLD = 4200;
const BLEND = 1400;

function smooth(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function colorsAt(ms: number) {
  const span = HOLD + BLEND;
  const x = ms % (span * PAIRS.length);
  const index = Math.floor(x / span);
  const local = x - index * span;
  const next = (index + 1) % PAIRS.length;
  if (local <= HOLD) return { ...PAIRS[index], index };
  const t = smooth((local - HOLD) / BLEND);
  const from = PAIRS[index];
  const to = PAIRS[next];
  return {
    index,
    bg: mixRgb(from.bg, to.bg, t),
    bg2: mixRgb(from.bg2, to.bg2, t),
    c: mixRgb(from.c, to.c, t),
    c2: mixRgb(from.c2, to.c2, t),
  };
}






export function HeroCircles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const cats = parent?.querySelector<HTMLElement>(".hero-cats") ?? null;
    if (!canvas || !parent) return undefined;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    });
    if (!gl) return undefined;

    const compile = (vert: string, frag: string) => {
      const shader = (type: number, source: string) => {
        const item = gl.createShader(type);
        if (!item) return null;
        gl.shaderSource(item, source);
        gl.compileShader(item);
        if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(item));
          gl.deleteShader(item);
          return null;
        }
        return item;
      };
      const vs = shader(gl.VERTEX_SHADER, vert);
      const fs = shader(gl.FRAGMENT_SHADER, frag);
      if (!vs || !fs) return null;
      const program = gl.createProgram();
      if (!program) return null;
      gl.bindAttribLocation(program, 0, "position");
      gl.bindAttribLocation(program, 1, "uv");
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    const display = compile(glslVert(SCREEN_VERT), glslFrag(PRELUDE + background));
    const disk = compile(glslVert(CIRCLE_VERT), glslFrag(PRELUDE + circle));
    if (!display || !disk) return undefined;
    const nameProg = compile(glslVert(SCREEN_VERT), NAME_FRAG);
    const arch = compile(glslVert(SCREEN_VERT), ARCH_FRAG);

    const position = gl.createBuffer();
    const uv = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position);
    gl.bufferData(gl.ARRAY_BUFFER, TRI, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, uv);
    gl.bufferData(gl.ARRAY_BUFFER, UV, gl.STATIC_DRAW);

    const loc = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>();
    const uniform = (program: WebGLProgram, name: string) => {
      let table = loc.get(program);
      if (!table) {
        table = new Map();
        loc.set(program, table);
      }
      if (!table.has(name)) table.set(name, gl.getUniformLocation(program, name));
      return table.get(name) ?? null;
    };

    const bindQuad = (program: WebGLProgram) => {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, position);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const uvOn = gl.getAttribLocation(program, "uv") >= 0;
      if (uvOn && uv) {
        gl.bindBuffer(gl.ARRAY_BUFFER, uv);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
      } else {
        gl.disableVertexAttribArray(1);
      }
    };

    const sceneTex = gl.createTexture();
    const sceneFbo = gl.createFramebuffer();
    let sceneW = 0;
    let sceneH = 0;
    if (sceneTex) {
      gl.bindTexture(gl.TEXTURE_2D, sceneTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    const ensureScene = () => {
      if (!arch || !sceneTex || !sceneFbo || (sceneW === width && sceneH === height)) return;
      sceneW = width;
      sceneH = height;
      gl.bindTexture(gl.TEXTURE_2D, sceneTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
    };

    const drawTo = (program: WebGLProgram, target: WebGLFramebuffer | null = null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.viewport(0, 0, width, height);
      bindQuad(program);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const GRID = 50;
    const STRENGTH = 0.07;
    const RELAX = 0.84;
    const SHIFT = 200;
    const cells = new Float32Array(GRID * GRID * 4);
    const gridTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gridTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, GRID, GRID, 0, gl.RGBA, gl.FLOAT, cells);
    const pictureTex = gl.createTexture();
    const catTex = gl.createTexture();
    const catProbe = gl.createFramebuffer();
    let pictureReady = false;
    const prepTex = (tex: WebGLTexture | null) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    };
    gl.activeTexture(gl.TEXTURE0);
    prepTex(pictureTex);
    prepTex(catTex);
    const asCanvas = (node: Element | null | undefined) =>
      node && node.tagName === "CANVAS" ? (node as HTMLCanvasElement) : null;
    const uploadCanvas = (tex: WebGLTexture | null, source: HTMLCanvasElement | null) => {
      if (!tex || !source || source.width < 2 || source.height < 2) return false;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      return gl.getError() === gl.NO_ERROR;
    };
    const pointer = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, ok: false };
    let width = 0;
    let height = 0;
    let frame = 0;
    let clock = 0;
    let elapsed = 0;
    let mask = 0;
    const started = performance.now();
    const nameCanvas = document.createElement("canvas");
    const nameInk = nameCanvas.getContext("2d");
    const nameTex = gl.createTexture();
    let paintedW = 0;
    let paintedH = 0;
    let fontReady = false;
    let revealAt = 0;
    gl.bindTexture(gl.TEXTURE_2D, nameTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    const anthropicLogo = new Image();
    const claudeLogo = new Image();
    let logosReady = false;
    const markLogos = () => {
      if (!anthropicLogo.naturalWidth || !claudeLogo.naturalWidth) return;
      logosReady = true;
      paintedW = 0;
    };
    anthropicLogo.onload = markLogos;
    claudeLogo.onload = markLogos;
    anthropicLogo.src = "/brand/anthropic-wordmark.svg";
    claudeLogo.src = "/brand/claude-symbol.svg";

    const paintName = () => {
      if (!fontReady || !nameInk || !nameTex || width < 2 || height < 2) return;
      if (paintedW === width && paintedH === height) return;
      const cssW = parent.clientWidth || width;
      const cssH = parent.clientHeight || height;
      const bleed = cssW / Math.max(cssH, 1) < 0.75 ? 1.45 : 1.08;
      let size = 640;
      const cap = Math.floor(780 * 0.9);
      nameInk.font = `700 ${size}px Silkscreen, monospace`;
      while (size > 72 && nameInk.measureText(HATCH_NAME).width > 2048 * 0.96) {
        size -= 8;
        nameInk.font = `700 ${size}px Silkscreen, monospace`;
      }
      if (size > cap) size = cap;
      const px = (size / 2048) * bleed * width;
      nameCanvas.width = width;
      nameCanvas.height = height;
      nameInk.clearRect(0, 0, width, height);
      nameInk.fillStyle = "#ffffff";
      nameInk.textAlign = "center";
      nameInk.textBaseline = "middle";
      nameInk.font = `700 ${px}px Silkscreen, monospace`;
      const showBuddyWord = false;
      if (showBuddyWord) nameInk.fillText(HATCH_NAME, width / 2, height / 2);
      const scale = width / cssW;
      const credit = Math.max(13, Math.round(16 * scale));
      const gap = Math.round(credit * 0.7);
      const nav = document.querySelector(".nav_fixed");
      const navBottom = nav ? nav.getBoundingClientRect().bottom : 72;
      const y = Math.round((navBottom + 16) * scale);
      let x = Math.round(cssW * 0.03 * scale);
      nameInk.textAlign = "left";
      nameInk.textBaseline = "middle";
      nameInk.font = `400 ${credit}px Geist, sans-serif`;
      nameInk.fillStyle = "rgba(255,255,255,0.72)";
      nameInk.fillText("powered by", x, y);
      x += nameInk.measureText("powered by").width + gap * 2;
      if (logosReady) {
        const logoH = Math.round(credit * 1.15);
        const anthW = logoH * (anthropicLogo.naturalWidth / anthropicLogo.naturalHeight);
        nameInk.drawImage(anthropicLogo, x, y - logoH / 2, anthW, logoH);
        x += anthW + gap * 2;
        nameInk.fillStyle = "#ffffff";
        nameInk.font = `500 ${credit}px Geist, sans-serif`;
        for (const model of ["Haiku", "Sonnet"]) {
          nameInk.drawImage(claudeLogo, x, y - logoH / 2, logoH, logoH);
          x += logoH + Math.round(gap * 0.65);
          nameInk.fillText(model, x, y);
          x += nameInk.measureText(model).width + gap * 2;
        }
      }
      gl.bindTexture(gl.TEXTURE_2D, nameTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nameCanvas);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      paintedW = width;
      paintedH = height;
    };

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.floor(parent.clientWidth * dpr));
      const nextH = Math.max(1, Math.floor(parent.clientHeight * dpr));
      if (nextW === width && nextH === height) return;
      width = nextW;
      height = nextH;
      canvas.width = width;
      canvas.height = height;
    };

    const pushPixels = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      for (let i = 0; i < cells.length; i += 4) {
        cells[i] *= RELAX;
        cells[i + 1] *= RELAX;
        cells[i + 2] *= 0.82;
      }
      if (!reduced && pointer.ok) {
        const gridMouseX = GRID * pointer.x;
        const gridMouseY = GRID * (1 - pointer.y);
        const reach = Math.min(width, height) * 0.14;
        const reachSq = reach * reach;
        for (let i = 0; i < GRID; i += 1) {
          for (let j = 0; j < GRID; j += 1) {
            const dx = ((i - gridMouseX) / GRID) * width;
            const dy = ((j - gridMouseY) / GRID) * height;
            const distance = dx * dx + dy * dy;
            if (distance >= reachSq) continue;
            const power = Math.min(3.6, reach / Math.sqrt(distance || 1));
            const index = (i + GRID * j) * 4;
            cells[index] += STRENGTH * 100 * SHIFT * pointer.vx * power;
            cells[index + 1] -= STRENGTH * 100 * SHIFT * pointer.vy * power;
            const near = 1 - Math.sqrt(distance) / reach;
            cells[index + 2] = Math.min(8, cells[index + 2] + near * 2.4);
          }
        }
      }
      pointer.vx *= 0.82;
      pointer.vy *= 0.82;
      if (!gridTex) return;
      gl.bindTexture(gl.TEXTURE_2D, gridTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, GRID, GRID, gl.RGBA, gl.FLOAT, cells);
    };

    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (!inside) {
        pointer.ok = false;
        return;
      }
      const mx = x / Math.max(rect.width, 1);
      const my = y / Math.max(rect.height, 1);
      if (!pointer.ok) {
        pointer.x = mx;
        pointer.y = my;
        pointer.px = mx;
        pointer.py = my;
        pointer.ok = true;
        return;
      }
      pointer.vx = mx - pointer.px;
      pointer.vy = my - pointer.py;
      pointer.px = mx;
      pointer.py = my;
      pointer.x = mx;
      pointer.y = my;
    };

    let warmFrames = 0;
    const draw = (now: number) => {
      fit();
      ensureScene();
      const showArch = true;
      const showCircles = false;
      const stage = showArch && arch && sceneFbo ? sceneFbo : null;
      const dt = Math.min(50, now - (elapsed || now));
      elapsed = now;
      clock += dt / 1000;
      mask = Math.min(1, (now - started) / 900);
      pushPixels();
      const colors = colorsAt(now);
      gl.disable(gl.BLEND);
      if (!showCircles) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, stage);
        gl.viewport(0, 0, width, height);
        gl.clearColor(14 / 255, 14 / 255, 14 / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      if (showCircles) {
      gl.useProgram(display);
      gl.uniform3f(uniform(display, "uColor"), colors.bg[0], colors.bg[1], colors.bg[2]);
      gl.uniform3f(uniform(display, "uColor2"), colors.bg2[0], colors.bg2[1], colors.bg2[2]);
      gl.uniform2f(uniform(display, "uResolution"), width, height);
      gl.uniform1f(uniform(display, "uAlpha"), 1);
      gl.uniform1f(uniform(display, "uDpr"), window.devicePixelRatio || 1);
      gl.uniform1f(uniform(display, "uTime"), now);
      drawTo(display, stage);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(disk);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gridTex);
      gl.uniform1i(uniform(disk, "tFluid"), 0);
      gl.uniform3f(uniform(disk, "uColor"), colors.c[0], colors.c[1], colors.c[2]);
      gl.uniform3f(uniform(disk, "uColor2"), colors.c2[0], colors.c2[1], colors.c2[2]);
      gl.uniform2f(uniform(disk, "uResolution"), width, height);
      gl.uniform1f(uniform(disk, "uAlpha"), 1);
      gl.uniform1f(uniform(disk, "uTime"), now);
      gl.uniform1f(uniform(disk, "uHover"), 0);
      gl.uniform1f(uniform(disk, "uProgress"), 1);
      gl.uniform1f(uniform(disk, "uRotate"), 1);
      gl.uniform1f(uniform(disk, "uClock"), clock);
      gl.uniform1f(uniform(disk, "uMask"), mask);
      gl.uniform1f(uniform(disk, "uIndex"), colors.index);
      gl.uniform1f(uniform(disk, "uDpr"), window.devicePixelRatio || 1);
      drawTo(disk, stage);
      }

      if (document.fonts?.check("700 64px Silkscreen")) fontReady = true;
      paintName();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scrolled = Math.min(1, Math.max(0, window.scrollY / Math.max(parent.clientHeight, 1)));
      const scrollBlur = reducedMotion ? 0 : scrolled * 28;
      if (cats) cats.style.filter = scrollBlur > 0.4 ? `blur(${scrollBlur}px)` : "";
      const introRaw = revealAt > 0 ? Math.min(1, (now - revealAt) / 2200) : 0;
      const intro = reducedMotion ? 1 : introRaw * introRaw * (3 - 2 * introRaw);
      if (showArch && arch && sceneTex && stage) {
        const sceneFrame = parent.querySelector<HTMLIFrameElement>("iframe.hero-scene");
        const engine = asCanvas(sceneFrame?.contentDocument?.querySelector("canvas.webgl-canvas") ?? null);
        const catCanvas = asCanvas(document.getElementById("home-cats"));
        if (catCanvas && !pictureReady) catCanvas.style.opacity = "1";
        gl.getError();
        const sceneOk = uploadCanvas(pictureTex, engine);
        const catOk = uploadCanvas(catTex, catCanvas);
        if (!pictureReady && sceneOk && catOk && pictureTex && catTex && catProbe && engine && catCanvas) {
          const px = new Uint8Array(4);
          gl.bindFramebuffer(gl.FRAMEBUFFER, catProbe);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pictureTex, 0);
          const sceneAttached = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) === pictureTex;
          let sceneLit = false;
          if (sceneAttached && gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
            gl.readPixels(Math.floor(engine.width * 0.5), Math.floor(engine.height * 0.55), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
            sceneLit = px[0] + px[1] + px[2] > 24;
          }
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, catTex, 0);
          const catAttached = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) === catTex;
          let catLit = false;
          if (catAttached && gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
            const spots = [0.22, 0.4, 0.62, 0.78];
            for (const x of spots) {
              gl.readPixels(Math.floor(catCanvas.width * x), Math.floor(catCanvas.height * 0.3), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
              if (px[3] > 200) catLit = true;
            }
          }
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          if (sceneLit && catLit) {
            pictureReady = true;
            catCanvas.style.opacity = "0";
          }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.BLEND);
        gl.useProgram(arch);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, pictureReady && pictureTex ? pictureTex : sceneTex);
        gl.uniform1i(uniform(arch, "tMap"), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, gridTex);
        gl.uniform1i(uniform(arch, "tFluid"), 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, catTex);
        gl.uniform1i(uniform(arch, "tCats"), 2);
        gl.uniform2f(uniform(arch, "uResolution"), width, height);
        gl.uniform1f(uniform(arch, "uTime"), clock);
        gl.uniform1f(uniform(arch, "uIntro"), intro);
        gl.uniform1f(uniform(arch, "uHovered"), 0);
        gl.uniform1f(uniform(arch, "uPicture"), pictureReady ? 1 : 0);
        gl.uniform1f(uniform(arch, "uStageWidth"), width);
        gl.uniform3f(uniform(arch, "uBackgroundColor"), 126 / 255, 126 / 255, 1);
        gl.uniform3f(uniform(arch, "uOutlineColor"), 229 / 255, 181 / 255, 140 / 255);
        drawTo(arch, null);
        if (pictureReady) warmFrames += 1;
        if (warmFrames >= 4) {
          (window as Window & { __heroSceneReady?: boolean }).__heroSceneReady = true;
        }
      }
      if (nameProg && fontReady && paintedW === width) {
        const reduced = reducedMotion;
        let blur = 48;
        let alpha = 0;
        if (reduced) {
          blur = 0;
          alpha = 1;
        } else if (revealAt > 0) {
          const t = Math.min(1, (now - revealAt) / 1700);
          const eased = 1 - (1 - t) ** 3;
          blur = 48 * (1 - eased) + scrollBlur;
          alpha = eased;
        }
        if (alpha > 0.01) {
          const dpr = width / Math.max(parent.clientWidth, 1);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          gl.useProgram(nameProg);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, gridTex);
          gl.uniform1i(uniform(nameProg, "tFluid"), 0);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, nameTex);
          gl.uniform1i(uniform(nameProg, "tText"), 1);
          gl.uniform2f(uniform(nameProg, "uResolution"), width, height);
          gl.uniform1f(uniform(nameProg, "uBlur"), blur * dpr);
          gl.uniform1f(uniform(nameProg, "uAlpha"), alpha);
          gl.uniform1f(uniform(nameProg, "uTime"), clock);
          gl.uniform1f(uniform(nameProg, "uIntro"), intro);
          gl.uniform1f(uniform(nameProg, "uHovered"), 0);
          drawTo(nameProg, null);
        }
      }
      frame = window.requestAnimationFrame(draw);
    };

    const markFont = () => {
      if (document.fonts?.check("700 64px Silkscreen")) fontReady = true;
      paintedW = 0;
    };
    document.fonts?.load("700 120px Silkscreen").then(markFont);
    document.fonts?.load("500 16px Geist").then(markFont);
    document.fonts?.addEventListener("loadingdone", markFont);
    const armReveal = () => {
      if (!revealAt) revealAt = performance.now();
      cats?.classList.add("is-in");
    };
    let preloaderWatch: MutationObserver | undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !document.getElementById("preloader")) {
      armReveal();
    } else {
      preloaderWatch = new MutationObserver(() => {
        if (!document.getElementById("preloader")) {
          preloaderWatch?.disconnect();
          armReveal();
        }
      });
      preloaderWatch.observe(document.documentElement, { childList: true, subtree: true });
    }

    const forwardMouse = (event: PointerEvent) => {
      const frame = parent.querySelector<HTMLIFrameElement>("iframe.hero-scene");
      const body = frame?.contentDocument?.body;
      const view = frame?.contentWindow;
      const Mouse = (view as (Window & { MouseEvent: typeof MouseEvent }) | null | undefined)?.MouseEvent;
      if (!frame || !body || !view || !Mouse) return;
      const rect = frame.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) {
        body.dispatchEvent(new Mouse("mouseleave", { bubbles: true, view }));
        return;
      }
      body.dispatchEvent(new Mouse("mousemove", {
        bubbles: true,
        view,
        clientX: event.clientX - rect.left,
        clientY: event.clientY - rect.top,
      }));
    };

    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointermove", forwardMouse, { passive: true });
    fit();
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      preloaderWatch?.disconnect();
      document.fonts?.removeEventListener("loadingdone", markFont);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", forwardMouse);
      if (cats) cats.style.filter = "";
      const catLayer = document.getElementById("home-cats");
      if (catLayer) catLayer.style.opacity = "";
      if (nameTex) gl.deleteTexture(nameTex);
      if (gridTex) gl.deleteTexture(gridTex);
      if (pictureTex) gl.deleteTexture(pictureTex);
      if (catTex) gl.deleteTexture(catTex);
      if (catProbe) gl.deleteFramebuffer(catProbe);
      if (sceneTex) gl.deleteTexture(sceneTex);
      if (sceneFbo) gl.deleteFramebuffer(sceneFbo);
    };
  }, []);

  return (
    <div
      className="hero-field"
      style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none" }}
    >
      <iframe
        className="hero-scene"
        title="Home scene"
        src="/engine/index.html?v=cats30"
        tabIndex={-1}
        aria-hidden="true"
      />
      <canvas
        ref={ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: "transparent",
        }}
      />
      <canvas
        id="home-cats"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 1,
        }}
      />
      <div className="solana-sticker" aria-hidden="true" style={{ left: "73.883%", top: "20.104%", width: "210px" }}>
        <svg viewBox="0 0 211 212" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="105.48" cy="106.32" r="104.8" fill="#231F20" />
          <circle cx="105.48" cy="106.32" r="78" fill="#9945FF" />
          <circle cx="105.48" cy="106.32" r="66" fill="#14F195" />
          <circle cx="105.48" cy="106.32" r="54" fill="#FEECE3" />
          <circle cx="105.48" cy="106.32" r="42" fill="#231F20" />
          <g transform="translate(105.48 106.32) scale(0.13) translate(-198.85 -155.85)">
            <path fill="#9945FF" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
            <path fill="#FFFFFF" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1L333.1 120.1z" />
            <path fill="#14F195" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 237.9z" />
          </g>
          <defs>
            <path id="buddy-ring" d="M105.48 16.32a90 90 0 1 1 0 180a90 90 0 1 1 0-180" fill="none" />
          </defs>
          <text fill="#F9E7CA" fontFamily="Libre Franklin, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700" letterSpacing="1.6">
            <textPath href="#buddy-ring">SHOW ME YOUR BUDDY  ·  ON SOLANA  ·  SHOW ME YOUR BUDDY  ·  ON SOLANA  ·  </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}
