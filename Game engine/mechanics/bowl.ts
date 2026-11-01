export function pourBowl(
  holdings: number,
  bowl: number,
  amount: number,
): { ok: true; holdings: number; bowl: number } | { ok: false; reason: string } {
  const take = Math.floor(amount)
  if (take < 1) return { ok: false, reason: 'Pour at least one crystal.' }
  if (holdings < take) return { ok: false, reason: 'The purse is short.' }
  return { ok: true, holdings: holdings - take, bowl: bowl + take }
}

export function sipBowl(bowl: number): { bowl: number; sipped: boolean } {
  if (bowl < 1) return { bowl, sipped: false }
  return { bowl: bowl - 1, sipped: true }
}
