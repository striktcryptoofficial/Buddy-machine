export type HolderTier = 'none' | 'jar' | 'stocked' | 'pantry' | 'beyond'

export interface HolderPerks {
  tier: HolderTier
  feedFill: number
  crystalBonus: number
  refillRate: number
  extraLines: number
  mark: number
}

export const HOLDER_STEPS = { jar: 1, stocked: 4, pantry: 16 }

const BEYOND_RATIO = HOLDER_STEPS.pantry * 2

function nonePerks(): HolderPerks {
  return {
    tier: 'none',
    feedFill: 0,
    crystalBonus: 0,
    refillRate: 1,
    extraLines: 0,
    mark: 0,
  }
}

export function holderPerks(averageBalance: number, seasonUnit: number): HolderPerks {
  if (averageBalance <= 0) return nonePerks()

  const unit = seasonUnit > 0 ? seasonUnit : 1
  const ratio = averageBalance / unit
  if (ratio < 1) return nonePerks()

  const steps = Math.log2(Math.max(ratio, 1))
  const tier: HolderTier =
    ratio >= BEYOND_RATIO
      ? 'beyond'
      : ratio >= HOLDER_STEPS.pantry
        ? 'pantry'
        : ratio >= HOLDER_STEPS.stocked
          ? 'stocked'
          : 'jar'

  return {
    tier,
    feedFill: Math.min(0.45, 0.06 * steps),
    crystalBonus: Math.min(40, Math.round(2 * steps)),
    refillRate: Math.min(1.5, 1 + 0.04 * steps),
    extraLines: Math.min(12, Math.floor(steps)),
    mark: Math.min(1, steps / 8),
  }
}
