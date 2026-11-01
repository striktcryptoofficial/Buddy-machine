import * as THREE from 'three'

const CARD_W = 196
const CARD_H = 262
const TRAVEL = 0.64
const TILT = (14 * Math.PI) / 180
const LIFT = 40
const GRIP = 0.12
const PERSPECTIVE = 1200
const PAD_X = 4
const PAD_Y = 16

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uRest;
uniform float uTime;
uniform float uTurnAngle;
uniform float uEngage;
uniform float uDim;
uniform vec2 uSpan;
uniform float uRadius;

varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uRest, vUv);
  vec3 col = tex.rgb;

  vec2 pos = (vUv - 0.5) * uSpan;
  vec2 ext = uSpan * 0.5;
  float rad = min(uRadius, min(ext.x, ext.y));
  vec2 corner = abs(pos) - (ext - rad);
  float dist = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - rad;
  float mask = clamp(0.5 - dist / max(fwidth(dist), 1e-4), 0.0, 1.0);

  col *= uDim;
  gl_FragColor = vec4(max(col, 0.0), tex.a * mask);
}
`

export type LensFaces = { front: TexImageSource; back: TexImageSource }

export type LensHandle = {
  goTo: (index: number) => void
  destroy: () => void
}

type CardState = {
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial
  hot: number
  flip: number
  turn: number
  targetHot: number
  targetFlip: number
  targetTurn: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function makeTexture(source: TexImageSource) {
  const texture = new THREE.CanvasTexture(source)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.premultiplyAlpha = false
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function makeMaterial(front: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uRest: { value: front },
      uTime: { value: 0 },
      uTurnAngle: { value: 0 },
      uEngage: { value: 0 },
      uDim: { value: 1 },
      uSpan: { value: new THREE.Vector2(CARD_W, CARD_H) },
      uRadius: { value: 4 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
}

export function mountAbilityLens(
  canvas: HTMLCanvasElement,
  faces: LensFaces[],
  options: { start: number; onActive: (index: number) => void; plates?: HTMLElement[] },
): LensHandle {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 5000)
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H)
  const textures: THREE.Texture[] = []
  const cards: CardState[] = faces.map((face) => {
    const front = makeTexture(face.front)
    const back = makeTexture(face.back)
    textures.push(front, back)
    const material = makeMaterial(front)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return {
      mesh,
      material,
      hot: 0,
      flip: 0,
      turn: 0,
      targetHot: 0,
      targetFlip: 0,
      targetTurn: 0,
    }
  })

  let index = options.start
  let indexGoal = options.start
  let rounded = options.start
  let frame = 0
  let running = true
  let dragging = false
  let moved = false
  let dragX = 0
  let dragIndex = options.start
  let last = performance.now()
  let time = 0

  function step() {
    const raw = getComputedStyle(canvas).getPropertyValue('--card-space')
    const gap = Number.parseFloat(raw)
    return CARD_W + (Number.isFinite(gap) ? gap : 28)
  }

  function maxIndex() {
    const width = canvas.clientWidth || 1
    const stride = step()
    const overflow = (cards.length - 1) * stride + CARD_W - (width - PAD_X * 2)
    return Math.max(0, overflow / stride)
  }

  function limit(value: number) {
    return clamp(value, 0, maxIndex())
  }

  function settle(value: number) {
    const end = maxIndex()
    const snapped = Math.round(value)
    if (snapped >= end) return end
    return clamp(snapped, 0, end)
  }

  function fit() {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    const fov = 2 * Math.atan(height / 2 / PERSPECTIVE) * (180 / Math.PI)
    camera.fov = fov
    camera.aspect = width / height
    camera.position.set(0, 0, PERSPECTIVE)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height, false)
    indexGoal = limit(indexGoal)
    index = limit(index)
  }

  function place() {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    const origin = -width / 2 + PAD_X + CARD_W / 2
    const baseline = -(height / 2 - CARD_H / 2 - PAD_Y)
    const stride = step()
    options.plates?.forEach((plate, i) => {
      const card = cards[i]
      const zLift = card ? card.hot * LIFT : 0
      const turn = card ? card.turn : 0
      const fit = Math.max(1, PERSPECTIVE - zLift) / PERSPECTIVE
      const x = PAD_X + (i - index) * stride
      plate.style.transform = `translate3d(${x}px, 0, ${zLift}px) rotateY(${turn}rad) scale(${fit})`
    })
    cards.forEach((card, i) => {
      const centerX = origin + (i - index) * stride
      const zLift = card.hot * LIFT
      const turn = card.turn
      const depth = Math.max(1, PERSPECTIVE - zLift)
      const fit = depth / PERSPECTIVE
      const half = CARD_W / 2
      const project = (localX: number, span: number, shift: number) => {
        const worldX = centerX * fit + shift + localX * span * Math.cos(turn)
        const worldZ = zLift - localX * span * Math.sin(turn)
        return (worldX * PERSPECTIVE) / Math.max(1, PERSPECTIVE - worldZ)
      }
      let squeeze = 1
      let shift = 0
      if (card.hot > 0.001 || Math.abs(turn) > 0.001) {
        for (let n = 0; n < 4; n += 1) {
          const span = fit * squeeze
          const left = project(-half, span, shift)
          const right = project(half, span, shift)
          const width = right - left
          if (width > 1) squeeze *= CARD_W / width
          shift += (centerX - (left + right) / 2) * fit
        }
      }
      card.mesh.scale.set(fit * squeeze, fit, 1)
      card.mesh.position.set(centerX * fit + shift, baseline * fit, zLift)
      card.mesh.rotation.y = turn
      card.mesh.renderOrder = card.hot > 0.01 ? 2 : 1
      const uniforms = card.material.uniforms
      uniforms.uTurnAngle.value = turn
      uniforms.uEngage.value = card.hot
      uniforms.uDim.value = 1
      uniforms.uTime.value = reduce ? 0 : time
    })
  }

  function damp(current: number, target: number, lambda: number, dt: number) {
    if (reduce) return target
    return THREE.MathUtils.damp(current, target, lambda, dt)
  }

  function tick(now: number) {
    if (!running) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    time += dt
    index = damp(index, indexGoal, dragging ? 28 : 8, dt)
    const follow = reduce ? 1 : 1 - Math.pow(1 - GRIP, 60 * dt)
    cards.forEach((card) => {
      card.hot += (card.targetHot - card.hot) * follow
      card.flip += (card.targetFlip - card.flip) * follow
      card.turn += (card.targetTurn - card.turn) * follow
    })
    const next = clamp(Math.round(index), 0, cards.length - 1)
    if (next !== rounded) {
      rounded = next
      options.onActive(next)
    }
    place()
    renderer.render(scene, camera)
    frame = requestAnimationFrame(tick)
  }

  function ndc(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  function clearHover() {
    cards.forEach((card) => {
      card.targetHot = 0
      card.targetFlip = 0
      card.targetTurn = 0
    })
  }

  function hoverAt(event: PointerEvent) {
    ndc(event)
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(cards.map((card) => card.mesh))
    clearHover()
    const hit = hits[0]
    if (!hit || !hit.uv) return
    const card = cards.find((item) => item.mesh === hit.object)
    if (!card) return
    const flip = clamp((hit.uv.x - (1 - TRAVEL) / 2) / TRAVEL, 0, 1)
    card.targetHot = 1
    card.targetFlip = 0
    card.targetTurn = (2 * flip - 1) * TILT
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    canvas.setPointerCapture(event.pointerId)
    dragging = true
    moved = false
    dragX = event.clientX
    dragIndex = index
  }

  function onPointerMove(event: PointerEvent) {
    if (dragging) {
      const dx = event.clientX - dragX
      if (Math.abs(dx) > 5) moved = true
      if (!moved) return
      clearHover()
      indexGoal = limit(dragIndex - dx / step())
      index = indexGoal
      return
    }
    hoverAt(event)
  }

  function onPointerUp(event: PointerEvent) {
    const wasDrag = moved
    dragging = false
    if (wasDrag) {
      indexGoal = settle(index)
      return
    }
    ndc(event)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(cards.map((card) => card.mesh))[0]
    if (!hit) return
    const cardIndex = cards.findIndex((card) => card.mesh === hit.object)
    if (cardIndex >= 0) indexGoal = settle(cardIndex)
  }

  function onPointerLeave() {
    if (!dragging) clearHover()
  }

  function onWheel(event: WheelEvent) {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (delta === 0) return
    event.preventDefault()
    indexGoal = limit(indexGoal + delta / (step() * 2.4))
  }

  fit()
  place()
  options.onActive(rounded)
  frame = requestAnimationFrame(tick)
  const resize = new ResizeObserver(fit)
  resize.observe(canvas)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('wheel', onWheel, { passive: false })

  return {
    goTo(next: number) {
      indexGoal = settle(next)
    },
    destroy() {
      running = false
      cancelAnimationFrame(frame)
      resize.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('wheel', onWheel)
      geometry.dispose()
      cards.forEach((card) => card.material.dispose())
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
    },
  }
}
