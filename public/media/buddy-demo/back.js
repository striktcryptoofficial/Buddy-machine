// Demo-only back plates. Not used by the real machine.
import { gildedMaterial, updateGildedView } from "./foil.js?v=20";
const DEMO_WALLET = "0xDE3000000000000000000000000000000000DE30"
const CARD_SANS = '"Segoe UI", system-ui, sans-serif'
const CARD_SERIF = 'Georgia, "Palatino Linotype", "Times New Roman", serif'
const CARD_TITLE = '"PixelOperator", ui-monospace, monospace'
const CARD_INK = "#f4efe6"
const CARD_STONE = "#d2c8bb"
const CARD_MUTE = "#9a9186"

function mixHex(a, b, t) {
  const parse = (hex) => {
    const n = Number.parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  const channel = (from, to) => Math.round(from + (to - from) * t).toString(16).padStart(2, "0")
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`
}
const QR_ROWS = [
  "111111101010001111111",
  "100000100011101000001",
  "101110101111101011101",
  "101110100010101011101",
  "101110100100101011101",
  "100000101000001000001",
  "111111101010101111111",
  "000000000101000000000",
  "101000110111100100101",
  "000010001010000001010",
  "001101111000011111100",
  "110111011110100100100",
  "100010101100011111011",
  "000000001001000011101",
  "111111101101111010111",
  "100000100101000001111",
  "101110100111111010101",
  "101110100010010010000",
  "101110101010011011111",
  "100000100000100000101",
  "111111101110011010111",
]

function labelMaterial(THREE, texture) {
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

function canvasTexture(THREE, canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function demoQrMesh(THREE) {
  const count = QR_ROWS.length
  const quiet = 2
  const cell = 16
  const size = (count + quiet * 2) * cell
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  const radius = cell * 3.4
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, radius)
  ctx.clip()
  ctx.fillStyle = "#f4f1ea"
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = "#14161c"
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (QR_ROWS[row][col] !== "1") continue
      ctx.fillRect((col + quiet) * cell, (row + quiet) * cell, cell, cell)
    }
  }
  const texture = canvasTexture(THREE, canvas)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return new THREE.Mesh(new THREE.PlaneGeometry(300, 300), labelMaterial(THREE, texture))
}

function demoWalletMesh(THREE) {
  const canvas = document.createElement("canvas")
  canvas.width = 4096
  canvas.height = 320
  const ctx = canvas.getContext("2d")
  const face = CARD_SANS
  const padX = 96
  const inner = canvas.width - padX * 2
  let size = 140
  ctx.letterSpacing = "0px"
  ctx.font = `500 ${size}px ${face}`
  while (size > 56 && ctx.measureText(DEMO_WALLET).width > inner) {
    size -= 4
    ctx.font = `500 ${size}px ${face}`
  }
  const x = 36
  const y = 36
  const w = canvas.width - 72
  const h = canvas.height - 72
  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.45)"
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 14
  ctx.fillStyle = "#f4f1ea"
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 48)
  ctx.fill()
  ctx.restore()
  ctx.lineWidth = 10
  ctx.strokeStyle = "#2c261f"
  ctx.beginPath()
  ctx.roundRect(x + 8, y + 8, w - 16, h - 16, 40)
  ctx.stroke()
  ctx.fillStyle = "#1a1714"
  ctx.font = `500 ${size}px ${face}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(DEMO_WALLET, canvas.width / 2, canvas.height / 2)
  ctx.letterSpacing = "0px"
  const texture = canvasTexture(THREE, canvas)
  texture.anisotropy = 8
  return new THREE.Mesh(new THREE.PlaneGeometry(460, 36), labelMaterial(THREE, texture))
}

function demoRarityMesh(THREE) {
  const canvas = document.createElement("canvas")
  canvas.width = 752
  canvas.height = 1072
  const ink = document.createElement("canvas")
  ink.width = canvas.width
  ink.height = canvas.height
  let pen = canvas.getContext("2d")
  const plate = { x: 28, y: 28, w: canvas.width - 56, h: canvas.height - 56, r: 36 }
  const foil = "#e4e9f2"
  const accent = "#d7c8ff"
  const ground = "#7a45d4"
  const tier = 3
  const name = "Pebble"
  const cx = canvas.width / 2
  const strokePlate = (inset, color, width) => {
    pen.beginPath()
    pen.roundRect(plate.x + inset, plate.y + inset, plate.w - inset * 2, plate.h - inset * 2, Math.max(8, plate.r - inset))
    pen.strokeStyle = color
    pen.lineWidth = width
    pen.stroke()
  }
  const corners = (inset, len, color) => {
    const x = plate.x + inset
    const y = plate.y + inset
    const w = plate.w - inset * 2
    const h = plate.h - inset * 2
    pen.strokeStyle = color
    pen.lineWidth = 3
    pen.lineCap = "square"
    const marks = [
      [x, y, 1, 1],
      [x + w, y, -1, 1],
      [x, y + h, 1, -1],
      [x + w, y + h, -1, -1],
    ]
    for (const [mx, my, dx, dy] of marks) {
      pen.beginPath()
      pen.moveTo(mx, my + dy * len)
      pen.lineTo(mx, my)
      pen.lineTo(mx + dx * len, my)
      pen.stroke()
    }
  }
  const paint = () => {
  pen.clearRect(0, 0, canvas.width, canvas.height)
  pen.textAlign = "center"
  pen.textBaseline = "middle"
  pen.save()
  pen.shadowColor = "rgba(0,0,0,0.5)"
  pen.shadowBlur = 22
  pen.shadowOffsetY = 12
  pen.beginPath()
  pen.roundRect(plate.x, plate.y, plate.w, plate.h, plate.r)
  const paper = pen.createLinearGradient(0, plate.y, 0, plate.y + plate.h)
  paper.addColorStop(0, "#9a6ef0")
  paper.addColorStop(0.42, ground)
  paper.addColorStop(1, "#542a9c")
  pen.fillStyle = paper
  pen.fill()
  pen.restore()
  pen.save()
  pen.beginPath()
  pen.roundRect(plate.x, plate.y, plate.w, plate.h, plate.r)
  pen.clip()
  const wash = pen.createRadialGradient(cx, 520, 20, cx, 520, 420)
  wash.addColorStop(0, "#9aa6ff")
  wash.addColorStop(1, "rgba(0,0,0,0)")
  pen.globalAlpha = 0.1
  pen.fillStyle = wash
  pen.fillRect(plate.x, plate.y, plate.w, plate.h)
  pen.restore()
  pen.save()
  pen.shadowColor = "transparent"
  pen.shadowBlur = 0
  const metal = pen.createLinearGradient(plate.x, plate.y, plate.x + plate.w, plate.y + plate.h)
  metal.addColorStop(0, "#dfe3e8")
  metal.addColorStop(0.5, "#8d95a1")
  metal.addColorStop(1, "#c8ced6")
  pen.beginPath()
  pen.roundRect(plate.x + 12, plate.y + 12, plate.w - 24, plate.h - 24, Math.max(8, plate.r - 12))
  pen.strokeStyle = metal
  pen.lineWidth = 22
  pen.stroke()
  pen.restore()
  strokePlate(16, "#d5dae1", 2)
  strokePlate(22, "#9aa3ae", 1.5)
  corners(34, 54, "#c5cad2")
  pen = ink.getContext("2d")
  pen.clearRect(0, 0, ink.width, ink.height)
  pen.textAlign = "center"
  pen.textBaseline = "middle"
  pen.shadowColor = "#07080c"
  pen.shadowBlur = 4
  pen.strokeStyle = mixHex(foil, "#ffffff", 0.35)
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
  const markX = plate.x + plate.w - 62
  const markY = plate.y + 52
  pen.fillStyle = foil
  pen.beginPath()
  pen.roundRect(markX, markY, 18, 18, 3)
  pen.fill()
  pen.fillStyle = ground
  pen.beginPath()
  pen.roundRect(markX + 6, markY + 6, 6, 6, 1)
  pen.fill()
  const write = (text, y, font, color, spacing) => {
    pen.font = font
    pen.fillStyle = color
    pen.letterSpacing = spacing
    pen.fillText(text, cx, y)
    pen.letterSpacing = "0px"
  }
  const diamond = (x, y, rx, ry) => {
    pen.beginPath()
    pen.moveTo(x, y - ry)
    pen.lineTo(x + rx, y)
    pen.lineTo(x, y + ry)
    pen.lineTo(x - rx, y)
    pen.closePath()
  }
  const ornament = (y, half) => {
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
  const sealY = 478
  const sealW = 360
  const sealH = 64
  pen.save()
  pen.shadowColor = "transparent"
  pen.shadowBlur = 0
  pen.beginPath()
  pen.roundRect(cx - sealW / 2, sealY - sealH / 2, sealW, sealH, 18)
  pen.fillStyle = "#ffffff"
  pen.fill()
  pen.restore()
  write("LIFE CERTIFICATE", 108, `600 20px ${CARD_SANS}`, CARD_MUTE, "0.18em")
  write("BUDDY", 150, `600 26px ${CARD_SANS}`, CARD_INK, "0.2em")
  ornament(184, 150)
  let raritySize = 54
  pen.letterSpacing = "0.12em"
  pen.font = `600 ${raritySize}px ${CARD_SANS}`
  while (raritySize > 34 && pen.measureText("LEGENDARY").width > 600) {
    raritySize -= 2
    pen.font = `600 ${raritySize}px ${CARD_SANS}`
  }
  write("LEGENDARY", 252, `600 ${raritySize}px ${CARD_SANS}`, foil, "0.12em")
  write("01 NOV 2026", 312, `500 20px ${CARD_SANS}`, "#ffffff", "0.14em")
  const pipY = 356
  for (let i = 0; i < 4; i++) {
    const px = cx + (i - 1.5) * 26
    diamond(px, pipY, 8, 9)
    if (i <= tier) {
      pen.fillStyle = foil
      pen.fill()
    } else {
      pen.strokeStyle = mixHex(foil, CARD_MUTE, 0.45)
      pen.lineWidth = 1.5
      pen.stroke()
    }
  }
  pen.save()
  pen.shadowColor = "transparent"
  pen.shadowBlur = 0
  write(name, sealY, `400 56px ${CARD_TITLE}`, "#111111", "0.04em")
  pen.restore()
  write("Tabby", 590, `italic 400 30px ${CARD_SERIF}`, "#ffffff", "0.02em")
  write("STRIPED", 626, `600 16px ${CARD_SANS}`, "#ffffff", "0.16em")
  const chips = ["#c9845a", "#8a5a3c", "#f7efe4", "#3d6b4f", accent]
  const chip = 26
  const chipGap = 16
  let chipX = cx - (chips.length * chip + (chips.length - 1) * chipGap) / 2
  pen.save()
  pen.shadowColor = "transparent"
  pen.shadowBlur = 0
  for (const color of chips) {
    pen.beginPath()
    pen.arc(chipX + chip / 2, 668, chip / 2, 0, Math.PI * 2)
    pen.fillStyle = color
    pen.fill()
    chipX += chip + chipGap
  }
  pen.restore()
  ornament(710, 220)
  write("SERIAL", 748, `600 16px ${CARD_SANS}`, "#ffffff", "0.18em")
  write("DEMO 0001", 788, `500 28px ${CARD_SANS}`, CARD_INK, "0.1em")
  }
  paint()
  const groundTex = canvasTexture(THREE, canvas)
  const inkTex = canvasTexture(THREE, ink)
  const material = gildedMaterial(THREE, groundTex, inkTex, plate, { x: canvas.width, y: canvas.height })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(188, 268), material)
  mesh.onBeforeRender = (_renderer, scene) => updateGildedView(mesh, scene, material)
  document.fonts?.load?.("400 56px PixelOperator").then(() => {
    paint()
    groundTex.needsUpdate = true
    inkTex.needsUpdate = true
  })
  return mesh
}

export function addDemoBack(THREE, device, shell, mode) {
  shell.geometry.computeBoundingBox()
  const box = shell.geometry.boundingBox
  const backZ = (box ? box.min.z : -78) - 0.8
  const qr = demoQrMesh(THREE)
  qr.position.set(0, 200, backZ)
  qr.rotation.y = Math.PI
  const sticker = demoRarityMesh(THREE)
  sticker.name = "demo-sticker"
  sticker.position.set(0, -250, backZ)
  sticker.rotation.y = Math.PI
  const wallet = demoWalletMesh(THREE)
  wallet.position.set(0, -432, backZ)
  wallet.rotation.y = Math.PI
  device.add(wallet)
  if (mode === "wallet") return
  device.add(qr, sticker)
}
