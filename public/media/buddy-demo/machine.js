// Landing-page demo machine. Separate from the real machine in src/machine.
import { addDemoBack } from "./back.js?v=28";
// Laid on the same axes as the hero GLB (thin on Y, tall on Z) so the
// existing scroll rotation still stands it up.

const BODY = { w: 500, h: 1020, d: 78, r: 26 }
const GLASS = { w: 440, h: 620 }
const GLASS_Y = 164
const READ_Y = -248
const KEY_Y = -390
const ICON_SCALE = 1.16
const CUT_PITCH = 32 * 0.86 * ICON_SCALE + 6

const BOLT = [
  [-5, 13],
  [7, 13],
  [1, 2.2],
  [8, 2.2],
  [-3, -13],
  [2.4, -1.2],
  [-6.5, -1.2],
]
const FISH = [
  [-7.2, 0],
  [-13.2, 6.2],
  [-7.2, 2.2],
  [1, 6.6],
  [9, 3.6],
  [13.2, 0],
  [9, -3.6],
  [1, -6.6],
  [-7.2, -2.2],
  [-13.2, -6.2],
]

function roundedRect(THREE, w, h, r) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  const rr = Math.min(r, w / 2, h / 2)
  shape.moveTo(x + rr, y)
  shape.lineTo(x + w - rr, y)
  shape.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false)
  shape.lineTo(x + w, y + h - rr)
  shape.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false)
  shape.lineTo(x + rr, y + h)
  shape.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false)
  shape.lineTo(x, y + rr)
  shape.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false)
  return shape
}

function roundedBox(THREE, w, h, d, r) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(THREE, w, h, r), {
    depth: d,
    bevelEnabled: true,
    bevelThickness: Math.min(10, d * 0.2),
    bevelSize: Math.min(10, r * 0.2),
    bevelSegments: 6,
    curveSegments: 10,
  })
  geo.translate(0, 0, -d)
  geo.computeVertexNormals()
  return geo
}

const GRAIN_GLSL = `
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float fineGrain(vec3 p) {
  vec2 a = p.xy * 0.42 + p.zx * 0.31;
  float n = grainHash(floor(a));
  float n2 = grainHash(floor(a * 2.35 + 13.7));
  return n * 0.58 + n2 * 0.42;
}
`

function withGrain(THREE, mat) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "varying vec3 vGrainPos;\n#include <common>")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvGrainPos = position;")
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `${GRAIN_GLSL}\nvarying vec3 vGrainPos;\n#include <common>`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         float g = fineGrain(vGrainPos);
         diffuseColor.rgb *= mix(0.97, 1.02, g);`,
      )
  }
  mat.customProgramCacheKey = () => "buddy-grain-v1"
  return mat
}

const envCache = new WeakMap()

function productEnvironment(THREE, renderer) {
  if (!renderer) return null
  const cached = envCache.get(renderer)
  if (cached) return cached
  const room = new THREE.Scene()
  room.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(14, 10, 14),
      new THREE.MeshBasicMaterial({ color: 0x161616, side: THREE.BackSide }),
    ),
  )
  const soft = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4.5),
    new THREE.MeshBasicMaterial({ color: 0xf4f6fa }),
  )
  soft.position.set(-1.4, 2.6, 4.2)
  soft.lookAt(0, 0.2, 0)
  room.add(soft)
  const edge = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 6),
    new THREE.MeshBasicMaterial({ color: 0xc5c8ce }),
  )
  edge.position.set(4.2, 0.4, 1.2)
  edge.lookAt(0, 0, 0)
  room.add(edge)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(room, 0.18).texture
  pmrem.dispose()
  envCache.set(renderer, env)
  return env
}

function shellMaterial(THREE, env) {
  return withGrain(
    THREE,
    new THREE.MeshPhysicalMaterial({
      color: 0x23262e,
      roughness: 0.32,
      metalness: 0.04,
      clearcoat: 0.42,
      clearcoatRoughness: 0.28,
      envMap: env,
      envMapIntensity: 1.05,
    }),
  )
}

function buttonPlastic(THREE, env) {
  return withGrain(
    THREE,
    new THREE.MeshPhysicalMaterial({
      color: 0x10131a,
      roughness: 0.48,
      metalness: 0,
      clearcoat: 0.36,
      clearcoatRoughness: 0.46,
      reflectivity: 0.34,
      envMap: env,
      envMapIntensity: 0.42,
    }),
  )
}

function sidePlastic(THREE, env) {
  return withGrain(
    THREE,
    new THREE.MeshPhysicalMaterial({
      color: 0x07080c,
      roughness: 0.62,
      metalness: 0,
      clearcoat: 0.06,
      clearcoatRoughness: 0.5,
      envMap: env,
      envMapIntensity: 0.22,
    }),
  )
}

function heartPoints(THREE, scale) {
  const pts = []
  const steps = 48
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = Math.sin(t) ** 3 * 16 * scale
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5) * scale
    pts.push(new THREE.Vector2(x, y))
  }
  return pts
}

function shapeFrom(THREE, pairs, scale) {
  return new THREE.Shape(pairs.map(([x, y]) => new THREE.Vector2(x * scale, y * scale)))
}

function iconRow(THREE, shape, x, y, z) {
  const row = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({ color: 0xf4f1ea })
  for (let i = 0; i < 5; i++) {
    const face = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat)
    face.position.set(x + i * CUT_PITCH, y, z)
    row.add(face)
  }
  return row
}

function readout(THREE) {
  const scale = 4
  const canvas = document.createElement("canvas")
  canvas.width = 440 * scale
  canvas.height = 300 * scale
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const lines = ["MOOD", "ENERGY", "HUNGER"]
  lines.forEach((line, index) => {
    const size = 22 * scale
    const x = 12 * scale
    const y = (50 + index * 100) * scale
    ctx.font = `${size}px monospace`
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    const measured = ctx.measureText(line).width
    const padX = Math.round(size * 0.34)
    const padY = Math.round(size * 0.2)
    const bw = Math.round(measured + padX * 2)
    const bh = Math.round(size + padY * 2)
    const top = Math.round(y - bh / 2)
    ctx.fillStyle = "#0b0d12"
    ctx.fillRect(x, top, bw, bh)
    ctx.fillStyle = "#f4f1ea"
    ctx.fillText(line, x + padX, y)
  })
  const tex = new THREE.CanvasTexture(canvas)
  if ("SRGBColorSpace" in THREE) tex.colorSpace = THREE.SRGBColorSpace
  return new THREE.Mesh(
    new THREE.PlaneGeometry(220, 150),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  )
}

function legend(THREE, text, w, h, size) {
  const scale = 4
  const canvas = document.createElement("canvas")
  canvas.width = w * scale
  canvas.height = h * scale
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const label = text.toUpperCase()
  ctx.font = `${size * scale}px monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const measured = ctx.measureText(label).width
  const padX = size * scale * 0.34
  const padY = size * scale * 0.2
  const bw = measured + padX * 2
  const bh = size * scale + padY * 2
  const left = canvas.width / 2 - bw / 2
  const top = canvas.height / 2 - bh / 2
  ctx.fillStyle = "#0b0d12"
  ctx.fillRect(left, top, bw, bh)
  ctx.fillStyle = "#f4f1ea"
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)
  const tex = new THREE.CanvasTexture(canvas)
  if ("SRGBColorSpace" in THREE) tex.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  )
  return mesh
}

function markX(THREE, z) {
  const group = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const arm = new THREE.BoxGeometry(40, 5.2, 1.4)
  const a = new THREE.Mesh(arm, mat)
  const b = new THREE.Mesh(arm, mat)
  a.rotation.z = Math.PI / 4
  b.rotation.z = -Math.PI / 4
  a.position.z = z
  b.position.z = z
  group.add(a, b)
  return group
}

function markRing(THREE, z) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, 15, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, 10.4, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false, curveSegments: 32 }),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  )
  mesh.position.z = z
  return mesh
}

function markSquare(THREE, z) {
  const s = 15
  const h = 10.4
  const shape = new THREE.Shape()
  shape.moveTo(-s, -s)
  shape.lineTo(s, -s)
  shape.lineTo(s, s)
  shape.lineTo(-s, s)
  shape.closePath()
  const hole = new THREE.Path()
  hole.moveTo(-h, -h)
  hole.lineTo(-h, h)
  hole.lineTo(h, h)
  hole.lineTo(h, -h)
  hole.closePath()
  shape.holes.push(hole)
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false }),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  )
  mesh.position.z = z
  return mesh
}

function key(THREE, env, kind, label, x, y) {
  const group = new THREE.Group()
  group.position.set(x, y, 16)
  const seat = new THREE.Mesh(
    new THREE.CircleGeometry(48, 40),
    new THREE.MeshStandardMaterial({ color: 0x05060a, roughness: 0.92, envMap: env, envMapIntensity: 0.2 }),
  )
  seat.position.z = -4
  const plastic = buttonPlastic(THREE, env)
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(46, 48, 6, 40), plastic)
  barrel.rotation.x = Math.PI / 2
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 10, 40), plastic)
  pad.rotation.x = Math.PI / 2
  pad.position.z = 6
  group.add(seat, barrel, pad)
  if (kind === "pet") group.add(markX(THREE, 11))
  else if (kind === "feed") group.add(markRing(THREE, 11))
  else group.add(markSquare(THREE, 11))
  const word = legend(THREE, label, 96, 26, 15)
  word.position.set(0, -78, 0)
  group.add(word)
  return group
}

const BOOT_LINES = [
  "buddy os",
  "boot rom .......... ok",
  "clk ............... lock",
  "sram 0x000000 ..... ok",
  "sram 0x400000 ..... ok",
  "sram 0x800000 ..... ok",
  "bus lamps ......... ok",
  "gpio led .......... orange",
  "load core",
  "load mind",
  'w = open("mind.bin")',
  "weights 1/12 ...... ok",
  "weights 2/12 ...... ok",
  "weights 3/12 ...... ok",
  "weights 4/12 ...... ok",
  "weights 5/12 ...... ok",
  "weights 6/12 ...... ok",
  "weights 7/12 ...... ok",
  "weights 8/12 ...... ok",
  "weights 9/12 ...... ok",
  "weights 10/12 ..... ok",
  "weights 11/12 ..... ok",
  "weights 12/12 ..... ok",
  "map attn.mood",
  "map attn.voice",
  "map attn.hunger",
  "map embed.coat",
  "bind layer 0",
  "bind layer 1",
  "bind layer 2",
  "bind layer 3",
  "bind layer 4",
  "bind layer 5",
  "tensor life ....... empty",
  "tensor mood ....... empty",
  "seed slot ......... open",
  "rng.init(slot)",
  "compile persona",
  "compile voice",
  "compile habits",
  "for layer in attn:",
  "  warm(layer)",
  "cat.life = None",
  "cat.mood = None",
  "voice.buffer .... empty",
  "habit.table ..... empty",
  "checksum mind ... ok",
  "checksum core ... ok",
  "mount carrier",
  "seal latch ..... ok",
  "arm lamps",
  "arm led",
  "flush log",
  "done",
]
const LOGO_AT = 0.55
const LOGO_IN = 0.75
const LOGO_HOLD = 1.15
const LOGO_OUT = 0.5
const LOGO_END = LOGO_AT + LOGO_IN + LOGO_HOLD + LOGO_OUT
const BOOT_AT = LOGO_END + 0.15
const BOOT_STEP = 0.09
const BOOT_HOLD = 1.8
const BOOT_LEAVE = 0.8
const BOOT_LINE_PX = 28
const BOOT_PAD_TOP = 56
const BOOT_PAD_BOTTOM = 48
const BOOT_LOG_END = BOOT_AT + (BOOT_LINES.length - 1) * BOOT_STEP
const BOOT_END = BOOT_LOG_END + BOOT_HOLD + BOOT_LEAVE
const CARRIER_LOOP = 5.6
const CARRIER_IDLE = [
  [0, 0, 0, 1, 0],
  [0.16, 0, 0, 1, 0],
  [0.21, -10, -4, 1, -2.2],
  [0.26, 8, 2, 8.05 / 8, 1.8],
  [0.31, -4, 0, 1, -0.6],
  [0.38, 6, 7, 1, 0.5],
  [0.6, 6, 7, 1, 0.5],
  [0.66, 11, -6, 8.04 / 8, 2.2],
  [0.71, -9, 3, 1, -1.6],
  [0.77, 0, -2, 1, 0.3],
  [0.86, 0, 0, 1, 0],
  [1, 0, 0, 1, 0],
]

function easeInOut(t) {
  const cx = 1.26
  const bx = -0.78
  const ax = 1 - cx - bx
  const cy = 0
  const by = 3
  const ay = 1 - cy - by
  let u = t
  for (let i = 0; i < 5; i += 1) {
    const x = ((ax * u + bx) * u + cx) * u - t
    const d = (3 * ax * u + 2 * bx) * u + cx
    if (Math.abs(d) < 1e-5) break
    u -= x / d
  }
  return ((ay * u + by) * u + cy) * u
}

const MEOWS = ["miauw.", "mrrp.", "purrr.", "mew.", "mrow."]

function carrierPose(now) {
  const p = ((now / 1000) % CARRIER_LOOP) / CARRIER_LOOP
  let i = 1
  while (i < CARRIER_IDLE.length && CARRIER_IDLE[i][0] < p) i += 1
  const a = CARRIER_IDLE[i - 1]
  const b = CARRIER_IDLE[i]
  const span = b[0] - a[0] || 1
  const e = easeInOut(Math.min(1, Math.max(0, (p - a[0]) / span)))
  const mix = (k) => a[k] + (b[k] - a[k]) * e
  return { x: mix(1), y: mix(2), scale: mix(3), rot: mix(4) }
}

function attachDemoBoot(THREE, device) {
  const canvas = document.createElement("canvas")
  canvas.width = 720
  canvas.height = 1240
  const ctx = canvas.getContext("2d")
  const tex = new THREE.CanvasTexture(canvas)
  if ("SRGBColorSpace" in THREE) tex.colorSpace = THREE.SRGBColorSpace
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(GLASS.w - 16, GLASS.h - 16),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
  )
  screen.position.set(0, GLASS_Y, 22)
  device.add(screen)
  const carrier = new Image()
  const visible = Math.floor((canvas.height - BOOT_PAD_TOP - BOOT_PAD_BOTTOM) / BOOT_LINE_PX)

  let meowLine = ""
  let meowUntil = 0
  let meowOn = false
  const meowNow = (now) => {
    if (now < meowUntil) return meowOn ? meowLine : ""
    if (meowOn) {
      meowOn = false
      meowUntil = now + 700
      return ""
    }
    meowOn = true
    meowLine = MEOWS[Math.floor(Math.random() * MEOWS.length)]
    meowUntil = now + 2200
    return meowLine
  }
  const paintBubble = (text, cx, top) => {
    ctx.save()
    ctx.letterSpacing = "0px"
    ctx.font = "700 28px Silkscreen, monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const padX = 22
    const padY = 14
    const tw = ctx.measureText(text).width
    const bw = tw + padX * 2
    const bh = 28 + padY * 2
    const x = cx - bw / 2
    const y = top - bh - 28
    ctx.fillStyle = "#c9aa86"
    ctx.beginPath()
    ctx.roundRect(x + 4, y + 4, bw, bh, 16)
    ctx.fill()
    ctx.fillStyle = "#fff8ee"
    ctx.strokeStyle = "#6a4b38"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.roundRect(x, y, bw, bh, 16)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - 12, y + bh - 2)
    ctx.lineTo(cx + 12, y + bh - 2)
    ctx.lineTo(cx, y + bh + 16)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx - 12, y + bh - 1)
    ctx.lineTo(cx, y + bh + 16)
    ctx.lineTo(cx + 12, y + bh - 1)
    ctx.stroke()
    ctx.fillStyle = "#fff8ee"
    ctx.fillRect(cx - 10, y + bh - 6, 20, 8)
    ctx.fillStyle = "#2a211c"
    ctx.fillText(text, cx, y + bh / 2)
    ctx.restore()
  }

  const paintReady = (now = performance.now()) => {
    ctx.fillStyle = "#101218"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (carrier.complete && carrier.naturalWidth) {
      const pose = carrierPose(now)
      const size = 420 * pose.scale
      const cx = canvas.width / 2 + pose.x * (canvas.width / 880)
      const cy = canvas.height * 0.4 + pose.y
      ctx.save()
      ctx.imageSmoothingEnabled = false
      ctx.translate(cx, cy)
      ctx.rotate((pose.rot * Math.PI) / 180)
      ctx.drawImage(carrier, 0, 0, 64, 64, -size / 2, -size / 2, size, size)
      ctx.restore()
      const line = meowNow(now)
      if (line) paintBubble(line, cx, cy - size / 2)
    }
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.letterSpacing = "0px"
    ctx.fillStyle = "#b7f5d0"
    ctx.font = "700 28px Silkscreen, monospace"
    ctx.fillText("Ready to hatch", canvas.width / 2, canvas.height * 0.68)
    const bw = 280
    const bh = 72
    const bx = canvas.width / 2 - bw / 2
    const by = canvas.height * 0.74
    ctx.fillStyle = "#f3c3b4"
    ctx.fillRect(bx, by, bw, bh)
    ctx.fillStyle = "#3a2a22"
    ctx.font = "700 32px Silkscreen, monospace"
    ctx.fillText("HATCH", canvas.width / 2, by + bh / 2)
    tex.needsUpdate = true
  }

  paintReady()

  const play = (now) => {
    const t = (now - startedAt) / 1000
    if (t >= BOOT_END) {
      startIdle()
      return
    }
    const leaving = t >= BOOT_LOG_END + BOOT_HOLD
    const leave = leaving ? Math.min(1, (t - (BOOT_LOG_END + BOOT_HOLD)) / BOOT_LEAVE) : 0
    if (leaving) paintReady(now)
    else {
      ctx.fillStyle = t >= 0.62 ? "#101218" : "#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.save()
    ctx.globalAlpha = 1 - leave
    ctx.translate(0, -canvas.height * 0.08 * leave)
    if (leaving) {
      ctx.fillStyle = "#101218"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    if (t < LOGO_AT) {
      const open = Math.min(1, Math.max(0, t / 0.42))
      ctx.fillStyle = `rgba(233,255,243,${0.25 + open * 0.75})`
      const beam = 4 * (1 + open * 22)
      ctx.fillRect(canvas.width * 0.1, canvas.height / 2 - beam / 2, canvas.width * 0.8, beam)
    }
    if (t > 0.34 && t < LOGO_AT + 0.35) {
      const flash = Math.sin(((t - 0.34) / 0.45) * Math.PI)
      ctx.fillStyle = `rgba(244,255,246,${flash * 0.9})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    if (t >= LOGO_AT && t < LOGO_END) {
      const u = t - LOGO_AT
      let alpha = 1
      let scale = 1
      if (u < LOGO_IN) {
        const ease = 1 - (1 - u / LOGO_IN) ** 3
        alpha = ease
        scale = 0.84 + ease * 0.16
      } else if (u > LOGO_IN + LOGO_HOLD) {
        const out = Math.min(1, (u - LOGO_IN - LOGO_HOLD) / LOGO_OUT)
        alpha = 1 - out
        scale = 1 + out * 0.04
      }
      ctx.save()
      ctx.globalAlpha *= alpha
      ctx.translate(canvas.width / 2, canvas.height * 0.46)
      ctx.scale(scale, scale)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#f3efe6"
      ctx.font = "700 58px Silkscreen, monospace"
      ctx.letterSpacing = "0.16em"
      ctx.fillText("Anthropic", 0, -36)
      ctx.fillStyle = "#e0b07a"
      ctx.font = "700 26px Silkscreen, monospace"
      ctx.letterSpacing = "0.72em"
      ctx.fillText("AI", 0, 28)
      ctx.restore()
    }
    const count = t < BOOT_AT ? 0 : Math.min(BOOT_LINES.length, Math.floor((t - BOOT_AT) / BOOT_STEP) + 1)
    if (count > 0) {
      const shift = Math.max(0, count - visible) * BOOT_LINE_PX
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, canvas.width, canvas.height)
      ctx.clip()
      ctx.translate(0, -shift)
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillStyle = "#b7f5d0"
      ctx.font = "700 22px Silkscreen, monospace"
      ctx.letterSpacing = "0px"
      for (let i = 0; i < count; i += 1) {
        ctx.fillText(BOOT_LINES[i], 40, BOOT_PAD_TOP + i * BOOT_LINE_PX)
      }
      if (count < BOOT_LINES.length && Math.floor(t * 2.5) % 2 === 0) {
        const width = ctx.measureText(BOOT_LINES[count - 1]).width
        ctx.fillRect(40 + width + 6, BOOT_PAD_TOP + (count - 1) * BOOT_LINE_PX + 4, 12, 18)
      }
      ctx.restore()
    }
    ctx.restore()
    tex.needsUpdate = true
    requestAnimationFrame(play)
  }

  let started = false
  let startedAt = 0
  let idling = false
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const tickIdle = (now) => {
    if (!idling) return
    paintReady(now)
    requestAnimationFrame(tickIdle)
  }
  const startIdle = () => {
    if (reduced || idling) return
    idling = true
    requestAnimationFrame(tickIdle)
  }
  const hold = () => {
    idling = false
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    tex.needsUpdate = true
  }
  carrier.onload = () => {
    if (!started && idling) paintReady()
  }
  carrier.src = "/media/buddy-demo/carrier.png"
  startIdle()
  const start = () => {
    if (started) return
    started = true
    idling = false
    if (reduced) {
      paintReady()
      return
    }
    startedAt = performance.now()
    requestAnimationFrame(play)
  }
  return { start, hold }
}

export function createBuddyMachine(THREE, renderer, options) {
  const env = productEnvironment(THREE, renderer)
  const device = new THREE.Group()
  const shellMat = shellMaterial(THREE, env)
  const shell = new THREE.Mesh(roundedBox(THREE, BODY.w, BODY.h, BODY.d, BODY.r), shellMat)
  shell.castShadow = true
  shell.receiveShadow = true
  device.add(shell)

  const gasket = new THREE.Mesh(roundedBox(THREE, GLASS.w + 36, GLASS.h + 36, 18, 36), shellMat)
  gasket.position.set(0, GLASS_Y, 8)
  gasket.castShadow = true
  device.add(gasket)

  const glass = new THREE.Mesh(
    roundedBox(THREE, GLASS.w, GLASS.h, 8, 26),
    new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.92,
      metalness: 0,
      envMap: env,
      envMapIntensity: 0.12,
    }),
  )
  glass.position.set(0, GLASS_Y, 16)
  device.add(glass)

  const rocker = new THREE.Mesh(roundedBox(THREE, 22, 92, 36, 8), sidePlastic(THREE, env))
  rocker.position.set(BODY.w / 2 + 6, 70, -BODY.d / 2)
  device.add(rocker)
  const power = new THREE.Mesh(roundedBox(THREE, 16, 28, 24, 6), sidePlastic(THREE, env))
  power.position.set(BODY.w / 2 + 4, -30, -BODY.d / 2)
  device.add(power)

  const led = new THREE.Mesh(
    new THREE.CircleGeometry(3.5, 24),
    new THREE.MeshStandardMaterial({ color: 0x0c281c, emissive: 0x5ee6a4, emissiveIntensity: 0.8, roughness: 0.4 }),
  )
  led.position.set(GLASS.w / 2 - 28, GLASS_Y + GLASS.h / 2 + 8, 18)
  device.add(led)

  const labels = readout(THREE)
  labels.position.set(-98, READ_Y - 18, 14)
  device.add(labels)

  const faceZ = 12
  const heart = new THREE.Shape(heartPoints(THREE, 0.86 * ICON_SCALE))
  device.add(iconRow(THREE, heart, 50, READ_Y + 32, faceZ))
  device.add(iconRow(THREE, shapeFrom(THREE, BOLT, ICON_SCALE), 50, READ_Y - 18, faceZ))
  device.add(iconRow(THREE, shapeFrom(THREE, FISH, ICON_SCALE), 50, READ_Y - 68, faceZ))

  device.add(key(THREE, env, "pet", "Pet", -150, KEY_Y))
  device.add(key(THREE, env, "feed", "Feed", 0, KEY_Y))
  device.add(key(THREE, env, "play", "Play", 150, KEY_Y))
  addDemoBack(THREE, device, shell, options && options.back)
  device.rotation.z = Math.PI

  const laid = new THREE.Group()
  laid.rotation.x = Math.PI / 2
  laid.add(device)
  const turned = new THREE.Group()
  turned.rotation.z = Math.PI
  turned.add(laid)
  const demoBoot = attachDemoBoot(THREE, device)
  turned.userData.startDemoBoot = demoBoot.start
  turned.userData.holdDemoBoot = demoBoot.hold
  return turned
}
