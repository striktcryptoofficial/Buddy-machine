import { catchUp, createBuddy } from '../Game engine/mechanics/engine'
import { walletSeed } from '../Game engine/mechanics/table'
import type { Save } from '../Game engine/mechanics/types'

export { walletSeed }

export function advanceSave(save: Save, now: number): Save {
  for (const buddy of save.buddies) catchUp(buddy, now)
  return save
}

export function hatchSave(wallet: string, ownerName: string): Save {
  const owner = ownerName.trim().slice(0, 24) || 'friend'
  const visualSeed = walletSeed(wallet || owner)
  const buddy = createBuddy(owner, { visualSeed })
  const id = `w_${visualSeed.toString(36)}`
  buddy.id = id
  return { ownerName: owner, buddies: [buddy], activeId: id, holdings: 0 }
}
