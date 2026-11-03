import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { PixelCat } from '../../Game engine/creatures/cat/PixelCat'
import { Lily } from '../../Game engine/creatures/lily/Lily'
import { lilyMomentFor } from '../../Game engine/mechanics/lilyPick'
import { visualFor } from '../../Game engine/creatures/cat/visual'
import { MUTATION_LABEL, seedHex } from '../../Game engine/mechanics/dna'
import {
  actionCaption,
  companyLine,
  archetype,
  curiosityWord,
  developmentLine,
  energyWord,
  formatAge,
  formatWhen,
  happinessWord,
  hungerWord,
  lonelinessWord,
  MOOD_COLOR,
  TRAIT_LABEL,
  trustWord,
} from '../../Game engine/mechanics/copy'
import { integrateMotion } from '../../Game engine/mechanics/engine'
import { titlesFor } from '../../Game engine/mechanics/house'
import { useBuddy } from '../../Game engine/mechanics/store'
import { TRAIT_KEYS } from '../../Game engine/mechanics/types'
import carrierSheet from '../../Game engine/assets/cat/LittleKitties/BONUSgift/GreyBunnyPaid/BunnyStuffs/PetCarryBox.png'
import { Heart, Play, Smartphone, User } from 'lucide-react'
import { AiCredit } from '../ui/AiCredit'
import PromptBar from '../ui/PromptBar'
import { EdgeTabs } from '../ui/EdgeTabs'
import { HouseTape } from '../ui/HouseTape'
import { WalletCard } from '../ui/WalletCard'
import { createMachine, machineScene, type MachineHandle, type MachineKey } from './createMachine'

type Sheet = 'life' | 'journal'

let playBurst: (rarity: string) => void = () => {}
let armNameReveal: (() => void) | null = null
let readHatchedRarity: () => string | undefined = () => undefined

function queueRarityBurst() {
  armNameReveal?.()
  window.setTimeout(() => {
    const rarity = readHatchedRarity()
    if (rarity) playBurst(rarity)
  }, 1900)
}

export function MachineView() {
  const api = useBuddy()
  const mountRef = useRef<HTMLDivElement>(null)
  const stickerRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<MachineHandle | null>(null)
  const edgeRef = useRef<'challenges' | 'stats' | 'abilities' | null>(null)
  const apiRef = useRef(api)
  const openRef = useRef<() => void>(() => {})
  const [screen, setScreen] = useState<HTMLDivElement | null>(null)
  apiRef.current = api

  useEffect(() => {
    const el = document.createElement('div')
    el.className = 'machine-glass'
    setScreen(el)
  }, [])

  useEffect(() => {
    document.body.classList.add('is-machine')
    const mount = mountRef.current
    if (!mount || !screen) return
    const world = createMachine(mount, screen, (key) => pressRef.current(key), () => openRef.current(), () => powerRef.current())
    world.setReadout(apiRef.current.active)
    if (!apiRef.current.active) world.setPower(false)
    worldRef.current = world
    stickerRef.current?.replaceChildren(world.sticker)
    return () => {
      stickerRef.current?.replaceChildren()
      world.dispose()
      worldRef.current = null
      document.body.classList.remove('is-machine')
    }
  }, [screen, machineScene])

  const buddy = api.active
  const [info, setInfo] = useState(false)
  const [surface, setSurface] = useState<'board' | 'field' | 'play' | null>(null)
  const [purseOpen, setPurseOpen] = useState(false)
  const [fold, setFold] = useState(0)
  const [sheetOpen, setSheetOpen] = useState<{ id: 'stats' | 'abilities'; n: number } | null>(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [sheet, setSheet] = useState<Sheet>('life')
  const [opening, setOpening] = useState(false)
  const [born, setBorn] = useState(false)
  const [phase, setPhase] = useState<'off' | 'boot' | 'ready'>(() => (api.active ? 'ready' : 'off'))
  const [bootTime, setBootTime] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const hatching = useRef(false)
  const phaseRef = useRef(phase)
  const pressRef = useRef<(key: MachineKey) => void>(() => {})
  const powerRef = useRef<() => void>(() => {})
  const revealMode = useRef<'snap' | 'animate'>('snap')
  playBurst = (rarity) => worldRef.current?.playRarity(rarity)
  readHatchedRarity = () => apiRef.current.active?.dna.rarity
  armNameReveal = () => {
    revealMode.current = 'animate'
  }
  phaseRef.current = phase
  openRef.current = () => {
    if (phaseRef.current === 'off') {
      powerOn()
      return
    }
    if (phaseRef.current === 'boot') return
    if (!apiRef.current.active) {
      beginHatch()
      return
    }
    setInfo((open) => {
      if (open) return false
      setSheet('life')
      return true
    })
  }

  function powerOn() {
    if (phaseRef.current !== 'off') return
    worldRef.current?.setPower(true)
    if (apiRef.current.active) {
      worldRef.current?.setBoot(null)
      setPhase('ready')
      return
    }
    worldRef.current?.setBoot(0)
    setBootTime(0)
    setPhase('boot')
  }

  function powerOff() {
    if (phaseRef.current === 'off') return
    worldRef.current?.setPower(false)
    worldRef.current?.setBoot(null)
    setBootTime(0)
    setLeaving(false)
    setOpening(false)
    setInfo(false)
    hatching.current = false
    setPhase('off')
  }

  powerRef.current = () => {
    if (phaseRef.current === 'off') powerOn()
    else powerOff()
  }

  function onEdge(id: 'challenges' | 'stats' | 'abilities') {
    edgeRef.current = id
    setPurseOpen(false)
    if (id === 'stats') {
      worldRef.current?.setPull(true, 'hero')
      return
    }
    worldRef.current?.setPull(true)
  }

  function togglePurse() {
    setPurseOpen((open) => {
      if (!open) {
        setFold((value) => value + 1)
        onReturn()
      }
      return !open
    })
  }

  function onReturn() {
    edgeRef.current = null
    worldRef.current?.setPull(false)
  }

  pressRef.current = (key) => {
    if (phaseRef.current === 'off') {
      powerOn()
      return
    }
    if (phaseRef.current !== 'ready' || !apiRef.current.active) return
    apiRef.current[key]()
  }

  function beginHatch() {
    if (!apiRef.current.wallet) {
      void apiRef.current.connect()
      return
    }
    if (phaseRef.current !== 'ready' || hatching.current || apiRef.current.active) return
    hatching.current = true
    setOpening(true)
    window.setTimeout(() => {
      setBorn(true)
      revealMode.current = 'animate'
      apiRef.current.hatch()
      queueRarityBurst()
      setOpening(false)
      hatching.current = false
      window.setTimeout(() => setBorn(false), 980)
    }, 1080)
  }

  useEffect(() => {
    if (buddy || phase !== 'boot' || !screen) return
    const start = performance.now()
    let frame = 0
    let painted = 0
    const loop = (now: number) => {
      const elapsed = (now - start) / 1000
      worldRef.current?.setBoot(elapsed)
      if (elapsed - painted > 0.04) {
        painted = elapsed
        setBootTime(elapsed)
      }
      if (elapsed >= BOOT_LOG_END + BOOT_HOLD) setLeaving(true)
      if (elapsed >= BOOT_END) {
        worldRef.current?.setBoot(null)
        setBootTime(BOOT_END)
        setLeaving(false)
        setPhase('ready')
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [buddy, phase, screen])

  useEffect(() => {
    worldRef.current?.setReadout(buddy, revealMode.current)
    revealMode.current = 'snap'
  }, [buddy, buddy?.name])

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - last) / 1000)
      last = time
      const current = apiRef.current.active
      if (current && document.visibilityState === 'visible') {
        integrateMotion(current, dt, Date.now())
        worldRef.current?.setLights(current)
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={`machine-page${buddy ? '' : ' is-empty'}${surface === 'board' ? ' is-board' : ''}${surface === 'field' ? ' is-field' : ''}${surface === 'play' ? ' is-play' : ''}`} style={{ ['--case-mark' as string]: String(api.perks.mark) }}>
      <div ref={mountRef} className="machine-stage" />
      <div ref={stickerRef} className="rarity-sticker" aria-hidden="true" />
      <HouseTape />
      <WalletCard
        open={purseOpen}
        onPurse={togglePurse}
        onOpenSheet={(id) => {
          onEdge(id)
          setSheetOpen({ id, n: Date.now() })
        }}
      />
      <AiCredit />
      <div className="machine-prompt">
        <PromptBar
          placeholder={buddy ? `Hello to ${buddy.name}` : 'Ask anything'}
          models={[
            { key: 'haiku', name: 'Haiku 5.5', tag: 'Cat' },
            { key: 'sonnet', name: 'Sonnet 5.5', tag: 'Awake' },
          ]}
          defaultModel="haiku"
          messages={(buddy?.turns ?? []).map((turn, index) => ({
            key: `${turn.at}-${index}`,
            role: turn.role,
            text: turn.text,
          }))}
          pending={buddy?.turns?.at(-1)?.role === 'you'}
          catName={buddy?.name ?? 'Buddy'}
          youLabel={api.ownerName || 'You'}
          cat={
            <span className="prompt-bar__avatar-fit">
              <PixelCat
                base={buddy?.dna.base}
                moving={false}
                energy="still"
                zzz={false}
                lean={0}
                mood="content"
                hunger={0.2}
                happiness={0.5}
              />
            </span>
          }
          onSend={(text) => api.talk(text)}
          onAttach={() =>
            new Promise((resolve) => {
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = () => resolve(input.files?.[0]?.name)
              input.click()
            })
          }
          onDictate={() =>
            new Promise((resolve) => {
              const host = window as Window & {
                SpeechRecognition?: new () => {
                  lang: string
                  start: () => void
                  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
                  onerror: (() => void) | null
                }
                webkitSpeechRecognition?: new () => {
                  lang: string
                  start: () => void
                  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
                  onerror: (() => void) | null
                }
              }
              const Ctor = host.SpeechRecognition || host.webkitSpeechRecognition
              if (!Ctor) {
                resolve()
                return
              }
              const rec = new Ctor()
              rec.lang = 'en-US'
              rec.onresult = (event) => resolve(event.results[0][0].transcript)
              rec.onerror = () => resolve()
              rec.start()
            })
          }
        />
      </div>
      <EdgeTabs
        fold={fold}
        openSheet={sheetOpen}
        onSelect={onEdge}
        onReturn={onReturn}
        onPick={(open) => worldRef.current?.setPick(open)}
        onSurface={setSurface}
        onLocked={() => setGateOpen(true)}
      />
      {gateOpen && !buddy ? (
        <GateModal
          wallet={Boolean(api.wallet)}
          phase={phase}
          onClose={() => setGateOpen(false)}
          onAct={() => {
            setGateOpen(false)
            if (!apiRef.current.wallet) {
              void apiRef.current.connect()
              return
            }
            if (phaseRef.current === 'off') {
              powerOn()
              return
            }
            beginHatch()
          }}
        />
      ) : null}
      <nav className="machine-nav" aria-label="Example">
        <span className="is-on" aria-label="Buddy">
          <Smartphone strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span aria-label="Life">
          <Heart strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span aria-label="Play">
          <Play strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span aria-label="You">
          <User strokeWidth={1.75} aria-hidden="true" />
        </span>
      </nav>
      {screen &&
        createPortal(
          <>
            {info && buddy ? (
              <ScreenInfo sheet={sheet} />
            ) : (
              <ScreenCat
                opening={opening}
                born={born}
                booting={phase === 'boot'}
                leaving={leaving}
                powered={phase !== 'off'}
                bootTime={bootTime}
                onPower={powerOn}
                onHatch={beginHatch}
                onFaceFront={() => worldRef.current?.faceFront()}
                onOpen={() => {
                  setSheet('life')
                  setInfo(true)
                }}
              />
            )}
            <div className="machine-glass__shine" />
            {info && buddy && (
              <>
                <button type="button" className="machine-info__back" aria-label="Back" onClick={() => setInfo(false)}>
                  <BackIcon />
                </button>
                <div className="machine-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={sheet === 'life'} className={sheet === 'life' ? 'on' : ''} onClick={() => setSheet('life')}>
                    Life
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sheet === 'journal'}
                    className={sheet === 'journal' ? 'on' : ''}
                    onClick={() => setSheet('journal')}
                  >
                    Journal
                  </button>
                </div>
              </>
            )}
          </>,
          screen,
        )}
    </div>
  )
}

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
const BOOT_VISIBLE = Math.floor((1240 - BOOT_PAD_TOP - BOOT_PAD_BOTTOM) / BOOT_LINE_PX)
const BOOT_LINES = [
  'buddy os',
  'boot rom .......... ok',
  'clk ............... lock',
  'sram 0x000000 ..... ok',
  'sram 0x400000 ..... ok',
  'sram 0x800000 ..... ok',
  'bus lamps ......... ok',
  'gpio led .......... orange',
  'load core',
  'load mind',
  'w = open("mind.bin")',
  'weights 1/12 ...... ok',
  'weights 2/12 ...... ok',
  'weights 3/12 ...... ok',
  'weights 4/12 ...... ok',
  'weights 5/12 ...... ok',
  'weights 6/12 ...... ok',
  'weights 7/12 ...... ok',
  'weights 8/12 ...... ok',
  'weights 9/12 ...... ok',
  'weights 10/12 ..... ok',
  'weights 11/12 ..... ok',
  'weights 12/12 ..... ok',
  'map attn.mood',
  'map attn.voice',
  'map attn.hunger',
  'map embed.coat',
  'bind layer 0',
  'bind layer 1',
  'bind layer 2',
  'bind layer 3',
  'bind layer 4',
  'bind layer 5',
  'tensor life ....... empty',
  'tensor mood ....... empty',
  'seed slot ......... open',
  'rng.init(slot)',
  'compile persona',
  'compile voice',
  'compile habits',
  'for layer in attn:',
  '  warm(layer)',
  'cat.life = None',
  'cat.mood = None',
  'voice.buffer .... empty',
  'habit.table ..... empty',
  'checksum mind ... ok',
  'checksum core ... ok',
  'mount carrier',
  'seal latch ..... ok',
  'arm lamps',
  'arm led',
  'flush log',
  'done',
]
const BOOT_LOG_END = BOOT_AT + (BOOT_LINES.length - 1) * BOOT_STEP
const BOOT_END = BOOT_LOG_END + BOOT_HOLD + BOOT_LEAVE

function TurnOnScreen({ onPower }: { onPower: () => void }) {
  return (
    <div className="machine-boot">
      <button type="button" className="machine-turn-on" onClick={onPower}>
        Turn on
      </button>
    </div>
  )
}

function logoReveal(time: number) {
  const t = time - LOGO_AT
  if (t <= 0) return { opacity: 0, scale: 0.84 }
  if (t < LOGO_IN) {
    const ease = 1 - (1 - t / LOGO_IN) ** 3
    return { opacity: ease, scale: 0.84 + ease * 0.16 }
  }
  if (t < LOGO_IN + LOGO_HOLD) return { opacity: 1, scale: 1 }
  const out = Math.min(1, (t - LOGO_IN - LOGO_HOLD) / LOGO_OUT)
  return { opacity: 1 - out, scale: 1 + out * 0.04 }
}

function BootScreen({ time, leaving }: { time: number; leaving: boolean }) {
  const powering = time < LOGO_AT
  const open = Math.min(1, Math.max(0, time / 0.42))
  const flash = time > 0.34 && time < LOGO_AT + 0.35 ? Math.sin(((time - 0.34) / 0.45) * Math.PI) : 0
  const logo = logoReveal(time)
  const showLogo = time >= LOGO_AT && time < LOGO_END
  const count = time < BOOT_AT ? 0 : Math.min(BOOT_LINES.length, Math.floor((time - BOOT_AT) / BOOT_STEP) + 1)
  const shown = BOOT_LINES.slice(0, count).join('\n')
  const shift = Math.max(0, count - BOOT_VISIBLE) * BOOT_LINE_PX
  return (
    <div className={`machine-boot ${time >= 0.62 ? 'is-lit' : ''} ${leaving ? 'is-leaving' : ''}`}>
      <div className="machine-boot__flash" style={{ opacity: flash * 0.9 }} />
      {powering && (
        <div
          className="machine-boot__beam"
          style={{
            opacity: 0.25 + open * 0.75,
            transform: `translate3d(0, -50%, 1px) scaleY(${1 + open * 22})`,
          }}
        />
      )}
      {showLogo && (
        <div
          className="machine-logo"
          style={{ opacity: logo.opacity, transform: `translate3d(-50%, -50%, 1px) scale(${logo.scale})` }}
        >
          <p className="machine-logo__name">Anthropic</p>
          <p className="machine-logo__ai">AI</p>
        </div>
      )}
      {time >= BOOT_AT && (
        <div className="machine-boot__scroll" style={{ transform: `translate3d(0, ${-shift}px, 1px)` }}>
          <pre className="machine-boot__term">
            {shown}
            {count < BOOT_LINES.length && <span className="machine-boot__cursor" />}
          </pre>
        </div>
      )}
    </div>
  )
}

function GateModal({
  wallet,
  phase,
  onClose,
  onAct,
}: {
  wallet: boolean
  phase: 'off' | 'boot' | 'ready'
  onClose: () => void
  onAct: () => void
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const kicker = wallet ? 'Hatch' : 'Wallet'
  const title = wallet ? (phase === 'off' ? 'Turn the machine on' : 'Hatch a cat') : 'Connect a wallet'
  const line = wallet
    ? phase === 'off'
      ? 'Play and challenges open after this wallet hatches a cat.'
      : 'This wallet has no cat yet. Hatch one to play.'
    : 'Play and challenges open after a wallet is connected and a cat is hatched.'
  const action = wallet ? (phase === 'off' ? 'Turn on' : 'Hatch') : 'Connect wallet'
  return (
    <div className="gate-modal" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <button type="button" className="gate-modal__scrim" aria-label="Close" onClick={onClose} />
      <div className="gate-modal__card">
        <p className="gate-modal__kicker">{kicker}</p>
        <h2 id="gate-title">{title}</h2>
        <p className="gate-modal__line">{line}</p>
        <button type="button" className="wallet-card__purse" onClick={onAct} disabled={phase === 'boot'}>
          {phase === 'boot' ? 'Starting' : action}
        </button>
      </div>
    </div>
  )
}

function HatchScreen({ opening, arriving, onHatch }: { opening: boolean; arriving?: boolean; onHatch: () => void }) {
  return (
    <div className={`machine-hatch-screen ${opening ? 'is-opening' : ''} ${arriving ? 'is-arriving' : ''}`}>
      <div className="machine-hatch-flash" />
      <div className="machine-carrier" style={{ backgroundImage: `url(${typeof carrierSheet === 'string' ? carrierSheet : carrierSheet.src})` }} role="img" aria-label="Pet carrier" />
      <p className="machine-hatch-ready">Ready to hatch</p>
      <button type="button" className="machine-hatch-go" disabled={opening} onClick={onHatch}>
        Hatch
      </button>
    </div>
  )
}

function ScreenCat({
  onOpen,
  onHatch,
  onFaceFront,
  opening,
  born,
  booting,
  leaving,
  bootTime,
  powered,
  onPower,
}: {
  onOpen: () => void
  onHatch: () => void
  onFaceFront: () => void
  opening: boolean
  born: boolean
  booting: boolean
  leaving: boolean
  bootTime: number
  powered: boolean
  onPower: () => void
}) {
  const api = useBuddy()
  const buddy = api.active
  const visual = buddy ? visualFor(buddy) : null
  if (!powered) return <TurnOnScreen onPower={onPower} />
  if (!buddy && booting) {
    return (
      <>
        {leaving ? <HatchScreen arriving opening={false} onHatch={onHatch} /> : null}
        <BootScreen time={bootTime} leaving={leaving} />
      </>
    )
  }
  if (!buddy) return <HatchScreen opening={opening} onHatch={onHatch} />
  const speech = buddy?.speech && Date.now() < buddy.speech.until ? buddy.speech.text : null
  return (
    <>
      {buddy && <p className="machine-name">{buddy.name}</p>}
      {buddy && <p className="machine-caption">{actionCaption(buddy)}</p>}
      {speech && <p className="machine-say">{speech}</p>}
      <div className={`machine-cat ${buddy.moving ? 'is-moving' : ''} ${born ? 'is-born' : ''}`}>
        <div className={`actor-bob ${visual ? `energy-${visual.energy}` : ''}`}>
          {buddy.awakenedAt ? (
            <Lily buddy={buddy} moment={lilyMomentFor(buddy)} />
          ) : (
            <PixelCat
              base={buddy?.dna.base}
              action={buddy?.action}
              moving={buddy?.moving ?? false}
              energy={visual?.energy ?? 'still'}
              zzz={visual?.zzz ?? false}
              lean={buddy?.lean ?? 0}
              mood={buddy?.mood}
              hunger={buddy?.needs.hunger}
              stamina={buddy?.needs.energy}
              happiness={buddy?.needs.happiness}
              scolded={buddy ? Date.now() < buddy.scoldedUntil : false}
              introversion={buddy?.personality.introversion}
              lifeSeed={buddy?.lifeSeed}
              startedAt={buddy?.actionStartedAt}
            />
          )}
        </div>
      </div>
      {buddy && (
        <button
          type="button"
          className="machine-screen-hit"
          style={{ bottom: 96 }}
          aria-label={`Show ${buddy.name}'s life`}
          onClick={onOpen}
        />
      )}
      {buddy && <SayBar name={buddy.name} onSay={api.talk} onFaceFront={onFaceFront} />}
    </>
  )
}

function SayBar({
  name,
  onSay,
  onFaceFront,
}: {
  name: string
  onSay: (line: string) => void
  onFaceFront: () => void
}) {
  const [line, setLine] = useState('')
  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const text = line.trim()
    if (!text) return
    onSay(text)
    setLine('')
  }
  return (
    <form className="machine-say-bar" onSubmit={onSubmit} aria-label={`Say something to ${name}`}>
      <input
        value={line}
        onChange={(event) => setLine(event.target.value)}
        onPointerDown={() => onFaceFront()}
        placeholder={`Hello to ${name}`}
        maxLength={160}
        spellCheck={false}
      />
      <button type="submit">Say</button>
    </form>
  )
}

function BackIcon() {
  return (
    <svg className="machine-back-icon" viewBox="0 0 16 14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 0h2v2H6V0zM4 2h2v2H4V2zM2 4h2v2H2V4zM0 6h2v2H0V6zM2 8h2v2H2V8zM4 10h2v2H4v-2zM6 12h2v2H6v-2zM6 6h10v2H6V6z"
      />
    </svg>
  )
}

function ScreenInfo({ sheet }: { sheet: Sheet }) {
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scroller.current?.scrollTo(0, 0)
  }, [sheet])
  return (
    <div className="machine-info">
      <div className="machine-info__scroll" ref={scroller}>
        {sheet === 'life' ? <LifeSheet /> : <JournalSheet />}
      </div>
    </div>
  )
}

function LifeSheet() {
  const api = useBuddy()
  const buddy = api.active
  const [, setPulse] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setPulse((tick) => tick + 1), 1000)
    return () => window.clearInterval(id)
  }, [])
  if (!buddy) return null
  const now = Date.now()
  const born = archetype(buddy.basePersonality)
  const current = archetype(buddy.personality)
  const titles = titlesFor(buddy, api.explorations, now)
  const resting = buddy.restUntil != null && now < buddy.restUntil
  return (
    <>
      <p className="machine-info__name">{buddy.name}</p>
      <p className="machine-info__meta">
        <span className={`rarity rarity-${buddy.dna.rarity}`}>{buddy.dna.rarity}</span>
        <span>{formatAge(buddy.createdAt, now)}</span>
      </p>
      <p className="machine-info__arch">
        {current}
        {current !== born ? <span> · hatched {born.toLowerCase()}</span> : null}
      </p>
      <p className="machine-info__mood" style={{ color: MOOD_COLOR[buddy.mood] }}>
        {buddy.mood}
      </p>
      <p className="machine-info__caption">{actionCaption(buddy)}</p>
      <p className="machine-info__reason">{companyLine(buddy.reason, buddy.ownerName)}</p>
      {buddy.speech && now < buddy.speech.until && <p className="machine-info__quote">“{buddy.speech.text}”</p>}
      <p className="machine-info__trust">Trust · {trustWord(buddy.trust)}</p>
      {titles.length > 0 && <p className="machine-info__fine">{titles.join(' · ')}</p>}
      <button type="button" className="machine-info__retire" onClick={() => (resting ? api.rise() : api.rest())}>
        {resting ? 'Wake' : 'Rest'}
      </button>

      <h2>Right now</h2>
      <ScreenNeed label="Hunger" word={hungerWord(buddy.needs.hunger)} value={buddy.needs.hunger} />
      <ScreenNeed label="Energy" word={energyWord(buddy.needs.energy)} value={buddy.needs.energy} />
      <ScreenNeed label="Happiness" word={happinessWord(buddy.needs.happiness)} value={buddy.needs.happiness} />
      <ScreenNeed label="Curiosity" word={curiosityWord(buddy.needs.curiosity)} value={buddy.needs.curiosity} />
      <ScreenNeed label="Loneliness" word={lonelinessWord(buddy.needs.loneliness)} value={buddy.needs.loneliness} />

      <h2>Temper</h2>
      {TRAIT_KEYS.map((key) => (
        <div className="machine-info__trait" key={key}>
          <span>{TRAIT_LABEL[key]}</span>
          <div className="meter">
            <span style={{ width: `${buddy.personality[key] * 100}%` }} />
            <i style={{ left: `calc(${buddy.basePersonality[key] * 100}% - 1px)` }} />
          </div>
        </div>
      ))}
      <p className="machine-info__fine">{developmentLine(buddy)} The mark is who they were at hatching.</p>
    </>
  )
}

function JournalSheet() {
  const api = useBuddy()
  const buddy = api.active
  const [copied, setCopied] = useState(false)
  const [armed, setArmed] = useState(false)
  if (!buddy) return null
  const cat = buddy
  const now = Date.now()

  async function copySeed() {
    try {
      await navigator.clipboard.writeText(seedHex(cat.dna.visualSeed))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <h2>{buddy.dna.coatName}</h2>
      <div className="chips">
        <span className="chip">Mochi</span>
        {buddy.dna.mutations
          .filter((mutation) => mutation === 'miniature' || mutation === 'grand')
          .map((mutation) => (
            <span className="chip" key={mutation}>
              {MUTATION_LABEL[mutation] ?? mutation}
            </span>
          ))}
      </div>
      <p className="swatches" aria-hidden="true">
        <i style={{ background: buddy.dna.base }} />
        <i style={{ background: buddy.dna.spot }} />
        <i style={{ background: buddy.dna.eye }} />
        {buddy.dna.eye !== buddy.dna.eyeRight && <i style={{ background: buddy.dna.eyeRight }} />}
      </p>

      <h2>{buddy.awakenedAt ? 'Awake' : 'Road'}</h2>
      <p className="machine-info__seed">
        {buddy.awakenedAt
          ? `${buddy.name} is on the glass.`
          : api.awakening?.missing.length
            ? api.awakening.missing.join(' · ')
            : api.awakening?.asleep
              ? 'She is asleep.'
              : 'The glass is ready.'}
      </p>

      <h2>Journal</h2>
      <div className="journal">
        {buddy.memories.slice(0, 8).map((memory) => (
          <article key={memory.id}>
            <time>{formatWhen(memory.at, now)}</time>
            <p>{memory.text}</p>
          </article>
        ))}
      </div>

      <h2>This wallet</h2>
      <p className="machine-info__seed">
        Coat <code>{seedHex(buddy.dna.visualSeed)}</code>
        <button type="button" onClick={() => void copySeed()}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </p>
      <p className="machine-info__fine">One cat for this wallet. The coat does not roll again.</p>
      <button
        type="button"
        className="machine-info__retire"
        onClick={() => {
          if (!armed) {
            setArmed(true)
            return
          }
          api.retire(buddy.id)
        }}
      >
        {armed ? `Let ${buddy.name} go` : 'Retire'}
      </button>
    </>
  )
}

function ScreenNeed({ label, word, value }: { label: string; word: string; value: number }) {
  return (
    <div className="machine-info__need">
      <span>{label}</span>
      <strong>{word}</strong>
      <div className="meter">
        <span style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  )
}
