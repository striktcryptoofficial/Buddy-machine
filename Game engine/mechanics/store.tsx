import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BuddyState, Save } from './types'
import {
  callTo,
  careWaiting,
  catchUp,
  createBuddy,
  feed,
  integrateMotion,
  keepFact,
  lastHeard,
  seedKeepsakes,
  seedKeptPromises,
  laughAt,
  lifeDecay,
  noteReturn,
  offerScrap,
  pet,
  play,
  replaceLastHer,
  scold,
  speechUntil,
  talk,
  tickNeeds,
  tidy,
  tryAwaken,
} from './engine'
import type { ScrapOffer } from './engine'
import { askCompanion, type AskKind } from './askCompanion'
import { holderPerks } from './holder'
import { awakeningReport } from './awakening'
import { restEnergy } from './house'
import { enterTable, fightPair, claimSeason, lieDown, rise, sendOut, type FightOutcome } from './play'
import { walletSeed } from './table'
import { pourBowl, sipBowl } from './bowl'
import { buyCharm, unequipCharm, wearPouch } from './market'
import { settle, type CartLine } from './catalog'
import { seasonReport } from './season'
import type { CharmId } from './house'

const KEY = 'buddy-ai-v4'

type SolanaKey = { toString(): string }
type SolanaProvider = {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: SolanaKey }>
  disconnect?: () => Promise<void>
}

const PREVIEW_WALLET = 'Bq7mR4tYp2sK9dH3nW8cF6vL5aJ1eXzGqP8uN4hT2kMa'

let walletId = ''
let previewWallet = false
let lifeStream: EventSource | null = null
let attachSerial = 0
let onWalletChange: (wallet: string | null, note: string) => void = () => {}

function solanaProvider(): SolanaProvider | null {
  if (typeof window === 'undefined') return null
  const host = window as Window & { solana?: SolanaProvider; phantom?: { solana?: SolanaProvider } }
  if (host.phantom?.solana?.connect) return host.phantom.solana
  if (host.solana?.connect) return host.solana
  return null
}

let lifePushInFlight = false
let lifeRevision = 0
let refreshGlass = () => {}
const writerId = crypto.randomUUID()

function pictureKey(save: Save) {
  const buddy = save.buddies.find((item) => item.id === save.activeId)
  if (!buddy) return 'empty'
  const speech =
    buddy.speech && buddy.speech.until > Date.now()
      ? `${buddy.speech.text}:${buddy.speech.moment ?? ''}:${buddy.speech.gesture ?? ''}`
      : ''
  const memory = buddy.memories[0]
  const lastTurn = buddy.turns[buddy.turns.length - 1]
  const turnKey = lastTurn ? `${lastTurn.at}:${lastTurn.text}` : ''
  return [
    buddy.id,
    buddy.name,
    buddy.mood,
    buddy.action,
    buddy.moving ? 1 : 0,
    buddy.reason,
    speech,
    turnKey,
    buddy.cupTipped ? 1 : 0,
    memory ? `${memory.at}:${memory.text}` : '',
    buddy.awakenedAt ?? '',
    buddy.clip ?? '',
    buddy.restUntil ?? '',
    Math.round(buddy.needs.energy * 20),
    save.holdings ?? 0,
    save.charm ?? '',
    save.explorations ?? 0,
    save.reign?.defenses ?? '',
  ].join('|')
}

function empty(): Save {
  return {
    ownerName: '',
    buddies: [],
    activeId: '',
    holdings: 0,
    charm: null,
    pouch: null,
    charmClaimed: false,
    explorations: 0,
    reign: null,
    bowl: 0,
    seasonKey: '',
    seasonScraps: 0,
    seasonPlays: 0,
    seasonClaimed: false,
    bag: {},
  }
}

function forgetBrowser() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

function normalizeBuddy(kept: BuddyState) {
  for (const memory of kept.memories ?? []) {
    memory.text = memory.text.replace(' with a coat that already exists. The temper does not.', '.')
  }
  kept.memories ??= []
  kept.turns ??= []
  kept.keepsakes ??= []
  seedKeepsakes(kept)
  seedKeptPromises(kept)
  kept.keepsakes = kept.keepsakes.filter((item) => item.kind !== 'told' || !item.text.includes('?'))
  kept.pendingReturn ??= false
  kept.pendingVoice ??= null
  kept.pendingVoiceLine ??= null
  kept.spokeHunger ??= false
  kept.spokeMiss ??= false
  kept.visitCounts ??= null
  kept.waitingRaisedAt ??= null
  kept.careDays ??= []
  kept.trustHighDays ??= []
  kept.scrapCount ??= 0
  kept.refuseCount ??= 0
  kept.awakenedAt ??= null
  kept.clip ??= null
  kept.restUntil ??= null
  kept.restStartedAt ??= null
  kept.restEnergy ??= null
  kept.careAt ??= {}
}

function clearSave(save: Save) {
  const blank = empty()
  save.ownerName = blank.ownerName
  save.buddies = []
  save.activeId = ''
  save.holdings = 0
  save.charm = null
  save.pouch = null
  save.charmClaimed = false
  save.explorations = 0
  save.reign = null
  save.bowl = 0
  save.seasonKey = ''
  save.seasonScraps = 0
  save.seasonPlays = 0
  save.seasonClaimed = false
  save.bag = {}
  lifeRevision = 0
}

function closeStream() {
  lifeStream?.close()
  lifeStream = null
}

async function attachWallet(save: Save, address: string) {
  const serial = ++attachSerial
  walletId = address
  clearSave(save)
  const remote = await fetchLife(address)
  if (serial !== attachSerial) return
  forgetBrowser()
  if (remote?.ok) {
    adoptRemoteSave(save, remote.save)
    lifeRevision = remote.revision
  }
  closeStream()
  lifeStream = openStream(save, () => refreshGlass())
}

function detachWallet(save: Save) {
  attachSerial += 1
  walletId = ''
  clearSave(save)
  closeStream()
  void solanaProvider()?.disconnect?.()
}

function pushLife(save: Save) {
  if (!walletId || previewWallet) return
  const buddy = save.buddies.find((item) => item.id === save.activeId)
  if (!buddy) return
  if (lifePushInFlight) return
  lifePushInFlight = true
  const sent = lifeRevision
  void fetch('/api/life', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ wallet: walletId, id: buddy.id, save, revision: sent, writer: writerId }),
  })
    .then(async (response) => {
      const data = (await response.json()) as { ok?: boolean; revision?: number; save?: Save }
      if (data.ok && typeof data.revision === 'number') {
        lifeRevision = data.revision
        return
      }
      if (response.status === 409 && data.save) {
        adoptRemoteSave(save, data.save)
        if (typeof data.revision === 'number') lifeRevision = data.revision
        refreshGlass()
      }
    })
    .catch(() => {})
    .finally(() => {
      lifePushInFlight = false
    })
}

function persist(save: Save) {
  pushLife(save)
}

async function fetchLife(wallet = walletId): Promise<{ ok: true; save: Save; revision: number } | { ok: false } | null> {
  if (!wallet) return { ok: false }
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 2000)
  try {
    const response = await fetch(`/api/life?wallet=${encodeURIComponent(wallet)}`, { signal: controller.signal })
    if (!response.ok) return null
    const data = (await response.json()) as { ok?: boolean; save?: Save; revision?: number }
    if (!data.ok || !data.save) return { ok: false }
    return { ok: true, save: data.save, revision: data.revision ?? 0 }
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

function adoptRemoteSave(target: Save, remote: Save) {
  const kept = remote.buddies.find((buddy) => buddy.id === remote.activeId) ?? remote.buddies[0]
  if (!kept?.dna || !kept.personality || !kept.needs || !kept.pos) return false
  normalizeBuddy(kept)
  target.ownerName = remote.ownerName ?? target.ownerName
  target.holdings = remote.holdings ?? target.holdings ?? 0
  target.charm = remote.charm ?? null
  target.pouch = remote.pouch ?? null
  target.charmClaimed = remote.charmClaimed ?? false
  target.explorations = remote.explorations ?? 0
  target.reign = remote.reign ?? null
  target.bowl = remote.bowl ?? 0
  target.seasonKey = remote.seasonKey ?? ''
  target.seasonScraps = remote.seasonScraps ?? 0
  target.seasonPlays = remote.seasonPlays ?? 0
  target.seasonClaimed = remote.seasonClaimed ?? false
  target.bag = remote.bag ?? {}
  target.buddies = [kept]
  target.activeId = kept.id
  return true
}

function openStream(save: Save, onChange: () => void) {
  const stream = new EventSource(`/api/stream?wallet=${encodeURIComponent(walletId)}`)
  stream.addEventListener('life', (event) => {
    let frame: { revision?: number; writer?: string } = {}
    try {
      frame = JSON.parse((event as MessageEvent).data) as { revision?: number; writer?: string }
    } catch {
      return
    }
    if (frame.writer === writerId) {
      if (typeof frame.revision === 'number') lifeRevision = frame.revision
      return
    }
    if (typeof frame.revision === 'number' && frame.revision <= lifeRevision) return
    void fetchLife().then((next) => {
      if (!next || !next.ok) return
      if (next.revision <= lifeRevision) return
      adoptRemoteSave(save, next.save)
      lifeRevision = next.revision
      onChange()
    })
  })
  return stream
}

interface BuddyApi {
  ownerName: string
  buddies: BuddyState[]
  active: BuddyState | null
  wallet: string | null
  walletNote: string
  connect: () => Promise<void>
  disconnect: () => void
  hatch: (visualSeed?: number, owner?: string) => string
  select: (id: string) => void
  retire: (id: string) => void
  rename: (name: string) => void
  commitName: () => void
  pet: () => void
  feed: () => void
  play: () => void
  talk: (text: string) => void
  callTo: (x: number, z: number) => void
  laughAt: () => void
  scold: () => void
  tidy: () => void
  holdings: number
  setHoldings: (balance: number) => void
  perks: ReturnType<typeof holderPerks>
  awakening: ReturnType<typeof awakeningReport> | null
  scrap: (foe: BuddyState, roll: number, buyInEach?: number) => ScrapOffer | null
  charm: Save['charm']
  pouch: Save['pouch']
  bowl: number
  explorations: number
  reign: Save['reign']
  season: ReturnType<typeof seasonReport> | null
  enterTable: (mode: 'scrap' | 'staredown' | 'king', loadout?: 'none' | 'berserker' | 'strategist') => string
  fight: (
    foe: BuddyState,
    mode: 'scrap' | 'staredown' | 'king',
    loadout?: 'none' | 'berserker' | 'strategist',
    foeSave?: Save | null,
  ) => FightOutcome
  sendOut: (mission: 'training' | 'mining' | 'exploration' | 'research' | 'defence' | 'escort') => string
  rest: () => string
  rise: () => string
  pour: (amount: number) => string
  buy: (id: CharmId) => string
  bag: Record<string, number>
  checkout: (lines: CartLine[]) => string
  unequip: () => string
  wear: () => string
  claimSeason: () => string
}

const Ctx = createContext<BuddyApi | null>(null)

export function BuddyProvider({ children }: { children: ReactNode }) {
  const saveRef = useRef<Save>(empty())
  const talkTurn = useRef(0)
  const voiceInFlight = useRef(false)
  const [wallet, setWallet] = useState<string | null>(null)
  const [walletNote, setWalletNote] = useState('')
  const [version, setVersion] = useState(0)
  const bump = () => setVersion((value) => value + 1)
  onWalletChange = (next, note) => {
    setWallet(next)
    setWalletNote(note)
    bump()
  }

  useEffect(() => {
    const save = saveRef.current
    let cancelled = false
    let intervalId = 0

    // One voice request at a time. A new return outranks a pending voice beat.
    // The flag is cleared before the await, so the 200ms tick cannot ask twice.
    const voiceStep = () => {
      if (voiceInFlight.current || cancelled) return
      const buddy = save.buddies.find((item) => item.id === save.activeId)
      if (!buddy?.awakenedAt) return
      let kind: AskKind
      let line: string
      if (buddy.pendingReturn) {
        kind = 'return'
        line = lastHeard(buddy)
        buddy.pendingReturn = false
      } else if (buddy.pendingVoice) {
        kind = buddy.pendingVoice
        line = buddy.pendingVoiceLine || buddy.speech?.text || ''
        buddy.pendingVoice = null
        buddy.pendingVoiceLine = null
      } else {
        return
      }
      voiceInFlight.current = true
      const turn = talkTurn.current
      void askCompanion(buddy, line, kind)
        .then((reply) => {
          if (cancelled || !reply?.line) return
          if (turn !== talkTurn.current || save.activeId !== buddy.id) return
          const spoken = reply.line.trim().slice(0, 320)
          if (!spoken) return
          const now = Date.now()
          buddy.speech = {
            text: spoken,
            until: speechUntil(spoken, now),
            moment: reply.moment || 'approach',
            heard: buddy.speech?.heard,
            ...(reply.gesture ? { gesture: reply.gesture } : {}),
          }
          replaceLastHer(buddy, spoken, now)
        })
        .finally(() => {
          voiceInFlight.current = false
          if (cancelled) return
          persist(save)
          bump()
        })
    }

    refreshGlass = () => {
      if (!cancelled) bump()
    }
    forgetBrowser()

    const now = Date.now()
    for (const buddy of save.buddies) catchUp(buddy, now)
    voiceStep()
    bump()

    let last = performance.now()
      let lastPersist = Date.now()
      let picture = pictureKey(save)
      intervalId = window.setInterval(() => {
        if (document.hidden) return
        const nowMs = performance.now()
        const dt = Math.min(1, (nowMs - last) / 1000)
        last = nowMs
        const tickNow = Date.now()
        const refill = holderPerks(save.holdings ?? 0, 1).refillRate
        for (const buddy of save.buddies) {
          const gap = (tickNow - buddy.lastSimulatedAt) / 1000
          if (gap > 6) lifeDecay(buddy, gap)
          if (buddy.id !== save.activeId) integrateMotion(buddy, dt, tickNow)
          const needStep = gap > 6 ? Math.min(gap, 1) : dt
          tickNeeds(buddy, needStep, tickNow, refill)
          if (buddy.restUntil && buddy.restStartedAt != null && buddy.restEnergy != null) {
            if (tickNow >= buddy.restUntil) rise(buddy)
            else buddy.needs.energy = restEnergy({ startedAt: buddy.restStartedAt, until: buddy.restUntil }, tickNow, buddy.restEnergy)
          }
          buddy.lastSimulatedAt = tickNow
          if (buddy.id === save.activeId) {
            buddy.lastSeen = tickNow
            tryAwaken(buddy, tickNow)
            voiceStep()
          }
        }
        if (tickNow - lastPersist > 2000) {
          persist(save)
          lastPersist = tickNow
        }
        const nextPicture = pictureKey(save)
        if (nextPicture !== picture) {
          picture = nextPicture
          bump()
        }
    }, 200)

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const tickNow = Date.now()
      for (const buddy of save.buddies) catchUp(buddy, tickNow)
      persist(save)
      voiceStep()
      bump()
    }
    document.addEventListener('visibilitychange', onVisible)
    const onLeave = () => persist(save)
    window.addEventListener('beforeunload', onLeave)
    return () => {
      cancelled = true
      closeStream()
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('beforeunload', onLeave)
    }
  }, [])

  const api = useMemo<BuddyApi>(() => {
    const save = saveRef.current
    const active = save.buddies.find((buddy) => buddy.id === save.activeId) ?? null
    const perks = holderPerks(save.holdings ?? 0, 1)
    const touch = () => {
      persist(save)
      bump()
    }
    return {
      ownerName: save.ownerName,
      buddies: save.buddies,
      active,
      wallet,
      walletNote,
      connect: async () => {
        previewWallet = true
        walletId = PREVIEW_WALLET
        onWalletChange(PREVIEW_WALLET, '')
      },
      disconnect: () => {
        previewWallet = false
        detachWallet(save)
        onWalletChange(null, '')
      },
      hatch: (visualSeed?, owner?) => {
        if (!walletId) return ''
        const existing = save.buddies[0]
        if (existing) return existing.dna.rarity
        const ownerName = (owner ?? save.ownerName).trim() || 'friend'
        save.ownerName = ownerName
        const seed = visualSeed ?? walletSeed(walletId)
        const buddy = createBuddy(ownerName, { visualSeed: seed })
        buddy.id = `w_${seed.toString(36)}`
        save.buddies = [buddy]
        save.activeId = buddy.id
        touch()
        return buddy.dna.rarity
      },
      select: (id) => {
        const buddy = save.buddies.find((item) => item.id === id)
        if (!buddy) return
        noteReturn(buddy, Date.now())
        buddy.lastSeen = Date.now()
        save.activeId = id
        touch()
      },
      retire: (id) => {
        save.buddies = save.buddies.filter((buddy) => buddy.id !== id)
        if (save.activeId === id) save.activeId = save.buddies[0]?.id ?? ''
        touch()
      },
      rename: (name) => {
        if (!active) return
        active.name = name.slice(0, 18)
        bump()
      },
      commitName: () => {
        if (!active) return
        active.name = active.name.trim() || 'Buddy'
        touch()
      },
      pet: () => {
        if (!active) return
        const now = Date.now()
        if (careWaiting(active, 'pet', now)) return
        pet(active, now)
        touch()
      },
      feed: () => {
        if (!active) return
        const now = Date.now()
        if (careWaiting(active, 'feed', now)) return
        const sipped = sipBowl(save.bowl ?? 0)
        save.bowl = sipped.bowl
        feed(active, now, perks.feedFill)
        if (sipped.sipped) active.reason = 'She ate from the bowl.'
        touch()
      },
      play: () => {
        if (!active) return
        const now = Date.now()
        if (careWaiting(active, 'play', now)) return
        play(active, now)
        touch()
      },
      talk: (text) => {
        if (!active) return
        const buddy = active
        const trimmed = text.trim().slice(0, 160)
        if (!trimmed) return
        const mine = ++talkTurn.current
        talk(buddy, trimmed, Date.now())
        touch()
        void askCompanion(buddy, trimmed, 'talk').then((heard) => {
          if (mine !== talkTurn.current) return
          if (save.activeId !== buddy.id) return
          if (!heard?.line) return
          const now = Date.now()
          const spoken = heard.line.trim().slice(0, 320)
          if (!spoken) return
          if (heard.fact) keepFact(buddy, heard.fact, now)
          const prior = buddy.speech
          if (
            prior &&
            spoken === prior.text &&
            heard.moment === prior.moment &&
            heard.gesture === prior.gesture
          ) {
            return
          }
          buddy.speech = {
            text: spoken,
            until: speechUntil(spoken, now),
            moment: heard.moment,
            heard: prior?.heard,
            ...(heard.gesture ? { gesture: heard.gesture } : {}),
          }
          replaceLastHer(buddy, spoken, now)
          touch()
        })
      },
      callTo: (x, z) => {
        if (!active) return
        const now = Date.now()
        if (careWaiting(active, 'call', now)) return
        callTo(active, x, z, now)
        touch()
      },
      laughAt: () => {
        if (!active) return
        const now = Date.now()
        if (careWaiting(active, 'laugh', now)) return
        laughAt(active, now)
        touch()
      },
      scold: () => {
        if (!active) return
        const now = Date.now()
        if (careWaiting(active, 'scold', now)) return
        scold(active, now)
        touch()
      },
      tidy: () => {
        if (!active) return
        const now = Date.now()
        if (careWaiting(active, 'tidy', now)) return
        tidy(active, now)
        touch()
      },
      holdings: save.holdings ?? 0,
      setHoldings: (balance) => {
        save.holdings = Math.max(0, balance)
        touch()
      },
      perks,
      awakening: active ? awakeningReport(active) : null,
      scrap: (foe, roll, buyInEach = 0) => {
        if (!active) return null
        const result = offerScrap(active, foe, roll, Date.now(), buyInEach)
        touch()
        return result
      },
      charm: save.charm ?? null,
      pouch: save.pouch ?? null,
      bag: save.bag ?? {},
      bowl: save.bowl ?? 0,
      explorations: save.explorations ?? 0,
      reign: save.reign ?? null,
      season: active ? seasonReport(save, active, Date.now()) : null,
      enterTable: (mode, loadout = 'none') => {
        const reason = enterTable(save, mode, loadout, walletId)
        touch()
        return reason
      },
      fight: (foe, mode, loadout = 'none', foeSave = null) => {
        const outcome = fightPair(save, foe, mode, loadout, Math.random(), Date.now(), walletId, foeSave)
        touch()
        return outcome
      },
      sendOut: (mission) => {
        const reason = sendOut(save, mission)
        touch()
        return reason
      },
      rest: () => {
        if (!active) return ''
        const reason = lieDown(active)
        touch()
        return reason
      },
      rise: () => {
        if (!active) return ''
        const reason = rise(active)
        touch()
        return reason
      },
      pour: (amount) => {
        const next = pourBowl(save.holdings ?? 0, save.bowl ?? 0, amount)
        if (!next.ok) {
          if (active) active.reason = next.reason
          bump()
          return next.reason
        }
        save.holdings = next.holdings
        save.bowl = next.bowl
        if (active) active.reason = 'The bowl is fuller.'
        touch()
        return 'The bowl is fuller.'
      },
      buy: (id) => {
        const next = buyCharm(save.holdings ?? 0, save.charm ?? null, save.pouch ?? null, id)
        if (!next.ok) {
          if (active) active.reason = next.reason
          bump()
          return next.reason
        }
        save.holdings = next.holdings
        save.charm = next.charm
        save.pouch = next.pouch
        const line = `She has a ${id}.`
        if (active) active.reason = line
        touch()
        return line
      },
      checkout: (lines) => {
        const next = settle(save.holdings ?? 0, save.charm ?? null, save.pouch ?? null, save.bag ?? {}, lines)
        if (!next.ok) {
          if (active) active.reason = next.reason
          bump()
          return next.reason
        }
        save.holdings = next.holdings
        save.charm = next.charm
        save.pouch = next.pouch
        save.bag = next.bag
        if (active) active.reason = next.line
        touch()
        return next.line
      },
      unequip: () => {
        const next = unequipCharm(save.charm ?? null, save.pouch ?? null)
        if (!next.ok) {
          if (active) active.reason = next.reason
          bump()
          return next.reason
        }
        save.charm = next.charm
        save.pouch = next.pouch
        if (active) active.reason = 'She took it off.'
        touch()
        return 'She took it off.'
      },
      wear: () => {
        const next = wearPouch(save.charm ?? null, save.pouch ?? null)
        if (!next.ok) {
          if (active) active.reason = next.reason
          bump()
          return next.reason
        }
        save.charm = next.charm
        save.pouch = next.pouch
        if (active) active.reason = 'She put it on.'
        touch()
        return 'She put it on.'
      },
      claimSeason: () => {
        const reason = claimSeason(save)
        touch()
        return reason
      },
    }
    // version is the render clock; save is mutated in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, wallet, walletNote])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useBuddy() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useBuddy must be used inside BuddyProvider')
  return ctx
}
