import type { Vec } from './types'
import { clamp } from './random'

export const WORLD = {
  bounds: { minX: -1.5, maxX: 1.5, minZ: -1.2, maxZ: 1.15 },
  cushion: [-0.04, 0, -0.64] as Vec,
  window: [-1.08, 0, -0.08] as Vec,
  bowl: [0.02, 0, 0.97] as Vec,
  cup: [0.92, 0, 0.9] as Vec,
  cupStand: [0.62, 0, 0.62] as Vec,
  greet: [0.02, 0, 0.22] as Vec,
  plant: [-0.18, 0, -0.02] as Vec,
}

// 2:1 isometric on the 16:9 room. Screen x grows with world x and shrinks with z.
// Screen y grows with both, so the back of the room sits higher.
// KY/KX = 8/9 so a 16:9 stage has pixel slope 1/2 (26.565°).
const OX = 49.695093457943926
const OY = 52.271028037383175
const KX = 12.196261682242989
const KY = 10.841121495327101

export function toStage(x: number, z: number) {
  const { minZ, maxZ } = WORLD.bounds
  const nz = (z - minZ) / (maxZ - minZ)
  return {
    left: OX + (x - z) * KX,
    top: OY + (x + z) * KY,
    scale: 0.9 + nz * 0.16,
  }
}

export function fromStage(left: number, top: number): Vec | null {
  const { minX, maxX, minZ, maxZ } = WORLD.bounds
  const a = (left - OX) / KX
  const b = (top - OY) / KY
  const x = (a + b) / 2
  const z = (b - a) / 2
  // toStage's corners land a few ulps outside the bounds; keep the diamond closed.
  const eps = 1e-6
  if (x < minX - eps || x > maxX + eps || z < minZ - eps || z > maxZ + eps) return null
  return [clamp(x, minX, maxX), 0, clamp(z, minZ, maxZ)]
}
