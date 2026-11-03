import * as THREE from 'three'

const FIELD_PAD = 1.28
const FIELD_ZOOM = 1.08
const GLYPHS = ' =+xX0S8#@'
const BASE = new THREE.Color('#0e0e0e')

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FIELD = `
precision highp float;
uniform vec2 uCss;
uniform float uDpr;
uniform float uTime;
uniform sampler2D uAtlas;
varying vec2 vUv;

float hashCell(vec2 c) {
  return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hashCell(i);
  float b = hashCell(i + vec2(1.0, 0.0));
  float c = hashCell(i + vec2(0.0, 1.0));
  float d = hashCell(i + vec2(1.0, 1.0));
  return a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y;
}

vec2 horizon(vec2 p) {
  float t = uTime;
  vec2 warp = vec2(
    noise(p * 1.7 + vec2(t * 0.13, -t * 0.08)),
    noise(p * 1.7 + vec2(-t * 0.1 + 3.7, t * 0.12))
  ) - 0.5;
  p += warp * 0.065;
  p.y += sin(p.x * 2.6 + t * 0.5) * 0.015;
  float dist = length(p - vec2(0.0, 1.4)) - 1.15;
  float light = smoothstep(-0.03, 0.315, dist);
  vec2 sun = vec2(sin(t * 0.07) * 0.04, -0.62);
  float across = smoothstep(0.2, 0.75, length((p - sun) * vec2(1.6, 0.8)));
  float into = smoothstep(0.22 - 0.06 * across, 0.66 - 0.16 * across, dist);
  float bright = clamp(pow(light, 0.5) * (0.66 + 0.34 * into) * (1.0 - 0.32 * across), 0.0, 1.0);
  return vec2(light, bright);
}

void main() {
  vec2 css = vec2(gl_FragCoord.x / uDpr, uCss.y - gl_FragCoord.y / uDpr);
  vec2 cellSize = vec2(11.0, 18.0);
  vec2 cell = floor(css / cellSize);
  vec2 local = fract(css / cellSize);
  vec2 mid = (cell + 0.5) * cellSize;
  vec2 p = (mid - 0.5 * uCss) / uCss.y;
  vec2 lit = horizon(p);
  float light = lit.x;
  float bright = lit.y;
  float n = 10.0;
  float idx = clamp(floor(bright * (n - 1.0) + 0.5), 0.0, n - 1.0);
  float gap = noise(cell * vec2(0.23, 0.61)) * 0.6 + hashCell(cell + 1.7) * 0.4;
  float keep = step(gap, 0.8 * (0.48 + 0.62 * bright));
  if (light < 0.035 || bright < 0.035) keep = 0.0;
  idx *= keep;
  float cover = texture2D(uAtlas, vec2((idx + local.x) / n, local.y)).a;
  if (idx < 0.5) cover = 0.0;
  float seen = smoothstep(0.02, 0.55, light);
  float alpha = cover * 0.72 * seen;
  vec3 color = mix(vec3(0.0549), vec3(1.0), alpha);
  gl_FragColor = vec4(color, 1.0);
}
`

const VIEW_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const VIEW = `
precision highp float;
uniform sampler2D tField;
uniform vec2 uRes;
uniform float uFocus;
uniform float uPad;
uniform float uZoom;
varying vec2 vUv;

void main() {
  gl_FragDepth = 1.0;
  float zoom = mix(1.0, uZoom, uFocus);
  float span = zoom / uPad;
  vec2 uv = (vUv - 0.5) * span + 0.5;
  vec3 base = vec3(0.0549);
  vec2 px = (uFocus * 10.0) * zoom / uRes;
  vec3 acc = vec3(0.0);
  float weight = 0.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      float w = exp(-float(x * x + y * y) / 4.2);
      vec2 s = clamp(uv + vec2(float(x), float(y)) * px, 0.0, 1.0);
      acc += texture2D(tField, s).rgb * w;
      weight += w;
    }
  }
  vec3 color = acc / weight;
  float band = smoothstep(0.0, 0.16, 1.0 - vUv.y);
  gl_FragColor = vec4(mix(base, color, band), 1.0);
}
`

function glyphAtlas() {
  const cellW = 64
  const cellH = 96
  const canvas = document.createElement('canvas')
  canvas.width = cellW * GLYPHS.length
  canvas.height = cellH
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.font = '600 78px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < GLYPHS.length; i += 1) {
    const glyph = GLYPHS[i]
    if (!glyph || glyph === ' ') continue
    ctx.fillText(glyph, i * cellW + cellW / 2, cellH / 2 + 4)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace
  texture.flipY = false
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function fullscreen(material: THREE.ShaderMaterial) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  mesh.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(mesh)
  return { mesh, scene }
}

export function createAsciiBackdrop() {
  const atlas = glyphAtlas()
  const target = new THREE.WebGLRenderTarget(1, 1, {
    depthBuffer: false,
    stencilBuffer: false,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  })
  target.texture.colorSpace = THREE.NoColorSpace
  const fieldMat = new THREE.ShaderMaterial({
    uniforms: {
      uCss: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uAtlas: { value: atlas },
    },
    vertexShader: VERT,
    fragmentShader: FIELD,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  const viewMat = new THREE.ShaderMaterial({
    uniforms: {
      tField: { value: target.texture },
      uRes: { value: new THREE.Vector2(1, 1) },
      uFocus: { value: 0 },
      uPad: { value: FIELD_PAD },
      uZoom: { value: FIELD_ZOOM },
    },
    vertexShader: VIEW_VERT,
    fragmentShader: VIEW,
    depthTest: true,
    depthWrite: false,
    depthFunc: THREE.EqualDepth,
    toneMapped: false,
  })
  const field = fullscreen(fieldMat)
  const view = fullscreen(viewMat)
  const viewCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  let width = 0
  let height = 0

  return {
    viewScene: view.scene,
    viewCamera,
    draw(renderer: THREE.WebGLRenderer, time: number, focus: number) {
      const nextW = renderer.domElement.width
      const nextH = renderer.domElement.height
      const dpr = renderer.getPixelRatio() || 1
      if (nextW !== width || nextH !== height) {
        width = nextW
        height = nextH
        const fieldW = Math.max(1, Math.ceil(nextW * FIELD_PAD))
        const fieldH = Math.max(1, Math.ceil(nextH * FIELD_PAD))
        target.setSize(fieldW, fieldH)
        fieldMat.uniforms.uCss.value.set(fieldW / dpr, fieldH / dpr)
        fieldMat.uniforms.uDpr.value = dpr
        viewMat.uniforms.uRes.value.set(fieldW, fieldH)
        viewMat.uniforms.tField.value = target.texture
      }
      fieldMat.uniforms.uTime.value = time
      viewMat.uniforms.uFocus.value = focus
      const previous = renderer.getRenderTarget()
      const previousClear = renderer.autoClear
      renderer.setRenderTarget(target)
      renderer.setClearColor(BASE, 1)
      renderer.clear()
      renderer.render(field.scene, viewCamera)
      renderer.setRenderTarget(previous)
      renderer.autoClear = previousClear
    },
    dispose() {
      target.dispose()
      atlas.dispose()
      fieldMat.dispose()
      viewMat.dispose()
      field.mesh.geometry.dispose()
      view.mesh.geometry.dispose()
    },
  }
}
