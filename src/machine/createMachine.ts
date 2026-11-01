import * as THREE from 'three'
import { create as createQr } from 'qrcode'
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import type { BuddyState, Mood } from '../../Game engine/mechanics/types'
import { hslToHex, mulberry32 } from '../../Game engine/mechanics/random'

const BLOOM_LAYER = 1

const BURST_VERT = `
attribute vec2 aStart;
attribute float aSeed;
attribute float aStretch;
attribute float aSize;
uniform float uTime;
uniform float uSpread;
varying float vLife;
varying float vStretch;
varying vec2 vUv;

void main() {
  vUv = uv;
  float age = max(0.0, uTime - aSeed * 0.12);
  float dur = mix(0.92, 0.62, aStretch);
  float appear = smoothstep(0.0, 0.04, age);
  float fade = 1.0 - smoothstep(dur * 0.22, dur, age);
  vLife = appear * fade;
  float k = 1.0 - exp(-3.1 * age);
  vec2 p = aStart;
  float dist = length(p);
  vec2 outward = dist > 0.5 ? p / dist : vec2(0.0, 1.0);
  float ang = aSeed * 6.2831853;
  vec2 kick = vec2(cos(ang), sin(ang));
  vec2 dir = normalize(mix(outward, kick, 0.18));
  vec2 side = vec2(-dir.y, dir.x);
  float swirl = sin(age * 3.2 + aSeed * 28.0) * mix(3.0, 9.0, aStretch);
  float travel = k * uSpread * mix(0.28 + aSeed * 0.35, 0.62 + aSeed * 0.4, aStretch);
  vec2 pos = p + dir * travel + side * swirl * k;
  pos.y += k * age * mix(6.0, -10.0, aStretch);
  float lengthen = mix(1.0, 2.2, aStretch);
  vec2 local = side * position.x * aSize + dir * position.y * aSize * lengthen;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + local, 0.0, 1.0);
  vStretch = aStretch;
}
`

const BURST_FRAG = `
uniform vec3 uColor;
varying float vLife;
varying float vStretch;
varying vec2 vUv;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float body = exp(-(p.x * p.x * 4.4 + p.y * p.y * mix(4.4, 0.85, vStretch)));
  float core = exp(-(p.x * p.x + p.y * p.y) * 18.0);
  vec3 col = mix(uColor, vec3(1.0), core * 0.35);
  float alpha = body * vLife * 0.72;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col * alpha, alpha);
}
`

const MOOD_LIGHT: Record<Mood, number> = {
  happy: 1,
  excited: 0.9,
  affectionate: 0.82,
  content: 0.72,
  curious: 0.64,
  sleepy: 0.7,
  bored: 0.34,
  lonely: 0.18,
  sad: 0.08,
  angry: 0,
}

export type MachineKey = 'pet' | 'feed' | 'play'

const DEVICE_WALLET = '0xB0DD1E5A7E11C0DE00000000000000000000B0DD'

const GLASS = { w: 440, h: 620, pxW: 880, pxH: 1240 }
/** Matches `.machine-say-bar` in styles.css (glass pixel space, origin top-left). */
const SAY_BAR = { left: 48, right: GLASS.pxW - 48, top: GLASS.pxH - 28 - 56, bottom: GLASS.pxH - 28 }
const PX = GLASS.w / GLASS.pxW
const SCREEN_R = 52 * PX
const BODY = { w: 500, h: 1020, d: 78, r: SCREEN_R }
const GLASS_Y = 164
const READ_Y = -230
const KEY_Y = -390

type Keypad = {
  group: THREE.Group
  goal: number
  pressed: number
}

export type MachineHandle = {
  setReadout: (buddy: BuddyState | null, reveal?: 'snap' | 'animate') => void
  setBoot: (elapsed: number | null) => void
  setPower: (on: boolean) => void
  setLights: (buddy: BuddyState | null) => void
  playRarity: (rarity: string) => void
  setPull: (on: boolean) => void
  setPick: (on: boolean) => void
  faceFront: () => void
  sticker: HTMLCanvasElement
  dispose: () => void
}

export const machineScene = 149

export function createMachine(
  mount: HTMLElement,
  screen: HTMLElement,
  onPress: (key: MachineKey) => void,
  onScreen: () => void,
): MachineHandle {
  const glScene = new THREE.Scene()
  const cssScene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 10, 8000)
  camera.position.set(0, 30, 1800)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.96
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.className = 'machine-gl'
  mount.appendChild(renderer.domElement)

  const cssRenderer = new CSS3DRenderer()
  cssRenderer.domElement.className = 'machine-css'
  mount.appendChild(cssRenderer.domElement)

  const overlayScene = new THREE.Scene()
  const overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  overlayCamera.position.z = 10

  glScene.environment = productEnvironment(renderer)

  glScene.add(new THREE.AmbientLight(0xd7dee8, 0.16))
  const keyLight = new THREE.DirectionalLight(0xfff6ee, 1.35)
  keyLight.position.set(-300, 980, 1150)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.bias = -0.00012
  keyLight.shadow.normalBias = 0.02
  keyLight.shadow.intensity = 1
  keyLight.shadow.radius = 2
  keyLight.shadow.camera.near = 200
  keyLight.shadow.camera.far = 3200
  keyLight.shadow.camera.left = -800
  keyLight.shadow.camera.right = 800
  keyLight.shadow.camera.top = 1000
  keyLight.shadow.camera.bottom = -1000
  glScene.add(keyLight)
  glScene.add(keyLight.target)
  const fill = new THREE.DirectionalLight(0xb9c6d8, 0.28)
  fill.position.set(760, 80, 520)
  glScene.add(fill)
  const rim = new THREE.DirectionalLight(0xd5dce8, 0.42)
  rim.position.set(180, 420, -900)
  glScene.add(rim)
  const bounce = new THREE.DirectionalLight(0xe4ebf4, 0.22)
  bounce.position.set(20, -720, 640)
  glScene.add(bounce)

  const pivot = new THREE.Group()
  glScene.add(pivot)

  const pocketMap = iconPocketTexture()
  const pocketFloor = { value: -4 }
  const caseFx = {
    uTime: { value: 0 },
    uTilt: { value: new THREE.Vector2() },
    uRarity: { value: -1 },
    uReveal: { value: 0 },
    uFoil: { value: new THREE.Color(0x9ed6ff) },
    uPhase: { value: 0 },
    uBand: { value: (58 * Math.PI) / 180 },
    uChroma: { value: (35 * Math.PI) / 180 },
    uGrid: { value: 70 },
  }
  const skinBackdrop = makeSkinBackdrop(caseFx)
  glScene.add(skinBackdrop.mesh)
  const pageName = makePageName()
  glScene.add(pageName.mesh)
  const shellMat = caseMaterial(caseFx, 0, { map: pocketMap, floor: pocketFloor, on: true })
  const gasketMat = caseMaterial(caseFx, GLASS_Y, { map: pocketMap, floor: pocketFloor, on: false })

  const shell = new THREE.Mesh(roundedBox(BODY.w, BODY.h, BODY.d, BODY.r), shellMat)
  shell.receiveShadow = true
  shell.userData.bloomCover = pocketCoverMaterial(pocketMap, pocketFloor)
  pivot.add(shell)
  shell.geometry.computeBoundingBox()
  const shellBox = shell.geometry.boundingBox
  const sideZ = shellBox ? (shellBox.min.z + shellBox.max.z) / 2 : -BODY.d / 2
  const backZ = (shellBox?.min.z ?? -BODY.d) - 0.8
  const sticker = makeBackSticker()
  sticker.mesh.position.set(0, -250, backZ)
  sticker.mesh.rotation.y = Math.PI
  pivot.add(sticker.mesh)
  const backQr = makeBackQr(DEVICE_WALLET)
  backQr.mesh.position.set(0, 200, backZ)
  backQr.mesh.rotation.y = Math.PI
  pivot.add(backQr.mesh)
  const backAddress = makeBackAddress(DEVICE_WALLET)
  backAddress.mesh.position.set(0, -432, backZ)
  backAddress.mesh.rotation.y = Math.PI
  pivot.add(backAddress.mesh)

  const gasket = new THREE.Mesh(roundedBox(GLASS.w + 36, GLASS.h + 36, 18, SCREEN_R + 18), gasketMat)
  gasket.castShadow = true
  gasket.position.set(0, GLASS_Y, 8)
  pivot.add(gasket)

  const rocker = new THREE.Mesh(roundedBox(22, 92, 36, 8), sidePlastic())
  rocker.castShadow = true
  placeOnSide(rocker, BODY.w / 2 + 6, 70, sideZ)
  pivot.add(rocker)
  const power = new THREE.Mesh(roundedBox(16, 28, 24, 6), sidePlastic())
  power.castShadow = true
  placeOnSide(power, BODY.w / 2 + 4, -30, sideZ)
  pivot.add(power)

  const led = makeLed()
  led.group.position.set(GLASS.w / 2 - 28, GLASS_Y + GLASS.h / 2 + 8, 16)
  led.group.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj !== led.lamp) obj.castShadow = true
  })
  pivot.add(led.group)

  const readout = makeReadout()
  readout.mesh.position.set(-98, READ_Y - 18, 14)
  pivot.add(readout.mesh)

  const hearts = makeHeartCuts()
  const energy = makeEnergyCuts()
  const hunger = makeHungerCuts()
  const faceZ = shellBox?.max.z ?? 10
  // Face is at faceZ. Keep the lamps clearly in front of it so they don't
  // z-fight the shell (depth precision at this camera distance is coarse).
  const seatCut = (cut: { group: THREE.Group; lipFront: number }, x: number, y: number) => {
    cut.group.position.set(x, y, faceZ - cut.lipFront + 0.7)
    pivot.add(cut.group)
  }
  seatCut(hearts, 50, READ_Y + 32)
  seatCut(energy, 50, READ_Y - 18)
  seatCut(hunger, 50, READ_Y - 68)
  pocketFloor.value = faceZ - 0.15

  const keys: Record<MachineKey, Keypad> = {
    pet: makeKey('pet', 'Pet', -150, KEY_Y),
    feed: makeKey('feed', 'Feed', 0, KEY_Y),
    play: makeKey('play', 'Play', 150, KEY_Y),
  }
  for (const pad of Object.values(keys)) {
    pivot.add(pad.group)
    pad.group.traverse((obj) => {
      obj.userData.key = pad.group.userData.key
    })
  }

  screen.style.width = `${GLASS.pxW}px`
  screen.style.height = `${GLASS.pxH}px`
  const cssObject = new CSS3DObject(screen)
  cssObject.matrixAutoUpdate = false
  cssScene.add(cssObject)

  const anchor = new THREE.Object3D()
  anchor.position.set(0, GLASS_Y, 16)
  anchor.scale.set(PX, PX, PX)
  pivot.add(anchor)

  const screenHit = new THREE.Mesh(
    new THREE.PlaneGeometry(GLASS.w, GLASS.h),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  )
  screenHit.position.set(0, GLASS_Y, 20)
  screenHit.name = 'screen-hit'
  pivot.add(screenHit)

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const machinePose = {
    tilt: THREE.MathUtils.degToRad(-23),
    turn: THREE.MathUtils.degToRad(-31),
    tip: THREE.MathUtils.degToRad(-18),
    lift: -25,
  }
  let userYaw = 0
  let userPitch = 0
  let yaw = coarse ? 0 : machinePose.turn
  let pitch = coarse ? 0 : machinePose.tip
  let roll = coarse ? 0 : machinePose.tilt
  let yawVel = 0
  let pitchVel = 0
  let rollVel = 0
  let straight = false
  let spinning = false
  let dragging = false
  let lookX = 0
  let lookY = 0
  let lookYaw = 0
  let lookPitch = 0
  const screenFacing = new THREE.Vector3()
  const screenPoint = new THREE.Vector3()
  const lampFront = new THREE.Vector3()
  const lampOrigin = new THREE.Vector3()
  let moved = 0
  let lastX = 0
  let lastY = 0
  let held: MachineKey | null = null

  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  const canvas = renderer.domElement

  function aim(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
  }

  const keyRoots = Object.values(keys).map((pad) => pad.group)

  function pick(event: PointerEvent) {
    aim(event)
    const hit = raycaster.intersectObjects(keyRoots, true)[0]?.object
    return hit?.userData.key as MachineKey | undefined
  }

  function screenHitAt(event: PointerEvent) {
    aim(event)
    screenHit.updateWorldMatrix(true, false)
    return raycaster.intersectObject(screenHit, false)[0] ?? null
  }

  function pickScreen(event: PointerEvent) {
    return screenHitAt(event) != null
  }

  function glassPxFromScreenHit(event: PointerEvent) {
    const hit = screenHitAt(event)
    if (!hit?.uv) return null
    return { x: hit.uv.x * GLASS.pxW, y: (1 - hit.uv.y) * GLASS.pxH }
  }

  const shellPoint = new THREE.Vector3()

  function sayBarFieldInput() {
    const input = screen.querySelector('.machine-say-bar input')
    return input instanceof HTMLInputElement ? input : null
  }

  function sayBarInputFromGlass(event: PointerEvent) {
    const px = glassPxFromScreenHit(event)
    if (!px) return null
    if (px.x < SAY_BAR.left || px.x > SAY_BAR.right) return null
    if (px.y < SAY_BAR.top || px.y > SAY_BAR.bottom) return null
    return sayBarFieldInput()
  }

  function sayBarInputFromShell(event: PointerEvent) {
    aim(event)
    shell.updateWorldMatrix(true, false)
    const hit = raycaster.intersectObject(shell, false)[0]
    if (!hit) return null
    shellPoint.copy(hit.point)
    pivot.worldToLocal(shellPoint)
    const glassBottom = GLASS_Y - GLASS.h / 2
    const inGlassX = Math.abs(shellPoint.x) <= GLASS.w / 2 + 12
    const inSayBand = shellPoint.y <= glassBottom + 88 && shellPoint.y >= glassBottom - 36
    if (!inGlassX || !inSayBand) return null
    return sayBarFieldInput()
  }

  function sayBarInputFromClient(event: PointerEvent) {
    const rect = screen.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    const inGlassX = x >= rect.left - 6 && x <= rect.right + 6
    if (!inGlassX) return null
    if (y >= rect.top && y <= rect.bottom) {
      const px = ((x - rect.left) / rect.width) * GLASS.pxW
      const py = ((y - rect.top) / rect.height) * GLASS.pxH
      if (px >= SAY_BAR.left && px <= SAY_BAR.right && py >= SAY_BAR.top && py <= SAY_BAR.bottom) {
        return sayBarFieldInput()
      }
    }
    // CSS3D can paint the say bar lower than getBoundingClientRect() on angled views.
    if (y > rect.bottom - 8 && y < rect.bottom + 168) return sayBarFieldInput()
    return null
  }

  function sayBarInputFromPointer(event: PointerEvent) {
    return sayBarInputFromGlass(event) ?? sayBarInputFromClient(event) ?? sayBarInputFromShell(event)
  }

  function pickShell(event: PointerEvent) {
    aim(event)
    shell.updateWorldMatrix(true, false)
    return raycaster.intersectObject(shell, false).length > 0
  }

  function pickSticker(event: PointerEvent) {
    aim(event)
    sticker.mesh.updateWorldMatrix(true, false)
    return raycaster.intersectObject(sticker.mesh, false).length > 0
  }

  let pressingControl: HTMLElement | null = null
  let pressedScreen = false

  function faceFront() {
    straight = true
    userYaw = 0
    userPitch = 0
  }

  function screenControl(clientX: number, clientY: number) {
    const stack = document.elementsFromPoint(clientX, clientY)
    for (const node of stack) {
      if (!(node instanceof Element)) continue
      const control = node.closest('button, a, input, textarea, select, label, [role="tab"]')
      if (control instanceof HTMLElement && screen.contains(control)) return control
    }
    return null
  }

  function onScreenScroll(clientX: number, clientY: number) {
    const stack = document.elementsFromPoint(clientX, clientY)
    return stack.some((node) => node instanceof Element && node.closest('.machine-info__scroll') && screen.contains(node))
  }

  function onInfoGlass(clientX: number, clientY: number) {
    const stack = document.elementsFromPoint(clientX, clientY)
    return stack.some((node) => {
      if (!(node instanceof Element)) return false
      if (!screen.contains(node)) return false
      return !!node.closest('.machine-info, .machine-info__back, .machine-tabs')
    })
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    pressingControl = screenControl(event.clientX, event.clientY)
    const glassSay = sayBarInputFromPointer(event)
    if (glassSay) pressingControl = glassSay
    pressedScreen = !pressingControl && !onInfoGlass(event.clientX, event.clientY) && pickScreen(event)
    if (pressingControl || pressedScreen || onScreenScroll(event.clientX, event.clientY)) return
    dragging = true
    moved = 0
    lastX = event.clientX
    lastY = event.clientY
    held = pick(event) ?? null
    if (held) keys[held].goal = 1
    mount.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (!coarse) {
      const rect = mount.getBoundingClientRect()
      lookX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      lookY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
    }
    if (!dragging) {
      if (coarse) return
      const hover = pick(event)
      canvas.style.cursor = hover || pickSticker(event) ? 'pointer' : 'grab'
      return
    }
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    moved += Math.abs(dx) + Math.abs(dy)
    lastX = event.clientX
    lastY = event.clientY
    if (moved > 10) {
      if (!spinning) {
        spinning = true
        const yawBase = coarse || straight ? 0 : machinePose.turn
        const pitchBase = coarse || straight ? 0 : machinePose.tip
        userYaw = yaw - yawBase
        userPitch = pitch - pitchBase
      }
      if (held) keys[held].goal = 0
      held = null
      const spin = coarse ? 0.008 : 0.0055
      userYaw = clamp(userYaw + dx * spin, -Math.PI, Math.PI)
      userPitch = clamp(userPitch + dy * 0.0035, -0.28, 0.22)
      event.preventDefault()
    }
  }

  function onPointerUp(event: PointerEvent) {
    const control = pressingControl
    const screenPressed = pressedScreen
    pressingControl = null
    pressedScreen = false
    if (control || screenPressed) {
      dragging = false
      spinning = false
      const sayBar = control?.closest('.machine-say-bar')
      if (!powered || sayBar) faceFront()
      const target = event.target
      if (control && (!(target instanceof Node) || !control.contains(target))) {
        if (control instanceof HTMLInputElement) control.focus()
        else control.click()
      }
      if (screenPressed) onScreen()
      return
    }
    const key = held
    const tapped = dragging && moved < 10
    const didDrag = dragging && moved >= 10
    if (!key && tapped) {
      const glassSay = sayBarInputFromPointer(event)
      if (glassSay) {
        faceFront()
        glassSay.focus()
        dragging = false
        spinning = false
        if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId)
        return
      }
    }
    if (key && tapped) onPress(key)
    if (key) keys[key].goal = 0
    held = null
    dragging = false
    spinning = false
    canvas.style.cursor = 'grab'
    if (tapped && !key && pickSticker(event)) {
      zoomGoal = zoomGoal > 0.5 ? 0 : 1
      return
    }
    if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId)
    if (didDrag) {
      const stopClick = (click: Event) => {
        click.preventDefault()
        click.stopPropagation()
      }
      window.addEventListener('click', stopClick, { capture: true, once: true })
      return
    }
    const target = event.target as HTMLElement | null
    if (
      tapped &&
      !key &&
      !target?.closest('button, a') &&
      pickScreen(event) &&
      !sayBarInputFromPointer(event) &&
      !onInfoGlass(event.clientX, event.clientY)
    ) {
      onScreen()
    }
    if (tapped && !key && !pickScreen(event) && pickShell(event)) {
      const sayInput = sayBarInputFromPointer(event)
      if (sayInput) {
        faceFront()
        sayInput.focus()
      } else if (!coarse) {
        straight = !straight
        userYaw = 0
        userPitch = 0
      }
    }
  }

  function onPointerCancel() {
    pressingControl = null
    pressedScreen = false
    if (held) keys[held].goal = 0
    held = null
    dragging = false
    spinning = false
  }

  let tiltYaw = 0
  let tiltPitch = 0
  let gyroBase: number | null = null
  let gyroListening = false

  function onTilt(event: DeviceOrientationEvent) {
    if (event.gamma == null || event.beta == null) return
    if (gyroBase == null) gyroBase = event.beta
    tiltYaw = clamp(event.gamma, -32, 32) * 0.006
    tiltPitch = clamp(event.beta - gyroBase, -28, 28) * -0.0045
  }

  function listenGyro() {
    if (gyroListening) return
    gyroListening = true
    window.addEventListener('deviceorientation', onTilt)
  }

  const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  const askGyro = () => {
    orientation.requestPermission?.().then((state) => {
      if (state === 'granted') listenGyro()
    }).catch(() => {})
  }
  if (coarse) {
    if (typeof orientation.requestPermission === 'function') {
      mount.addEventListener('pointerdown', askGyro, { once: true })
    } else {
      listenGyro()
    }
  }

  const onPointerLeave = () => {
    lookX = 0
    lookY = 0
  }
  mount.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
  window.addEventListener('pointerleave', onPointerLeave)

  const bloomLayer = new THREE.Layers()
  bloomLayer.set(BLOOM_LAYER)
  const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
  const bloomSwap: { mesh: THREE.Mesh; cover: THREE.Material; saved: THREE.Material | THREE.Material[] }[] = []
  const bloomComposer = new EffectComposer(renderer)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(new RenderPass(glScene, camera))
  bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.18, 0))

  const bloomCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const bloomScene = new THREE.Scene()
  const bloomBlit = new THREE.ShaderMaterial({
    uniforms: { tBloom: { value: null } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tBloom;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(texture2D(tBloom, vUv).rgb, 0.0);
      }
    `,
    transparent: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  bloomScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bloomBlit))

  function hideForBloom() {
    for (const item of bloomSwap) {
      item.saved = item.mesh.material
      item.mesh.material = item.cover
    }
  }

  function restoreAfterBloom() {
    for (const item of bloomSwap) item.mesh.material = item.saved
  }

  let raf = 0
  let last = performance.now()
  const clock = { t: 0 }
  let viewDist = 1800
  const namePose = {
    tilt: THREE.MathUtils.degToRad(10),
    turn: THREE.MathUtils.degToRad(4),
    tip: THREE.MathUtils.degToRad(-17),
    lift: 20,
  }
  let nameTip = namePose.tip
  let nameTurn = namePose.turn
  let nameTilt = namePose.tilt
  let nameTipVel = 0
  let nameTurnVel = 0
  let nameTiltVel = 0
  let zoom = 0
  let zoomGoal = 0
  let pull = 0
  let pullGoal = 0
  let recess = 0
  let recessGoal = 0
  let recessBlur = 0
  let recessBlurGoal = 0
  let pullOpenLift = 200
  let pullOpenScale = 1.18
  let focus = 0
  let focusVel = 0
  const stickerPoint = new THREE.Vector3()
  const stickerFront = new THREE.Vector3()
  const toCamera = new THREE.Vector3()
  let zoomDistance = 1800
  const nameCorner = new THREE.Vector3()
  const nameEuler = new THREE.Euler()
  const nameQuat = new THREE.Quaternion()
  const machineReach = Math.hypot(BODY.w, BODY.h, BODY.d) / 2 + 220

  function zoomDist() {
    const vFov = THREE.MathUtils.degToRad(camera.fov)
    const pad = 1.55
    const distH = (STICKER.h * pad) / 2 / Math.tan(vFov / 2)
    const distW = (STICKER.w * pad) / 2 / (Math.tan(vFov / 2) * camera.aspect)
    return Math.max(distH, distW)
  }

  function frame() {
    const w = mount.clientWidth
    const h = Math.max(mount.clientHeight, 1)
    const aspect = w / h
    camera.aspect = aspect
    const vFov = THREE.MathUtils.degToRad(camera.fov)
    const margin = aspect < 0.75 ? 1.08 : 1.28
    const distH = (BODY.h * margin) / 2 / Math.tan(vFov / 2)
    const distW = (BODY.w * margin) / 2 / (Math.tan(vFov / 2) * aspect)
    viewDist = Math.max(distH, distW)
    pivot.position.y = window.innerWidth <= 900 ? 70 : machinePose.lift
    camera.position.z = THREE.MathUtils.lerp(viewDist, zoomDist(), zoom)
    camera.updateProjectionMatrix()
    skinBackdrop.aspect.value = aspect
    renderer.setSize(w, h)
    bloomComposer.setPixelRatio(renderer.getPixelRatio() * 0.5)
    bloomComposer.setSize(w, h)
    zoomDistance = zoomDist()
    cssRenderer.setSize(w, h)
    overlayCamera.left = -w / 2
    overlayCamera.right = w / 2
    overlayCamera.top = h / 2
    overlayCamera.bottom = -h / 2
    overlayCamera.updateProjectionMatrix()
    const cardTop = h - 28 - 262
    const bandTop = 20
    const bandBot = Math.max(bandTop + 240, cardTop - 24)
    const tanHalf = Math.tan(vFov / 2)
    const restY = window.innerWidth <= 900 ? 70 : machinePose.lift
    const topY = restY + BODY.h / 2
    const botY = restY - BODY.h / 2
    const nTop = 1 - bandTop / (h / 2)
    const nBot = 1 - bandBot / (h / 2)
    const depth = (topY - botY) / ((nTop - nBot) * tanHalf)
    const camY = topY - nTop * depth * tanHalf
    pullOpenLift = 30 - camY
    pullOpenScale = (depth + BODY.d / 2) / (viewDist * 0.9)
  }

  const plainColor = new THREE.Color(0x23262e)
  const shellTarget = plainColor.clone()
  let reveal = 0
  let revealGoal = 0
  let shownId: string | null = null
  let paintedName = ''
  let bootTime: number | null = null
  let powered = true
  const lightNow = { mood: 0, energy: 0, hunger: 0 }
  const lightGoal = { mood: 0, energy: 0, hunger: 0 }

  function paintVeil(amount: number) {
    const page = mount.parentElement
    const blur = amount < 0.004 ? '' : `blur(${(amount * 18).toFixed(2)}px)`
    mount.style.filter = blur
    const sticker = page?.querySelector('.rarity-sticker')
    if (sticker instanceof HTMLElement) sticker.style.filter = blur
    page?.style.setProperty('--glass-blur', `${(52 * (1 - amount)).toFixed(2)}px`)
    page?.style.setProperty('--glass-alpha', (0.34 + 0.54 * amount).toFixed(3))
  }

  function clearRecessBlur() {
    recessBlurGoal = 0
  }

  function animate(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    clock.t += dt
    reveal = THREE.MathUtils.damp(reveal, revealGoal, 1.7, dt)
    caseFx.uReveal.value = reveal
    shellMat.color.lerp(shellTarget, 1 - Math.exp(-2.6 * dt))
    gasketMat.color.copy(shellMat.color)
    lightNow.mood = THREE.MathUtils.damp(lightNow.mood, lightGoal.mood, 1.6, dt)
    lightNow.energy = THREE.MathUtils.damp(lightNow.energy, lightGoal.energy, 1.6, dt)
    lightNow.hunger = THREE.MathUtils.damp(lightNow.hunger, lightGoal.hunger, 1.6, dt)
    hearts.setLevel(lightNow.mood)
    energy.setLevel(lightNow.energy)
    hunger.setLevel(lightNow.hunger)
    let yawGoal = machinePose.turn + userYaw
    let pitchGoal = machinePose.tip + userPitch
    let rollGoal = machinePose.tilt
    if (coarse) {
      const lean = 1 - zoom
      yawGoal = userYaw + tiltYaw * lean
      pitchGoal = userPitch + tiltPitch * lean
      rollGoal = 0
      pivot.position.y = 70
    } else if (straight) {
      yawGoal = userYaw
      pitchGoal = userPitch
      rollGoal = 0
    }
    if (spinning) {
      yaw = yawGoal
      pitch = pitchGoal
      roll = rollGoal
      yawVel = 0
      pitchVel = 0
      rollVel = 0
    } else {
      ;[yaw, yawVel] = springTo(yaw, yawVel, yawGoal, dt)
      ;[pitch, pitchVel] = springTo(pitch, pitchVel, pitchGoal, dt)
      ;[roll, rollVel] = springTo(roll, rollVel, rollGoal, dt)
    }
    ;[focus, focusVel] = springTo(focus, focusVel, !coarse && straight ? 1 : 0, dt)
    if (!coarse) {
      const hover = !spinning && zoom < 0.12 ? Math.max(0, 1 - focus) : 0
      const wave = Math.sin(clock.t * 0.8) * hover
      const tip = Math.sin(clock.t * 0.8 + 0.7) * hover
      pivot.rotation.z = roll + tip * 0.06
      pivot.position.y = machinePose.lift + wave * 16
      pivot.rotation.x = pitch + tip * 0.04
    } else {
      pivot.rotation.z = roll
      pivot.rotation.x = pitch
    }
    pivot.rotation.y = yaw
    if (!coarse && !spinning && zoom < 0.2) {
      lookYaw = THREE.MathUtils.damp(lookYaw, lookX * 0.16, 5, dt)
      lookPitch = THREE.MathUtils.damp(lookPitch, lookY * 0.09, 5, dt)
    } else {
      lookYaw = THREE.MathUtils.damp(lookYaw, 0, 5, dt)
      lookPitch = THREE.MathUtils.damp(lookPitch, 0, 5, dt)
    }
    pivot.rotation.y += lookYaw
    pivot.rotation.x += lookPitch
    sticker.mesh.getWorldPosition(stickerPoint)
    sticker.mesh.getWorldDirection(stickerFront)
    if (zoomGoal > 0 && stickerFront.dot(toCamera.copy(camera.position).sub(stickerPoint)) < 0.2) zoomGoal = 0
    zoom = THREE.MathUtils.damp(zoom, zoomGoal, 4.5, dt)
    pull = THREE.MathUtils.damp(pull, pullGoal, 3, dt)
    recess = THREE.MathUtils.damp(recess, recessGoal, 3, dt)
    recessBlur = THREE.MathUtils.damp(recessBlur, recessBlurGoal, 8, dt)
    pageName.setBlur(pull)
    const pullScale = 1 + pull * (pullOpenScale - 1)
    const frameScale = Math.max(pullScale, 1 + recess * 0.5)
    const pullLift = pull * pullOpenLift
    paintVeil(recessBlur)
    camera.position.set(
      THREE.MathUtils.lerp(0, stickerPoint.x, zoom),
      THREE.MathUtils.lerp(30 - pullLift, stickerPoint.y, zoom),
      THREE.MathUtils.lerp(viewDist * (1 - focus * 0.1) * frameScale, zoomDistance, zoom),
    )
    camera.lookAt(camera.position.x, camera.position.y, 0)
    const nameBleed = camera.aspect < 0.75 ? 1.45 : 1.08
    const nameTipGoal = !coarse && !straight ? namePose.tip : 0
    const nameTurnGoal = !coarse && !straight ? namePose.turn : 0
    const nameTiltGoal = !coarse && !straight ? namePose.tilt : 0
    ;[nameTip, nameTipVel] = springTo(nameTip, nameTipVel, nameTipGoal, dt)
    ;[nameTurn, nameTurnVel] = springTo(nameTurn, nameTurnVel, nameTurnGoal, dt)
    ;[nameTilt, nameTiltVel] = springTo(nameTilt, nameTiltVel, nameTiltGoal, dt)
    const textTurn = nameTurn - (coarse ? 0 : lookYaw * 0.06)
    const textTip = nameTip - (coarse ? 0 : lookPitch * 0.06)
    nameEuler.set(textTip, textTurn, nameTilt)
    nameQuat.setFromEuler(nameEuler)
    const nameHalfH = PAGE_NAME_H / PAGE_NAME_W / 2
    let nameForward = 0
    for (const x of [-0.5, 0.5]) {
      for (const y of [-nameHalfH, nameHalfH]) {
        nameCorner.set(x, y, 0).applyQuaternion(nameQuat)
        if (nameCorner.z > nameForward) nameForward = nameCorner.z
      }
    }
    const nameWidthPerDist = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect * nameBleed
    const nameSwing = nameForward * nameWidthPerDist
    const nameDepth = nameSwing < 0.85 ? (machineReach + nameSwing * camera.position.z) / (1 - nameSwing) : machineReach + 900
    pageName.mesh.position.z = -nameDepth
    const nameDist = camera.position.z - pageName.mesh.position.z
    const nameViewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * nameDist
    const nameViewW = nameViewH * camera.aspect
    const nameIn = THREE.MathUtils.smoothstep(reveal, 0.04, 1)
    const nameWidth = nameViewW * nameBleed * (1 - focus * 0.06) * (0.78 + 0.22 * nameIn) / frameScale
    pageName.mesh.scale.set(nameWidth, nameWidth, 1)
    pageName.mesh.position.x = nameViewW * (0.02 - (coarse ? 0 : lookX * 0.004))
    const nameRise = (1 - nameIn) * nameViewH * 0.05
    if (coarse) {
      pageName.mesh.rotation.set(0, 0, 0)
      pageName.mesh.position.y = 30 - nameRise
    } else {
      pageName.mesh.rotation.set(textTip, textTurn, nameTilt)
      pageName.mesh.position.y = 30 + namePose.lift - lookY * nameViewH * 0.003 - nameRise
    }
    pageName.mat.opacity = reveal * (1 - zoom)
    pageName.mesh.visible = pageName.mat.opacity > 0.02
    caseFx.uTime.value = clock.t
    caseFx.uTilt.value.set(yaw, pitch)
    Object.values(keys).forEach((pad) => {
      pad.pressed = THREE.MathUtils.damp(pad.pressed, pad.goal, 18, dt)
      pad.group.position.z = 16 - pad.pressed * 8
    })
    const ledMat = led.lamp.material as THREE.MeshStandardMaterial
    const elapsed = bootTime
    const booting = elapsed != null && !shownId
    if (!shownId && !powered && elapsed == null) {
      ledMat.color.set(0x050806)
      ledMat.emissive.set(0x000000)
      ledMat.emissiveIntensity = 0
      hearts.setLevel(0)
      energy.setLevel(0)
      hunger.setLevel(0)
    } else if (elapsed != null && booting) {
      const rise = THREE.MathUtils.smoothstep(elapsed, 0.2, 1.75)
      ledMat.color.set(0x3a1c08)
      ledMat.emissive.set(0xff9a3a)
      ledMat.emissiveIntensity = rise * 1.05
      const sweepStart = 3.05
      const sweepFill = 0.7
      const sweepHold = 0.38
      const sweepBack = 0.7
      const sweepT = elapsed - sweepStart
      const sweepSpan = sweepFill + sweepHold + sweepBack
      if (sweepT >= 0 && sweepT <= sweepSpan) {
        let progress = 1
        if (sweepT < sweepFill) progress = sweepT / sweepFill
        else if (sweepT > sweepFill + sweepHold) progress = 1 + (sweepT - sweepFill - sweepHold) / sweepBack
        hearts.sweep(progress)
        energy.sweep(progress)
        hunger.sweep(progress)
      } else {
        hearts.setLevel(0)
        energy.setLevel(0)
        hunger.setLevel(0)
      }
    } else if (!shownId) {
      ledMat.color.set(0x3a1c08)
      ledMat.emissive.set(0xff9a3a)
      ledMat.emissiveIntensity = 1.05 + Math.sin(clock.t * 2.2) * 0.12
      hearts.setLevel(lightNow.mood)
      energy.setLevel(lightNow.energy)
      hunger.setLevel(lightNow.hunger)
    } else {
      ledMat.color.set(0x0c281c)
      ledMat.emissive.set(0x5ee6a4)
      ledMat.emissiveIntensity = 1.05 + Math.sin(clock.t * 2.2) * 0.12
      hearts.setLevel(lightNow.mood)
      energy.setLevel(lightNow.energy)
      hunger.setLevel(lightNow.hunger)
    }
    hearts.pulse(clock.t)
    energy.pulse(clock.t)
    hunger.pulse(clock.t)
    if (!shownId && !booting && powered) hearts.idleBeat(clock.t)
    pivot.updateWorldMatrix(true, false)
    lampFront.set(0, 0, 1).transformDirection(pivot.matrixWorld)
    lampOrigin.setFromMatrixPosition(pivot.matrixWorld)
    const lampsFaceCamera = lampFront.dot(toCamera.copy(camera.position).sub(lampOrigin)) > 0.2
    hearts.group.visible = lampsFaceCamera
    energy.group.visible = lampsFaceCamera
    hunger.group.visible = lampsFaceCamera
    camera.layers.enable(BLOOM_LAYER)
    hideForBloom()
    bloomComposer.render()
    restoreAfterBloom()
    camera.layers.disable(BLOOM_LAYER)
    renderer.setRenderTarget(null)
    renderer.autoClear = true
    renderer.render(glScene, camera)
    bloomBlit.uniforms.tBloom.value = bloomComposer.readBuffer.texture
    renderer.autoClear = false
    renderer.render(bloomScene, bloomCamera)
    if (rarityRun) {
      const t = (performance.now() - rarityRun.start) / 1000
      const grow = Math.min(1, t / 0.7)
      rarityRun.text.scale.setScalar(0.62 + easeOutBack(grow) * 0.38)
      rarityRun.textMat.opacity = t < 1.05 ? Math.min(1, t / 0.32) : Math.max(0, 1 - (t - 1.05) / 0.18)
      if (t >= 1.05) {
        rarityRun.sparks.visible = true
        rarityRun.burstMat.uniforms.uTime.value = t - 1.05
      }
      renderer.clearDepth()
      renderer.render(overlayScene, overlayCamera)
      if (t > 2.15) clearRarity()
    }
    renderer.autoClear = true
    anchor.updateWorldMatrix(true, false)
    anchor.getWorldDirection(screenFacing)
    anchor.getWorldPosition(screenPoint)
    cssObject.visible = screenFacing.dot(toCamera.copy(camera.position).sub(screenPoint)) > 0.02
    cssObject.matrix.copy(anchor.matrixWorld)
    cssRenderer.render(cssScene, camera)
    raf = requestAnimationFrame(animate)
  }

  const RARITY_INK: Record<string, string> = {
    common: '#f4efe6',
    uncommon: '#9dce86',
    rare: '#8ec8ff',
    legendary: '#f2c14e',
  }

  function easeOutBack(t: number) {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
  }

  type RarityRun = {
    start: number
    text: THREE.Mesh
    textMat: THREE.MeshBasicMaterial
    sparks: THREE.InstancedMesh
    burstMat: THREE.ShaderMaterial
    texture: THREE.Texture
    geos: THREE.BufferGeometry[]
  }
  let rarityRun: RarityRun | null = null

  function clearRarity() {
    if (!rarityRun) return
    overlayScene.clear()
    rarityRun.sparks.dispose()
    rarityRun.texture.dispose()
    rarityRun.textMat.dispose()
    rarityRun.burstMat.dispose()
    for (const geo of rarityRun.geos) geo.dispose()
    rarityRun = null
  }

  function playRarity(rarity: string) {
    clearRarity()
    const word = rarity.toUpperCase()
    const color = RARITY_INK[rarity] ?? '#f4efe6'
    const rgb = color.match(/[0-9a-f]{2}/gi)?.map((part) => Number.parseInt(part, 16) / 255) ?? [1, 1, 1]
    const TW = 2048
    const TH = 720
    const plate = document.createElement('canvas')
    plate.width = TW
    plate.height = TH
    const ctx = plate.getContext('2d')
    if (!ctx) return
    let fontSize = 520
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${fontSize}px Silkscreen, monospace`
    while (fontSize > 90 && ctx.measureText(word).width > TW * 0.88) {
      fontSize -= 14
      ctx.font = `700 ${fontSize}px Silkscreen, monospace`
    }
    const measured = ctx.measureText(word).width
    ctx.lineJoin = 'round'
    ctx.lineWidth = 28
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.strokeText(word, TW / 2, TH / 2)
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 28
    ctx.fillText(word, TW / 2, TH / 2)
    ctx.shadowBlur = 0
    ctx.fillText(word, TW / 2, TH / 2)
    const viewW = mount.clientWidth || window.innerWidth
    const viewH = mount.clientHeight || window.innerHeight
    const wordFrac = Math.max(0.2, measured / TW)
    const planeW = Math.min(viewW * 0.78, 900) / wordFrac
    const planeH = planeW * (TH / TW)
    const texture = new THREE.CanvasTexture(plate)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    const textGeo = new THREE.PlaneGeometry(planeW, planeH)
    const textMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      opacity: 0,
    })
    const text = new THREE.Mesh(textGeo, textMat)
    text.frustumCulled = false
    text.renderOrder = 1
    overlayScene.add(text)
    const image = ctx.getImageData(0, 0, TW, TH).data
    const hits: number[] = []
    for (let y = 0; y < TH; y += 9) {
      for (let x = 0; x < TW; x += 9) {
        if (image[(y * TW + x) * 4 + 3] < 170) continue
        hits.push(x, y)
      }
    }
    const pairCount = hits.length / 2
    const stride = Math.max(1, Math.ceil(pairCount / 280))
    const count = Math.max(1, Math.floor(pairCount / stride))
    const starts = new Float32Array(count * 2)
    const seeds = new Float32Array(count)
    const stretches = new Float32Array(count)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = hits[i * stride * 2] ?? TW / 2
      const y = hits[i * stride * 2 + 1] ?? TH / 2
      starts[i * 2] = (x / TW - 0.5) * planeW
      starts[i * 2 + 1] = (0.5 - y / TH) * planeH
      const spark = (x * 13 + y * 7) % 7 === 0
      seeds[i] = Math.random()
      stretches[i] = spark ? 0.55 + Math.random() * 0.3 : Math.random() * 0.08
      sizes[i] = spark ? 5 + Math.random() * 4 : 6 + Math.random() * 5
    }
    const quad = new THREE.PlaneGeometry(1, 1)
    const burstMat = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      premultipliedAlpha: true,
      side: THREE.DoubleSide,
      toneMapped: false,
      uniforms: {
        uTime: { value: -1 },
        uSpread: { value: Math.min(viewW, viewH) * 0.1 },
        uColor: { value: new THREE.Vector3(rgb[0], rgb[1], rgb[2]) },
      },
      vertexShader: BURST_VERT,
      fragmentShader: BURST_FRAG,
    })
    const sparks = new THREE.InstancedMesh(quad, burstMat, count)
    sparks.geometry.setAttribute('aStart', new THREE.InstancedBufferAttribute(starts, 2))
    sparks.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    sparks.geometry.setAttribute('aStretch', new THREE.InstancedBufferAttribute(stretches, 1))
    sparks.geometry.setAttribute('aSize', new THREE.InstancedBufferAttribute(sizes, 1))
    sparks.frustumCulled = false
    sparks.visible = false
    sparks.renderOrder = 2
    text.add(sparks)
    rarityRun = { start: performance.now(), text, textMat, sparks, burstMat, texture, geos: [textGeo, quad] }
  }

  glScene.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh || bloomLayer.test(mesh.layers)) return
    bloomSwap.push({
      mesh,
      cover: (mesh.userData.bloomCover as THREE.Material | undefined) ?? darkMaterial,
      saved: mesh.material,
    })
  })

  const onResize = () => frame()
  window.addEventListener('resize', onResize)
  frame()
  raf = requestAnimationFrame(animate)

  return {
    setBoot(elapsed) {
      bootTime = elapsed
    },
    setPower(on) {
      powered = on
      if (on) {
        straight = true
        userYaw = 0
        userPitch = 0
      }
    },
    setLights(buddy) {
      if (!buddy) {
        lightGoal.mood = 0
        lightGoal.energy = 0
        lightGoal.hunger = 0
        return
      }
      lightGoal.mood = Math.max(buddy.needs.happiness, MOOD_LIGHT[buddy.mood])
      lightGoal.energy = buddy.needs.energy
      lightGoal.hunger = buddy.needs.hunger
    },
    playRarity,
    setPull(on) {
      pullGoal = on ? 1 : 0
      if (on) {
        recessGoal = 0
        clearRecessBlur()
        faceFront()
      } else straight = false
    },
    setPick(on) {
      recessGoal = on ? 1 : 0
      recessBlurGoal = on ? 1 : 0
    },
    faceFront,
    setReadout(buddy, revealMode = 'snap') {
      if (!buddy) {
        shownId = null
        reveal = 0
        revealGoal = 0
        caseFx.uReveal.value = 0
        caseFx.uRarity.value = -1
        shellTarget.copy(plainColor)
        shellMat.color.copy(plainColor)
        gasketMat.color.copy(plainColor)
        sticker.paint(null)
        readout.paint(null)
        pageName.paint('')
        paintedName = ''
        lightGoal.mood = 0
        lightGoal.energy = 0
        lightGoal.hunger = 0
        return
      }
      const fresh = shownId !== buddy.id
      const sameFace = !fresh && paintedName === buddy.name
      shownId = buddy.id
      const rank = { common: 0, uncommon: 1, rare: 2, legendary: 3 }[buddy.dna.rarity]
      const skin = skinFromSeed(buddy.visualSeed)
      caseFx.uRarity.value = rank
      caseFx.uFoil.value.set(skin.foil)
      caseFx.uPhase.value = skin.phase
      caseFx.uBand.value = skin.band
      caseFx.uChroma.value = skin.chroma
      caseFx.uGrid.value = skin.grid
      shellTarget.set(skin.base)
      skinBackdrop.base.set(skin.base)
      lightGoal.mood = Math.max(buddy.needs.happiness, MOOD_LIGHT[buddy.mood])
      lightGoal.energy = buddy.needs.energy
      lightGoal.hunger = buddy.needs.hunger
      if (!sameFace) {
        sticker.paint(buddy)
        readout.paint(buddy)
        pageName.paint(buddy.name)
        paintedName = buddy.name
      }
      if (!fresh) return
      if (revealMode === 'animate') {
        revealGoal = 1
        return
      }
      reveal = 1
      revealGoal = 1
      caseFx.uReveal.value = 1
      shellMat.color.copy(shellTarget)
      gasketMat.color.copy(shellTarget)
      lightNow.mood = lightGoal.mood
      lightNow.energy = lightGoal.energy
      lightNow.hunger = lightGoal.hunger
      hearts.setLevel(lightNow.mood)
      energy.setLevel(lightNow.energy)
      hunger.setLevel(lightNow.hunger)
    },
    sticker: sticker.canvas,
    dispose() {
      cancelAnimationFrame(raf)
      clearRarity()
      window.removeEventListener('deviceorientation', onTilt)
      mount.removeEventListener('pointerdown', askGyro)
      mount.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', onResize)
      cssScene.remove(cssObject)
      bloomComposer.dispose()
      bloomBlit.dispose()
      darkMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      cssRenderer.domElement.remove()
      glScene.environment?.dispose()
      skinBackdrop.mesh.geometry.dispose()
      ;(skinBackdrop.mesh.material as THREE.Material).dispose()
      pageName.dispose()
      screenHit.geometry.dispose()
      ;(screenHit.material as THREE.Material).dispose()
      sticker.dispose()
      backQr.dispose()
      backAddress.dispose()
      pocketMap.dispose()
      ;(shell.userData.bloomCover as THREE.Material | undefined)?.dispose()
    },
  }
}

const STICKER = { w: 188, h: 268 }

const CARD_SANS = '"Segoe UI", system-ui, sans-serif'
const CARD_SERIF = 'Georgia, "Palatino Linotype", "Times New Roman", serif'
const CARD_INK = '#f4efe6'
const CARD_STONE = '#d2c8bb'
const CARD_MUTE = '#9a9186'

function mixHex(a: string, b: string, t: number) {
  const parse = (hex: string) => {
    const n = Number.parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
  }
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  const channel = (from: number, to: number) => Math.round(from + (to - from) * t).toString(16).padStart(2, '0')
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function skinFromSeed(seed: number) {
  const rng = mulberry32((seed || 1) >>> 0)
  const hue = rng() * 360
  const base = hslToHex(hue, 22 + rng() * 18, 14 + rng() * 6)
  const foil = hslToHex((hue + 16 + rng() * 48) % 360, 52 + rng() * 32, 66 + rng() * 14)
  const accent = hslToHex((hue + 130 + rng() * 50) % 360, 46 + rng() * 30, 70 + rng() * 10)
  return {
    base,
    foil,
    accent,
    phase: rng(),
    band: ((40 + rng() * 38) * Math.PI) / 180,
    chroma: ((18 + rng() * 50) * Math.PI) / 180,
    grid: 56 + rng() * 28,
  }
}

function makeBackSticker() {
  const canvas = document.createElement('canvas')
  canvas.width = 752
  canvas.height = 1072
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('sticker')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(STICKER.w, STICKER.h), material)
  let current: BuddyState | null = null
  const view = document.createElement('canvas')
  let pen = ctx

  const paint = () => {
    const plate = { x: 28, y: 28, w: canvas.width - 56, h: canvas.height - 56, r: 36 }
    const strokePlate = (inset: number, color: string, width: number) => {
      pen.beginPath()
      pen.roundRect(plate.x + inset, plate.y + inset, plate.w - inset * 2, plate.h - inset * 2, Math.max(8, plate.r - inset))
      pen.strokeStyle = color
      pen.lineWidth = width
      pen.stroke()
    }
    const corners = (inset: number, len: number, color: string) => {
      const x = plate.x + inset
      const y = plate.y + inset
      const w = plate.w - inset * 2
      const h = plate.h - inset * 2
      pen.strokeStyle = color
      pen.lineWidth = 3
      pen.lineCap = 'square'
      const marks: Array<[number, number, number, number]> = [
        [x, y, 1, 1],
        [x + w, y, -1, 1],
        [x, y + h, 1, -1],
        [x + w, y + h, -1, -1],
      ]
      for (const [cx, cy, dx, dy] of marks) {
        pen.beginPath()
        pen.moveTo(cx, cy + dy * len)
        pen.lineTo(cx, cy)
        pen.lineTo(cx + dx * len, cy)
        pen.stroke()
      }
    }

    pen.clearRect(0, 0, canvas.width, canvas.height)
    pen.textAlign = 'center'
    pen.textBaseline = 'middle'
    pen.letterSpacing = '0px'

    if (!current) {
      pen.fillStyle = '#1c1e24'
      pen.beginPath()
      pen.roundRect(plate.x, plate.y, plate.w, plate.h, plate.r)
      pen.fill()
      strokePlate(0, 'rgba(255,255,255,0.08)', 2)
      return
    }

    const rarity = current.dna.rarity
    const tier = { common: 0, uncommon: 1, rare: 2, legendary: 3 }[rarity]
    const skin = skinFromSeed(current.visualSeed)
    const foil = skin.foil
    const ground = mixHex(skin.base, '#07080c', 0.42 + tier * 0.1)
    const name = titleCase(current.name)
    const coat = titleCase(current.dna.coatName)
    const hex = current.visualSeed.toString(16).padStart(8, '0').slice(-8).toUpperCase()
    const serial = `${hex.slice(0, 4)} ${hex.slice(4)}`
    const cx = canvas.width / 2

    pen.save()
    pen.shadowColor = 'rgba(0,0,0,0.5)'
    pen.shadowBlur = 22
    pen.shadowOffsetY = 12
    pen.beginPath()
    pen.roundRect(plate.x, plate.y, plate.w, plate.h, plate.r)
    const paper = pen.createLinearGradient(0, plate.y, 0, plate.y + plate.h)
    paper.addColorStop(0, mixHex(ground, foil, tier === 0 ? 0.05 : 0.14))
    paper.addColorStop(0.42, ground)
    paper.addColorStop(1, mixHex(ground, '#000000', 0.4))
    pen.fillStyle = paper
    pen.fill()
    pen.restore()

    if (tier > 0) {
      pen.save()
      pen.beginPath()
      pen.roundRect(plate.x, plate.y, plate.w, plate.h, plate.r)
      pen.clip()
      const wash = pen.createRadialGradient(cx, 520, 20, cx, 520, 420)
      wash.addColorStop(0, foil)
      wash.addColorStop(1, 'rgba(0,0,0,0)')
      pen.globalAlpha = [0, 0.1, 0.16, 0.22][tier]
      pen.fillStyle = wash
      pen.fillRect(plate.x, plate.y, plate.w, plate.h)
      pen.restore()
    }

    strokePlate(1, 'rgba(255,255,255,0.16)', 2)
    if (tier >= 2) {
      strokePlate(16, mixHex(foil, '#ffffff', 0.28), 2)
      strokePlate(22, foil, 1.5)
    } else if (tier === 1) {
      strokePlate(16, mixHex(skin.accent, foil, 0.35), 1.5)
    }
    if (tier >= 1) corners(34, tier === 3 ? 54 : 40, foil)

    if (tier === 3) {
      pen.strokeStyle = mixHex(foil, '#ffffff', 0.35)
      pen.lineWidth = 2
      pen.beginPath()
      pen.moveTo(plate.x + 72, plate.y + plate.h - 20)
      pen.lineTo(plate.x + plate.w - 72, plate.y + plate.h - 20)
      pen.stroke()
      pen.strokeStyle = foil
      pen.lineWidth = 4
      pen.beginPath()
      pen.moveTo(plate.x + 72, plate.y + plate.h - 26)
      pen.lineTo(plate.x + plate.w - 72, plate.y + plate.h - 26)
      pen.stroke()
    }

    const markX = plate.x + plate.w - 62
    const markY = plate.y + 52
    if (tier === 3) {
      pen.fillStyle = foil
      pen.beginPath()
      pen.roundRect(markX, markY, 18, 18, 3)
      pen.fill()
      pen.fillStyle = ground
      pen.beginPath()
      pen.roundRect(markX + 6, markY + 6, 6, 6, 1)
      pen.fill()
    } else if (tier === 2) {
      pen.strokeStyle = foil
      pen.lineWidth = 2
      pen.beginPath()
      pen.moveTo(markX + 9, markY)
      pen.lineTo(markX + 18, markY + 9)
      pen.lineTo(markX + 9, markY + 18)
      pen.lineTo(markX, markY + 9)
      pen.closePath()
      pen.stroke()
    }

    const write = (text: string, y: number, font: string, color: string, spacing: string) => {
      pen.font = font
      pen.fillStyle = color
      pen.letterSpacing = spacing
      pen.fillText(text, cx, y)
      pen.letterSpacing = '0px'
    }
    const diamond = (x: number, y: number, rx: number, ry: number) => {
      pen.beginPath()
      pen.moveTo(x, y - ry)
      pen.lineTo(x + rx, y)
      pen.lineTo(x, y + ry)
      pen.lineTo(x - rx, y)
      pen.closePath()
    }
    const ornament = (y: number, half: number) => {
      pen.strokeStyle = mixHex(foil, CARD_INK, 0.35)
      pen.lineWidth = 1.5
      pen.beginPath()
      pen.moveTo(cx - half, y)
      pen.lineTo(cx - 12, y)
      pen.moveTo(cx + 12, y)
      pen.lineTo(cx + half, y)
      pen.stroke()
      diamond(cx, y, 5, 5)
      pen.stroke()
    }

    const sealY = 536
    pen.save()
    pen.beginPath()
    pen.ellipse(cx, sealY, 112, 86, 0, 0, Math.PI * 2)
    pen.fillStyle = mixHex(ground, foil, 0.1)
    pen.fill()
    pen.lineWidth = 2
    pen.strokeStyle = mixHex(foil, '#ffffff', 0.4)
    pen.stroke()
    pen.beginPath()
    pen.ellipse(cx, sealY, 100, 74, 0, 0, Math.PI * 2)
    pen.strokeStyle = foil
    pen.globalAlpha = 0.8
    pen.stroke()
    pen.restore()

    write('LIFE CERTIFICATE', 108, `600 20px ${CARD_SANS}`, CARD_MUTE, '0.18em')
    write('BUDDY', 150, `600 26px ${CARD_SANS}`, CARD_INK, '0.2em')
    ornament(184, 150)

    let raritySize = 48
    const rarityWord = rarity.toUpperCase()
    pen.letterSpacing = '0.12em'
    pen.font = `600 ${raritySize}px ${CARD_SANS}`
    while (raritySize > 34 && pen.measureText(rarityWord).width > 520) {
      raritySize -= 2
      pen.font = `600 ${raritySize}px ${CARD_SANS}`
    }
    write(rarityWord, 252, `600 ${raritySize}px ${CARD_SANS}`, foil, '0.12em')
    const issued = new Date(current.createdAt)
    const date = issued
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .toUpperCase()
    write(date, 312, `500 20px ${CARD_SANS}`, CARD_MUTE, '0.14em')

    const pipY = 356
    for (let i = 0; i < 4; i++) {
      const px = cx + (i - 1.5) * 26
      diamond(px, pipY, 6, 7)
      if (i <= tier) {
        pen.fillStyle = foil
        pen.fill()
      } else {
        pen.strokeStyle = mixHex(foil, CARD_MUTE, 0.45)
        pen.lineWidth = 1.5
        pen.stroke()
      }
    }

    const nameRx = 84
    const nameRy = 58
    let nameSize = 64
    const nameFits = (size: number) => {
      pen.font = `400 ${size}px ${CARD_SERIF}`
      const metrics = pen.measureText(name)
      const ascent = metrics.actualBoundingBoxAscent || size * 0.72
      const descent = metrics.actualBoundingBoxDescent || size * 0.22
      const half = metrics.width / 2 + 6
      const chord = (dy: number) => {
        const t = (dy / nameRy) ** 2
        if (t >= 1) return 0
        return nameRx * Math.sqrt(1 - t)
      }
      return half <= chord(-ascent) && half <= chord(descent)
    }
    while (nameSize > 22 && !nameFits(nameSize)) nameSize -= 2
    write(name, sealY, `400 ${nameSize}px ${CARD_SERIF}`, CARD_INK, '0px')
    write(coat, 668, `italic 400 30px ${CARD_SERIF}`, CARD_STONE, '0.02em')

    const detail = [titleCase(current.dna.pattern), current.dna.accessory !== 'none' ? titleCase(current.dna.accessory) : '']
      .filter(Boolean)
      .join('  ·  ')
    write(detail, 716, `600 16px ${CARD_SANS}`, CARD_MUTE, '0.16em')

    const chips = [current.dna.base, current.dna.spot, current.dna.belly, current.dna.eye, current.dna.accent]
    const chip = 26
    const chipGap = 16
    let chipX = cx - (chips.length * chip + (chips.length - 1) * chipGap) / 2
    const chipY = 768
    for (const color of chips) {
      pen.beginPath()
      pen.arc(chipX + chip / 2, chipY, chip / 2, 0, Math.PI * 2)
      pen.fillStyle = color
      pen.fill()
      pen.lineWidth = 2
      pen.strokeStyle = mixHex(foil, '#ffffff', 0.25)
      pen.stroke()
      chipX += chip + chipGap
    }

    ornament(808, 220)
    write('SERIAL', 858, `600 16px ${CARD_SANS}`, CARD_MUTE, '0.18em')
    write(serial, 906, `500 28px ${CARD_SANS}`, CARD_INK, '0.1em')
  }

  const draw = () => {
    pen = ctx
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    paint()
    texture.needsUpdate = true
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const bw = Math.round(188 * dpr)
    const bh = Math.round(268 * dpr)
    if (view.width !== bw || view.height !== bh) {
      view.width = bw
      view.height = bh
    }
    const shown = view.getContext('2d')
    if (!shown) return
    shown.setTransform(bw / canvas.width, 0, 0, bh / canvas.height, 0, 0)
    pen = shown
    paint()
    pen = ctx
  }

  document.fonts?.ready.then(draw).catch(() => {})

  return {
    mesh,
    canvas: view,
    paint(buddy: BuddyState | null) {
      current = buddy
      draw()
    },
    dispose() {
      texture.dispose()
      material.dispose()
      mesh.geometry.dispose()
    },
  }
}

function matteLabel(texture: THREE.Texture) {
  return new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
}

function makeBackQr(text: string) {
  const qr = createQr(text, { errorCorrectionLevel: 'M' })
  const count = qr.modules.size
  const quiet = 4
  const cell = 16
  const size = (count + quiet * 2) * cell
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('qr')
  ctx.clearRect(0, 0, size, size)
  const radius = cell * 3.4
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, radius)
  ctx.clip()
  ctx.fillStyle = '#f4f1ea'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#14161c'
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.modules.get(row, col)) continue
      ctx.fillRect((col + quiet) * cell, (row + quiet) * cell, cell, cell)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  const material = matteLabel(texture)
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), material)
  return {
    mesh,
    dispose() {
      texture.dispose()
      material.dispose()
      mesh.geometry.dispose()
    },
  }
}

function makeBackAddress(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 4096
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('address')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const material = matteLabel(texture)
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(460, 36), material)
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const padX = 96
    const inner = canvas.width - padX * 2
    const face = '"Segoe UI", system-ui, sans-serif'
    let size = 140
    ctx.letterSpacing = '0px'
    ctx.font = `500 ${size}px ${face}`
    while (size > 56 && ctx.measureText(text).width > inner) {
      size -= 4
      ctx.font = `500 ${size}px ${face}`
    }
    const x = 36
    const y = 36
    const w = canvas.width - 72
    const h = canvas.height - 72
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = 28
    ctx.shadowOffsetY = 14
    ctx.fillStyle = '#f4f1ea'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 48)
    ctx.fill()
    ctx.restore()
    ctx.lineWidth = 10
    ctx.strokeStyle = '#2c261f'
    ctx.beginPath()
    ctx.roundRect(x + 8, y + 8, w - 16, h - 16, 40)
    ctx.stroke()
    ctx.fillStyle = '#1a1714'
    ctx.font = `500 ${size}px ${face}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    ctx.letterSpacing = '0px'
    texture.needsUpdate = true
  }
  draw()
  document.fonts?.ready.then(draw).catch(() => {})
  return {
    mesh,
    dispose() {
      texture.dispose()
      material.dispose()
      mesh.geometry.dispose()
    },
  }
}

function placeOnSide(mesh: THREE.Mesh, x: number, y: number, sideZ: number) {
  mesh.geometry.computeBoundingBox()
  const box = mesh.geometry.boundingBox
  const mid = box ? (box.min.z + box.max.z) / 2 : 0
  mesh.position.set(x, y, sideZ - mid)
}

function sidePlastic() {
  return withGrain(new THREE.MeshPhysicalMaterial({
    color: 0x07080c,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.06,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.22,
  }))
}

function blackPlastic() {
  return withGrain(new THREE.MeshPhysicalMaterial({
    color: 0x1a1c20,
    roughness: 0.46,
    metalness: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.38,
    envMapIntensity: 0.72,
  }))
}

type CaseUniforms = {
  uTime: { value: number }
  uTilt: { value: THREE.Vector2 }
  uRarity: { value: number }
  uReveal: { value: number }
  uFoil: { value: THREE.Color }
  uPhase: { value: number }
  uBand: { value: number }
  uChroma: { value: number }
  uGrid: { value: number }
}

// Finishes from the REEBOO Card FX free sample, used as light on the dark shell so they
// still read. Every rarity gets the real pattern at full strength. The seed sets the
// colours, the band angle, and the chroma phase.
// common: foil metal + shine sweep. uncommon: foil. rare: foil + holographic.
// legendary: foil + holographic + shine sweep.
const GRAIN_GLSL = /* glsl */ `
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

function withGrain<T extends THREE.Material>(mat: T) {
  const rough = mat.type !== 'MeshBasicMaterial'
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', 'varying vec3 vGrainPos;\n#include <common>')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvGrainPos = position;')
    let frag = shader.fragmentShader
      .replace('#include <common>', `${GRAIN_GLSL}\nvarying vec3 vGrainPos;\n#include <common>`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         float g = fineGrain(vGrainPos);
         diffuseColor.rgb *= mix(0.86, 1.08, g);`,
      )
    if (rough) {
      frag = frag.replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = clamp(roughnessFactor + (g - 0.5) * 0.2, 0.04, 1.0);`,
      )
    }
    shader.fragmentShader = frag
  }
  mat.customProgramCacheKey = () => (rough ? 'fine-grain-v1-phys' : 'fine-grain-v1-basic')
  return mat
}

const CASE_FX = /* glsl */ `
uniform float uTime;
uniform float uShift;
uniform vec2 uTilt;
uniform float uRarity;
uniform float uReveal;
uniform vec3 uFoil;
uniform float uPhase;
uniform float uBand;
uniform float uChroma;
uniform float uGrid;
varying vec3 vCasePos;
varying vec3 vCaseN;
vec3 caseGlow;

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

vec3 caseSrgb(vec3 c) {
  return pow(c, vec3(2.2));
}

float caseLuma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 caseRainbow(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

vec2 caseView(vec2 tilt) {
  float sy = sin(tilt.x);
  float cy = cos(tilt.x);
  float sp = sin(tilt.y);
  return vec2(sy, -sp * cy) / max(sin(radians(16.0)), 0.05);
}

vec2 caseRot(vec2 v) {
  float c = cos(uBand);
  float s = sin(uBand);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

float caseFoilField(vec2 p, vec2 view, float time) {
  float t = mod(time, 1000.0) * 0.25;
  vec2 tv = view;
  vec2 c = p - tv * 0.35;
  float ripple = sin(length(c) * 13.0 - t * 4.0) * smoothstep(0.0, 0.35, length(c));
  float ang = atan(c.y, c.x);
  float swirl = sin(ang * 3.0 + t * 1.5 + tv.x * 2.0) * 0.3;
  float b1 = sin(dot(p, caseRot(vec2(0.8, 0.6))) * 7.0 + tv.x * 4.0 + tv.y * 2.0 + t);
  float b2 = sin(dot(p, caseRot(vec2(-0.5, 0.86))) * 4.9 - tv.y * 3.0 - t * 0.7);
  return clamp(0.5 + 0.22 * ripple + 0.18 * swirl + 0.2 * b1 * b2, 0.0, 1.0);
}

vec3 caseApplyFoil(vec3 col, vec2 p, vec2 view, float time, float sharp) {
  float f = caseFoilField(p * 3.6, view, time);
  float shine = pow(max(f, 0.0), sharp);
  vec3 shineColor = caseSrgb(vec3(0.96, 0.98, 1.0));
  vec3 metal = mix(col, uFoil * 0.55, 0.32 + 0.22 * f);
  float crest = smoothstep(0.7, 0.94, f);
  metal += shineColor * shine * 0.42;
  metal += uFoil * crest * 0.32;
  caseGlow += shineColor * crest * 0.14;
  return metal;
}

float caseHairline(float coord) {
  float fw = max(fwidth(coord), 1.0e-4);
  float d = abs(fract(coord) - 0.5);
  float edge = max(fw * 1.7, 0.04);
  return smoothstep(0.5 - edge, 0.5 - edge * 0.2, d);
}

vec3 caseApplyHolo(vec3 col, vec2 p, vec2 view, float time) {
  vec2 dir = vec2(cos(uChroma), sin(uChroma));
  float t = mod(time, 1000.0) * 0.12;
  float along = dot(p, dir) * 1.6;
  float shift = view.x * 0.55 + view.y * 0.35;
  float along2 = dot(p, vec2(-dir.y, dir.x)) * 0.72;
  float idx = along + shift + t + uPhase + 0.18 * sin(along2 * 6.0 + shift * 2.0);
  vec3 rainbow = caseRainbow(idx);
  vec3 rb = mix(vec3(caseLuma(rainbow)), rainbow, 0.85);
  rb *= mix(vec3(1.0), uFoil, 0.38);
  vec2 g = p * uGrid;
  float lineA = caseHairline(g.x + g.y * 0.35 + shift * 1.4);
  float lineB = caseHairline(g.y - g.x * 0.35 - shift * 1.1);
  float grid = clamp(max(lineA, lineB), 0.0, 1.0);
  float flash = 0.78 + 0.22 * sin(idx * 3.14159 + 1.0);
  float bands = smoothstep(0.2, 0.88, sin(idx * 5.0) * 0.5 + 0.5);
  vec3 light = rb * (bands * 0.5 + grid * 0.22) * flash;
  caseGlow += light * 0.12;
  return col + light;
}

vec3 caseApplyShine(vec3 col, vec2 p, vec2 view, float time) {
  float along = dot(p, vec2(cos(uBand), sin(uBand)));
  float span = 0.845;
  float width = 0.12;
  float ph = mod(mod(time, 1000.0), 2.6) / 0.9;
  float pos = mix(-span - width * 3.0, span + width * 3.0, clamp(ph, 0.0, 1.0))
    + (view.x + view.y * 0.5) * 0.35;
  float bar = exp(-pow((along - pos) / width, 2.0));
  float bar2 = exp(-pow((along - pos + width * 2.6) / (width * 0.35), 2.0)) * 0.55;
  float sweepOn = step(ph, 1.0);
  vec3 shineColor = mix(caseSrgb(vec3(1.0, 0.98, 0.92)), uFoil, 0.35);
  vec3 streak = shineColor * (bar + bar2) * 1.05 * sweepOn;
  caseGlow += streak * 0.65;
  return col + streak;
}

vec3 caseApplyGlare(vec3 col, vec3 n, vec3 eye) {
  vec3 l = normalize(vec3(-0.45, 0.62, 1.0));
  vec3 rf = reflect(-l, n);
  float g = pow(max(dot(rf, eye), 0.0), 18.0);
  vec3 glare = caseSrgb(vec3(1.0, 0.97, 0.9)) * g * 0.8;
  caseGlow += glare * 0.35;
  return col + glare;
}
`

const PAGE_NAME_W = 2048
const PAGE_NAME_H = 780

function makePageName() {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_NAME_W
  canvas.height = PAGE_NAME_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('page name')
  const ink = ctx
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 8
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, PAGE_NAME_H / PAGE_NAME_W), mat)
  mesh.position.z = -720
  mesh.renderOrder = 1
  mesh.frustumCulled = false

  let label = ''
  let blurPx = 0
  function draw() {
    ink.clearRect(0, 0, PAGE_NAME_W, PAGE_NAME_H)
    const text = label.trim().toUpperCase()
    ink.filter = blurPx > 0.2 ? `blur(${blurPx.toFixed(2)}px)` : 'none'
    if (text) {
      let size = 640
      ink.fillStyle = '#ffffff'
      ink.textAlign = 'center'
      ink.textBaseline = 'middle'
      ink.font = `700 ${size}px Silkscreen, monospace`
      while (size > 72 && ink.measureText(text).width > PAGE_NAME_W * 0.96) {
        size -= 8
        ink.font = `700 ${size}px Silkscreen, monospace`
      }
      const cap = Math.floor(PAGE_NAME_H * 0.9)
      if (size > cap) {
        size = cap
        ink.font = `700 ${size}px Silkscreen, monospace`
      }
      ink.fillText(text, PAGE_NAME_W / 2, PAGE_NAME_H / 2)
    }
    ink.filter = 'none'
    texture.needsUpdate = true
  }

  document.fonts?.load('700 120px Silkscreen').then(draw).catch(() => {})

  return {
    mesh,
    mat,
    paint(name: string) {
      label = name
      draw()
    },
    setBlur(amount: number) {
      const next = Math.max(0, amount) * 28
      if (Math.abs(next - blurPx) < 0.4) return
      blurPx = next
      draw()
    },
    dispose() {
      texture.dispose()
      mat.dispose()
      mesh.geometry.dispose()
    },
  }
}

function makeSkinBackdrop(uniforms: CaseUniforms) {
  const base = new THREE.Color(0x141414)
  const aspect = { value: 1 }
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uTilt: uniforms.uTilt,
      uRarity: uniforms.uRarity,
      uReveal: uniforms.uReveal,
      uFoil: uniforms.uFoil,
      uPhase: uniforms.uPhase,
      uBand: uniforms.uBand,
      uChroma: uniforms.uChroma,
      uGrid: uniforms.uGrid,
      uShift: { value: 0 },
      uBase: { value: base },
      uAspect: aspect,
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    premultipliedAlpha: true,
    toneMapped: true,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vCasePos;
      varying vec3 vCaseN;
      void main() {
        vUv = uv;
        vCasePos = vec3(uv, 0.0);
        vCaseN = vec3(0.0, 0.0, 1.0);
        gl_Position = vec4(position.xy, 0.999, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${CASE_FX}
      uniform vec3 uBase;
      uniform float uAspect;
      varying vec2 vUv;

      vec3 skinAt(vec2 uv) {
        vec2 caseP = (uv - vec2(0.5, 0.56)) * 0.82 * vec2(uAspect, 1.0);
        vec2 caseV = vec2(0.0);
        caseGlow = vec3(0.0);
        vec3 col = mix(uBase * 0.62, mix(uBase, uFoil, 0.7), 0.8);
        if (uRarity > 2.5) {
          col = caseApplyFoil(col, caseP, caseV, uTime, 2.2);
          col = caseApplyHolo(col, caseP, caseV, uTime);
        } else if (uRarity > 1.5) {
          col = caseApplyFoil(col, caseP, caseV, uTime, 3.2);
          col = caseApplyHolo(col, caseP, caseV, uTime);
        } else if (uRarity > 0.5) {
          col = caseApplyFoil(col, caseP, caseV, uTime, 3.2);
        } else {
          col = caseApplyFoil(col, caseP, caseV, uTime, 1.6);
        }
        col += caseGlow * 0.42;
        return col;
      }

      void main() {
        float show = step(0.0, uRarity) * clamp(uReveal, 0.0, 1.0);
        vec3 sharp = skinAt(vUv);
        vec2 o = vec2(0.05 / max(uAspect, 0.2), 0.05);
        vec3 blur = sharp;
        blur += skinAt(vUv + vec2(o.x, 0.0));
        blur += skinAt(vUv + vec2(-o.x, 0.0));
        blur += skinAt(vUv + vec2(0.0, o.y));
        blur += skinAt(vUv + vec2(0.0, -o.y));
        blur += skinAt(vUv + o * 0.55);
        blur += skinAt(vUv + vec2(-o.x, o.y) * 0.55);
        blur += skinAt(vUv + vec2(o.x, -o.y) * 0.55);
        blur += skinAt(vUv - o * 0.55);
        blur /= 9.0;
        vec3 col = mix(sharp, blur, 0.72) * 0.78;
        col *= mix(0.96, 1.02, fineGrain(vec3(vUv.x * uAspect * 700.0, vUv.y * 700.0, 4.0)));
        gl_FragColor = vec4(col, show);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <premultiplied_alpha_fragment>
      }
    `,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
  mesh.frustumCulled = false
  mesh.renderOrder = -1
  mesh.castShadow = false
  mesh.receiveShadow = false
  return { mesh, base, aspect }
}

function caseMaterial(
  uniforms: CaseUniforms,
  shiftY: number,
  pocket: { map: THREE.Texture; floor: { value: number }; on: boolean },
) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x2a3140,
    roughness: 0.32,
    metalness: 0.04,
    clearcoat: 0.42,
    clearcoatRoughness: 0.28,
    envMapIntensity: 1.05,
  })
  const shift = { value: shiftY }
  const pocketOn = { value: pocket.on ? 1 : 0 }
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.uniforms.uTilt = uniforms.uTilt
    shader.uniforms.uRarity = uniforms.uRarity
    shader.uniforms.uReveal = uniforms.uReveal
    shader.uniforms.uFoil = uniforms.uFoil
    shader.uniforms.uPhase = uniforms.uPhase
    shader.uniforms.uBand = uniforms.uBand
    shader.uniforms.uChroma = uniforms.uChroma
    shader.uniforms.uGrid = uniforms.uGrid
    shader.uniforms.uShift = shift
    shader.uniforms.uPocketMap = { value: pocket.map }
    shader.uniforms.uPocketFloor = pocket.floor
    shader.uniforms.uPocketOn = pocketOn
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', 'varying vec3 vCasePos;\nvarying vec3 vCaseN;\n#include <common>')
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvCasePos = position;\nvCaseN = normalize(normal);',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `${CASE_FX}
         uniform sampler2D uPocketMap;
         uniform float uPocketFloor;
         uniform float uPocketOn;
         #include <common>`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         if (uPocketOn > 0.5) {
           vec2 pUv = vec2(vCasePos.x / ${BODY.w.toFixed(1)} + 0.5, vCasePos.y / ${BODY.h.toFixed(1)} + 0.5);
           if (texture2D(uPocketMap, pUv).a > 0.4 && vCasePos.z > uPocketFloor) discard;
         }
         caseGlow = vec3(0.0);
         vec3 caseN = normalize(vNormal);
         vec3 caseEye = normalize(vViewPosition);
         vec2 caseP = vec2(vCasePos.x, vCasePos.y + uShift) / 1020.0;
         vec2 caseV = caseView(uTilt);
         vec3 caseCol = diffuseColor.rgb;
         if (uRarity >= 0.0) {
           caseCol = caseApplyGlare(caseCol, caseN, caseEye);
           if (uRarity > 2.5) {
             caseCol = caseApplyFoil(caseCol, caseP, caseV, uTime, 2.4);
             caseCol = caseApplyHolo(caseCol, caseP, caseV, uTime);
             caseCol = caseApplyShine(caseCol, caseP, caseV, uTime);
           } else if (uRarity > 1.5) {
             caseCol = caseApplyFoil(caseCol, caseP, caseV, uTime, 4.0);
             caseCol = caseApplyHolo(caseCol, caseP, caseV, uTime);
           } else if (uRarity > 0.5) {
             caseCol = caseApplyFoil(caseCol, caseP, caseV, uTime, 4.0);
           } else {
             caseCol = caseApplyFoil(caseCol, caseP, caseV, uTime, 1.4);
             caseCol = caseApplyShine(caseCol, caseP, caseV, uTime);
           }
           float caseFace = smoothstep(0.2, 0.82, abs(vCaseN.z));
           caseCol = mix(diffuseColor.rgb, caseCol, caseFace);
           caseGlow *= caseFace;
         }
         caseCol = mix(diffuseColor.rgb, caseCol, clamp(uReveal, 0.0, 1.0));
         caseGlow *= clamp(uReveal, 0.0, 1.0);
         caseCol *= mix(0.86, 1.08, fineGrain(vCasePos));
         diffuseColor.rgb = caseCol;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         totalEmissiveRadiance += caseGlow;`,
      )
  }
  mat.customProgramCacheKey = () => `reeboo-case-v26-${shiftY}-${pocket.on ? 1 : 0}`
  return mat
}

function pocketCoverMaterial(map: THREE.Texture, floor: { value: number }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPocketMap: { value: map },
      uPocketFloor: floor,
    },
    vertexShader: /* glsl */ `
      varying vec3 vCasePos;
      void main() {
        vCasePos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uPocketMap;
      uniform float uPocketFloor;
      varying vec3 vCasePos;
      void main() {
        vec2 pUv = vec2(vCasePos.x / ${BODY.w.toFixed(1)} + 0.5, vCasePos.y / ${BODY.h.toFixed(1)} + 0.5);
        if (texture2D(uPocketMap, pUv).a > 0.4 && vCasePos.z > uPocketFloor) discard;
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    `,
  })
}

function buttonPlastic() {
  return withGrain(new THREE.MeshPhysicalMaterial({
    color: 0x10131a,
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.36,
    clearcoatRoughness: 0.46,
    envMapIntensity: 0.42,
    reflectivity: 0.34,
  }))
}

function productEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene()
  scene.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(14, 10, 14),
      new THREE.MeshBasicMaterial({ color: 0x10141a, side: THREE.BackSide }),
    ),
  )
  const soft = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), new THREE.MeshBasicMaterial({ color: 0xf4f6fa }))
  soft.position.set(-1.4, 2.6, 4.2)
  soft.lookAt(0, 0.2, 0)
  scene.add(soft)
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6), new THREE.MeshBasicMaterial({ color: 0x9aabbf }))
  edge.position.set(4.2, 0.4, 1.2)
  edge.lookAt(0, 0, 0)
  scene.add(edge)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(scene, 0.18).texture
  pmrem.dispose()
  return env
}

function roundedRect(w: number, h: number, r: number) {
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

function roundedBox(w: number, h: number, d: number, r: number) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
    depth: d,
    bevelEnabled: true,
    bevelThickness: Math.min(10, d * 0.2),
    bevelSize: Math.min(10, r * 0.2),
    bevelSegments: 8,
    curveSegments: 12,
  })
  geo.translate(0, 0, -d)
  geo.computeVertexNormals()
  return geo
}

function whiteMark(geo: THREE.BufferGeometry, z: number) {
  geo.computeBoundingBox()
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }))
  mesh.position.z = z - (geo.boundingBox?.min.z ?? 0)
  mesh.castShadow = false
  mesh.receiveShadow = false
  return mesh
}

function ringFrame(outer: number, stroke: number) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outer / 2, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, outer / 2 - stroke, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false, curveSegments: 48 })
}

function squareFrame(outer: number, stroke: number) {
  const s = outer / 2
  const h = s - stroke
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
  return new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false })
}

function buttonMarks(key: MachineKey, z: number) {
  if (key === 'pet') {
    const arm = new THREE.BoxGeometry(40, 5.2, 1.4)
    const a = whiteMark(arm, z)
    const b = whiteMark(arm, z)
    a.rotation.z = Math.PI / 4
    b.rotation.z = -Math.PI / 4
    return [a, b]
  }
  if (key === 'feed') return [whiteMark(ringFrame(30, 4.6), z)]
  return [whiteMark(squareFrame(30, 4.6), z)]
}

function makeKey(key: MachineKey, label: string, x: number, y: number): Keypad {
  const group = new THREE.Group()
  group.position.set(x, y, 16)
  group.userData.key = key

  const seat = new THREE.Mesh(
    new THREE.CircleGeometry(48, 48),
    withGrain(new THREE.MeshStandardMaterial({ color: 0x05060a, roughness: 0.92, metalness: 0 })),
  )
  seat.position.z = -4
  group.add(seat)

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(46, 48, 6, 48), buttonPlastic())
  barrel.castShadow = true
  barrel.rotation.x = Math.PI / 2
  group.add(barrel)

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 10, 48), buttonPlastic())
  pad.castShadow = true
  pad.rotation.x = Math.PI / 2
  pad.position.z = 6
  group.add(pad)

  for (const mesh of buttonMarks(key, 11.05)) group.add(mesh)

  const word = makeLabel(label, 96, 26, '#f4f1ea', 15)
  word.position.set(0, -78, 0)
  group.add(word)
  return { group, goal: 0, pressed: 0 }
}

function smoothLegendTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.anisotropy = 8
  tex.generateMipmaps = true
  return tex
}

function paintLegend(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  align: 'left' | 'center',
) {
  const label = text.toUpperCase()
  ctx.imageSmoothingEnabled = true
  ctx.font = `${size}px Silkscreen, monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '0px'
  const measured = ctx.measureText(label).width
  const padX = Math.round(size * 0.34)
  const padY = Math.round(size * 0.2)
  const bw = Math.round(measured + padX * 2)
  const bh = Math.round(size + padY * 2)
  const left = Math.round(align === 'center' ? x - bw / 2 : x)
  const top = Math.round(y - bh / 2)
  ctx.fillStyle = '#0b0d12'
  ctx.beginPath()
  ctx.roundRect(left, top, bw, bh, Math.max(3, Math.round(size * 0.14)))
  ctx.fill()
  ctx.fillStyle = '#f4f1ea'
  ctx.fillText(label, align === 'center' ? Math.round(x) : left + padX, Math.round(y))
}

function makeLabel(text: string, w: number, h: number, _color: string, size: number) {
  const scale = 4
  const canvas = document.createElement('canvas')
  canvas.width = w * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')!
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    paintLegend(ctx, text, canvas.width / 2, canvas.height / 2, size * scale, 'center')
    tex.needsUpdate = true
  }
  const tex = smoothLegendTexture(canvas)
  draw()
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    withGrain(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })),
  )
  void document.fonts.ready.then(draw)
  return mesh
}

function makeReadout() {
  const scale = 4
  const canvas = document.createElement('canvas')
  canvas.width = 440 * scale
  canvas.height = 300 * scale
  const texture = smoothLegendTexture(canvas)
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 150),
    withGrain(new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })),
  )

  function draw() {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const lines = ['MOOD', 'ENERGY', 'HUNGER']
    lines.forEach((line, index) =>
      paintLegend(ctx, line, 12 * scale, (50 + index * 100) * scale, 22 * scale, 'left'),
    )
    texture.needsUpdate = true
  }

  function paint(_buddy: BuddyState | null) {
    draw()
  }
  paint(null)
  void document.fonts.ready.then(() => paint(null))
  return { mesh, paint }
}

function makeLed() {
  const group = new THREE.Group()
  const bezel = new THREE.Mesh(
    new THREE.RingGeometry(4.2, 7.4, 32),
    blackPlastic(),
  )
  const well = new THREE.Mesh(
    new THREE.CircleGeometry(5.4, 28),
    withGrain(new THREE.MeshStandardMaterial({ color: 0x050806, roughness: 0.9 })),
  )
  well.position.z = -2.6
  const lamp = new THREE.Mesh(
    new THREE.CircleGeometry(3.5, 28),
    new THREE.MeshStandardMaterial({
      color: 0x0c281c,
      emissive: 0x5ee6a4,
      emissiveIntensity: 1.05,
      roughness: 0.4,
    }),
  )
  lamp.position.z = -1.2
  group.add(well, lamp, bezel)
  return { group, lamp }
}

const ICON_SCALE = 1.16
const CUT_PITCH = 32 * 0.86 * ICON_SCALE + 6

function makeHeartCuts() {
  const scale = 0.86 * ICON_SCALE
  const pts = heartPoints(scale)
  return makeCutRow(new THREE.ShapeGeometry(new THREE.Shape(pts)), pts)
}

function makeEnergyCuts() {
  const pts = BOLT_OUTER.map(([x, y]) => new THREE.Vector2(x * ICON_SCALE, y * ICON_SCALE))
  return makeCutRow(iconFace(BOLT_OUTER, ICON_SCALE), pts)
}

function makeHungerCuts() {
  const pts = FISH_OUTER.map(([x, y]) => new THREE.Vector2(x * ICON_SCALE, y * ICON_SCALE))
  return makeCutRow(iconFace(FISH_OUTER, ICON_SCALE), pts)
}

function iconFace(outer: [number, number][], scale: number) {
  return new THREE.ShapeGeometry(
    new THREE.Shape(outer.map(([x, y]) => new THREE.Vector2(x * scale, y * scale))),
  )
}

function makeCutRow(faceGeo: THREE.BufferGeometry, outline: THREE.Vector2[]) {
  faceGeo.computeBoundingBox()
  const lipFront = faceGeo.boundingBox?.max.z ?? 0
  const box = faceGeo.boundingBox
  const midX = box ? ((box.min.x + box.max.x) / 2) * 1.06 : 0
  const midY = box ? ((box.min.y + box.max.y) / 2) * 1.06 : 0
  const icon = box ? Math.max(box.max.x - box.min.x, box.max.y - box.min.y) * 1.06 : 28
  const glowMap = iconGlowTexture(outline)
  const glowSize = icon * (256 / 148)
  const group = new THREE.Group()
  const lamps: {
    mat: THREE.MeshStandardMaterial
    light: THREE.PointLight
    glow: THREE.Mesh
    face: THREE.Mesh
    on: number
  }[] = []
  for (let i = 0; i < 5; i++) {
    const cut = new THREE.Group()
    cut.position.x = i * CUT_PITCH
    const mat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffffff,
      emissiveIntensity: 0,
      roughness: 0.72,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
    const face = new THREE.Mesh(faceGeo, mat)
    face.position.z = 0.05
    face.scale.set(1.06, 1.06, 1)
    face.castShadow = false
    face.receiveShadow = false
    const light = new THREE.PointLight(0xffffff, 0, 18, 2)
    light.position.set(midX, midY, 0.2)
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(glowSize, glowSize),
      new THREE.MeshBasicMaterial({
        map: glowMap,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        opacity: 0,
        toneMapped: false,
      }),
    )
    glow.layers.enable(BLOOM_LAYER)
    glow.position.set(midX, midY, 0.35)
    cut.add(face, light, glow)
    group.add(cut)
    lamps.push({ mat, light, glow, face, on: 0 })
  }

  function setLevel(amount: number) {
    const level = clamp(amount, 0, 1) * lamps.length
    lamps.forEach((lamp, index) => {
      lamp.on = clamp(level - index, 0, 1)
    })
  }

  function sweep(progress: number) {
    const last = lamps.length - 1
    const fade = 1.05
    const filling = progress <= 1
    const u = filling ? progress : progress - 1
    const lead = (filling ? u : 1 - u) * (1 + fade)
    lamps.forEach((lamp, index) => {
      const pos = index / last
      lamp.on = THREE.MathUtils.smoothstep((lead - pos) / fade, 0, 1)
    })
  }

  function pulse(t: number) {
    const glow = 0.82 + Math.sin(t * 2.4) * 0.18
    for (const lamp of lamps) {
      const amount = lamp.on * glow
      lamp.mat.emissiveIntensity = amount * 1.15
      lamp.light.intensity = amount * 0.16
      const halo = lamp.glow.material as THREE.MeshBasicMaterial
      halo.opacity = amount * 0.22
      lamp.face.scale.set(1.06, 1.06, 1)
    }
  }

  function idleBeat(t: number) {
    const beat = (0.5 - 0.5 * Math.cos(t * 1.05)) * 0.42
    const lamp = lamps[0]
    lamp.mat.emissiveIntensity = beat * 1.15
    lamp.light.intensity = beat * 0.16
    const halo = lamp.glow.material as THREE.MeshBasicMaterial
    halo.opacity = beat * 0.22
    const s = 1.06 * (1 + beat * 0.08)
    lamp.face.scale.set(s, s, 1)
  }

  return { group, setLevel, sweep, pulse, idleBeat, lipFront }
}

const BOLT_OUTER: [number, number][] = [
  [-5, 13],
  [7, 13],
  [1, 2.2],
  [8, 2.2],
  [-3, -13],
  [2.4, -1.2],
  [-6.5, -1.2],
]

const FISH_OUTER: [number, number][] = [
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

function iconGlowTexture(pts: THREE.Vector2[]) {
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const fit = 148 / Math.max(maxX - minX, maxY - minY, 1)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const path = () => {
    ctx.beginPath()
    pts.forEach((p, i) => {
      const x = size / 2 + (p.x - cx) * fit
      const y = size / 2 - (p.y - cy) * fit
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
  }
  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.filter = 'blur(18px)'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  path()
  ctx.fill()
  ctx.filter = 'blur(7px)'
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  path()
  ctx.fill()
  ctx.restore()
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function heartPoints(scale: number) {
  const pts: THREE.Vector2[] = []
  const steps = 56
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = Math.sin(t) ** 3 * 16 * scale
    const y =
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5) * scale
    pts.push(new THREE.Vector2(x, y))
  }
  return pts
}

function iconPocketTexture() {
  const canvas = document.createElement('canvas')
  const px = 4
  canvas.width = BODY.w * px
  canvas.height = BODY.h * px
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('pocket')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  const toX = (x: number) => (x / BODY.w + 0.5) * canvas.width
  const toY = (y: number) => (0.5 - y / BODY.h) * canvas.height
  const paint = (ox: number, oy: number, pts: { x: number; y: number }[]) => {
    ctx.beginPath()
    pts.forEach((p, i) => {
      const x = toX(ox + p.x)
      const y = toY(oy + p.y)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fill()
  }
  const rows: { y: number; pts: { x: number; y: number }[] }[] = [
    {
      y: READ_Y + 32,
      pts: heartPoints(0.86 * ICON_SCALE).map((p) => ({ x: p.x, y: p.y })),
    },
    {
      y: READ_Y - 18,
      pts: BOLT_OUTER.map(([x, y]) => ({ x: x * ICON_SCALE, y: y * ICON_SCALE })),
    },
    {
      y: READ_Y - 68,
      pts: FISH_OUTER.map(([x, y]) => ({ x: x * ICON_SCALE, y: y * ICON_SCALE })),
    },
  ]
  for (const row of rows) {
    for (let i = 0; i < 5; i++) paint(50 + i * CUT_PITCH, row.y, row.pts)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.NoColorSpace
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

function springTo(value: number, velocity: number, goal: number, dt: number): [number, number] {
  const omega = 6.2
  const zeta = 0.55
  const offset = value - goal
  const accel = -omega * omega * offset - 2 * zeta * omega * velocity
  const nextVelocity = velocity + accel * dt
  return [value + nextVelocity * dt, nextVelocity]
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
