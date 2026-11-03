import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Award, Bell, Check, Compass, Copy, Gem, Moon, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react'
import gsap from 'gsap'
import { PixelCat } from '../../Game engine/creatures/cat/PixelCat'
import { useBuddy } from '../../Game engine/mechanics/store'
import { PurseSheet, ShopModal } from './PurseSheet'
import './cards/play.css'

const SOL_BALANCE = '4.82'
const USD_VALUE = '867.60'
const BUDDY_BALANCE = '12,480'
const BUDDY_SHARE = '18.4%'

function PhantomLogo() {
  return (
    <svg className="wallet-card__phantom" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" fill="#9786E4" />
      <path
        fill="#FEFDF8"
        d="M5.7655 15.797C5.7655 17.222 6.49879 17.55 7.26141 17.55C8.87463 17.55 10.087 16.0841 10.8105 14.9256C10.7225 15.1819 10.6736 15.4382 10.6736 15.6842C10.6736 16.3609 11.0452 16.8427 11.7785 16.8427C12.7855 16.8427 13.861 15.92 14.4183 14.9256C14.3792 15.0692 14.3596 15.2024 14.3596 15.3254C14.3596 15.797 14.6138 16.0943 15.132 16.0943C16.7648 16.0943 18.4074 13.0701 18.4074 10.4252C18.4074 8.36459 17.4101 6.55005 14.9071 6.55005C10.5074 6.55005 5.7655 12.1679 5.7655 15.797ZM13.3917 10.1996C13.3917 9.68705 13.6654 9.32825 14.0663 9.32825C14.4574 9.32825 14.7312 9.68705 14.7312 10.1996C14.7312 10.7122 14.4574 11.0813 14.0663 11.0813C13.6654 11.0813 13.3917 10.7122 13.3917 10.1996ZM15.484 10.1996C15.484 9.68705 15.7578 9.32825 16.1586 9.32825C16.5497 9.32825 16.8235 9.68705 16.8235 10.1996C16.8235 10.7122 16.5497 11.0813 16.1586 11.0813C15.7578 11.0813 15.484 10.7122 15.484 10.1996Z"
      />
    </svg>
  )
}

function shortAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

function buttonAddress(address: string) {
  if (address.length <= 14) return address
  return `${address.slice(0, 6)}…${address.slice(-6)}`
}

function StatsGlyph() {
  return (
    <svg className="wallet-drop__glyph" viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 2.4 29.2 12l-5.1 15.6H8.9L3.8 12 16 2.4Zm0 5.2L8.7 12.8l3.1 9.6h8.4l3.1-9.6L16 7.6Z"
      />
      <circle cx="16" cy="4.2" r="1.7" fill="currentColor" />
      <circle cx="27.6" cy="12.2" r="1.7" fill="currentColor" />
      <circle cx="23.1" cy="26.4" r="1.7" fill="currentColor" />
      <circle cx="8.9" cy="26.4" r="1.7" fill="currentColor" />
      <circle cx="4.4" cy="12.2" r="1.7" fill="currentColor" />
      <circle cx="16" cy="16" r="2.1" fill="currentColor" />
    </svg>
  )
}

function AbilitiesGlyph() {
  return (
    <svg className="wallet-drop__glyph" viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 1.6 18.7 10 27.4 8.4 22 15.1 30.4 16 22 16.9 27.4 23.6 18.7 22 16 30.4 13.3 22 4.6 23.6 10 16.9 1.6 16 10 15.1 4.6 8.4 13.3 10Zm0 11.2a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"
      />
    </svg>
  )
}

const NOTES: {
  id: string
  kicker: string
  title: string
  line: string
  time: string
  unread: boolean
  icon: LucideIcon
}[] = [
  { id: 'hatch', kicker: 'Life', title: 'She hatched', line: 'A new coat is awake on the machine.', time: '2m', unread: true, icon: Sparkles },
  { id: 'scrap', kicker: 'Arena', title: 'Scrap logged', line: 'A stare, then a win. Battle mark counted.', time: '18m', unread: true, icon: Swords },
  { id: 'field', kicker: 'Field', title: 'She came back', line: 'Exploration closed. A bell is in the pouch.', time: '1h', unread: true, icon: Compass },
  { id: 'crys', kicker: 'Purse', title: 'Crystals poured', line: 'Four crystals moved into holdings.', time: '3h', unread: false, icon: Gem },
  { id: 'sig', kicker: 'Skill', title: 'Shadow Strike ready', line: 'Signature is charged for the next scrap.', time: '5h', unread: false, icon: Zap },
  { id: 'season', kicker: 'House', title: 'Season can be marked', line: 'Season 04 is waiting on the tape.', time: '1d', unread: false, icon: Award },
  { id: 'rest', kicker: 'Care', title: 'She went to rest', line: 'Energy dropped. Sleep started on her own.', time: '2d', unread: false, icon: Moon },
  { id: 'link', kicker: 'Wallet', title: 'Phantom linked', line: 'The preview wallet is sitting on the bar.', time: '3d', unread: false, icon: Bell },
]

const NOTE_NEW = NOTES.filter((note) => note.unread).length

function bindPaneWheel(root: HTMLElement | null, pane?: HTMLElement | null) {
  if (!root) return
  const scroller = pane ?? root
  function onWheel(event: WheelEvent) {
    const max = scroller.scrollHeight - scroller.clientHeight
    if (max <= 1) return
    event.preventDefault()
    event.stopPropagation()
    let delta = event.deltaY
    if (event.deltaMode === 1) delta *= 16
    else if (event.deltaMode === 2) delta *= scroller.clientHeight
    scroller.scrollTop = Math.max(0, Math.min(max, scroller.scrollTop + delta))
  }
  root.addEventListener('wheel', onWheel, { passive: false })
  return () => root.removeEventListener('wheel', onWheel)
}

function BuddyMark() {
  return <img className="wallet-card__buddy" src="/b-logo%20black.svg" alt="" />
}

function SolanaLogo({ id = 'wallet-solana-mark' }: { id?: string }) {
  return (
    <svg className="wallet-card__logo" viewBox="0 0 101 88" aria-hidden="true">
      <path
        fill={`url(#${id})`}
        d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z"
      />
      <defs>
        <linearGradient id={id} x1="8.52558" y1="90.0973" x2="88.9933" y2="-3.01622" gradientUnits="userSpaceOnUse">
          <stop offset="0.08" stopColor="#9945FF" />
          <stop offset="0.3" stopColor="#8752F3" />
          <stop offset="0.5" stopColor="#5497D5" />
          <stop offset="0.6" stopColor="#43B4CA" />
          <stop offset="0.72" stopColor="#28E0B9" />
          <stop offset="0.97" stopColor="#19FB9B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function WalletCard({
  open,
  onPurse,
  onOpenSheet,
  onShop,
}: {
  open: boolean
  onPurse: () => void
  onOpenSheet?: (id: 'stats' | 'abilities') => void
  onShop?: (open: boolean) => void
}) {
  const api = useBuddy()
  const buddy = api.active
  const address = api.wallet
  const cardRef = useRef<HTMLElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)
  const connected = Boolean(address)
  const [copied, setCopied] = useState(false)
  const [notes, setNotes] = useState(false)
  const [shop, setShop] = useState(false)

  function openShop() {
    setShop(true)
    onShop?.(true)
    if (open) onPurse()
  }

  function closeShop() {
    setShop(false)
    onShop?.(false)
  }
  const [dropLive, setDropLive] = useState(false)
  const collapseRef = useRef(false)
  const [notesLive, setNotesLive] = useState(false)
  const dropOn = open && connected

  async function copyAddress() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  useEffect(() => {
    if (open) setNotes(false)
  }, [open])

  useLayoutEffect(() => {
    if (dropOn) setDropLive(true)
  }, [dropOn])

  useLayoutEffect(() => {
    if (notes) setNotesLive(true)
  }, [notes])

  useLayoutEffect(() => {
    const root = dropRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rows = root.querySelectorAll<HTMLElement>('.wallet-drop__token, .wallet-drop__address')
    const lanes = root.querySelectorAll<HTMLElement>('.wallet-drop__lane')
    const innards = root.querySelectorAll<HTMLElement>('.wallet-drop__lane > *, .wallet-drop__token > *, .wallet-drop__address > *')
    const purse = root.querySelectorAll<HTMLElement>('.purse-sheet__head, .purse-sheet__crystal, .purse-slot, .purse-sheet__meta, .purse-sheet__actions, .purse-sheet h2, .purse-sheet__head button')
    gsap.killTweensOf([root, rows, lanes, innards, purse])
    if (!dropOn) {
      root.style.pointerEvents = 'none'
      const collapse = collapseRef.current
      collapseRef.current = false
      if (collapse) {
        root.style.overflow = 'hidden'
        root.style.transformOrigin = 'top right'
        gsap.to(root, {
          scaleY: 0,
          duration: reduce ? 0 : 0.42,
          ease: 'power3.out',
          onComplete() {
            gsap.set(root, { autoAlpha: 0, clearProps: 'transform,overflow' })
            setDropLive(false)
          },
        })
        return
      }
      gsap.to([innards, purse], { opacity: 0, duration: reduce ? 0 : 0.14, stagger: reduce ? 0 : 0.006, ease: 'power2.in' })
      gsap.to(lanes, { y: 12, opacity: 0, duration: reduce ? 0 : 0.26, stagger: reduce ? 0 : 0.04, ease: 'power3.in' })
      gsap.to(rows, { y: 8, opacity: 0, duration: reduce ? 0 : 0.22, stagger: reduce ? 0 : 0.03, ease: 'power2.in' })
      gsap.to(root, {
        y: -8,
        autoAlpha: 0,
        duration: reduce ? 0 : 0.26,
        delay: reduce ? 0 : 0.04,
        ease: 'power3.in',
        onComplete() {
          setDropLive(false)
        },
      })
      return
    }
    root.style.pointerEvents = 'auto'
    gsap.set(root, { autoAlpha: 1, scaleY: 1, clearProps: 'transform,filter,overflow' })
    gsap.fromTo(root, { y: -12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduce ? 0 : 0.5, ease: 'expo.out' })
    gsap.fromTo(
      rows,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: reduce ? 0 : 0.46, stagger: reduce ? 0 : 0.05, delay: reduce ? 0 : 0.05, ease: 'power3.out' },
    )
    gsap.fromTo(
      lanes,
      { y: 14, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: reduce ? 0 : 0.56,
        stagger: reduce ? 0 : 0.06,
        delay: reduce ? 0 : 0.08,
        ease: 'expo.out',
        onComplete() {
          gsap.set(lanes, { clearProps: 'transform,filter' })
        },
      },
    )
    gsap.fromTo(
      innards,
      { opacity: 0 },
      { opacity: 1, duration: reduce ? 0 : 0.38, stagger: reduce ? 0 : 0.012, delay: reduce ? 0 : 0.12, ease: 'power3.out' },
    )
    gsap.fromTo(
      purse,
      { opacity: 0 },
      { opacity: 1, duration: reduce ? 0 : 0.4, stagger: reduce ? 0 : 0.014, delay: reduce ? 0 : 0.16, ease: 'power3.out' },
    )
  }, [dropOn])

  useLayoutEffect(() => {
    const root = notesRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.killTweensOf(root)
    gsap.set(root, { clearProps: 'transform,filter,scale' })
    if (!notes) {
      root.style.pointerEvents = 'none'
      gsap.to(root, {
        autoAlpha: 0,
        duration: reduce ? 0 : 0.2,
        ease: 'power2.in',
        onComplete() {
          setNotesLive(false)
        },
      })
      return
    }
    root.style.pointerEvents = 'auto'
    gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.28, ease: 'power2.out' })
  }, [notes])

  useEffect(() => {
    if (!notes) return undefined
    const root = notesRef.current
    return bindPaneWheel(root, root?.querySelector<HTMLElement>('.wallet-notes__list'))
  }, [notes])

  useEffect(() => {
    if (!dropOn) return undefined
    return bindPaneWheel(dropRef.current?.querySelector<HTMLElement>('.purse-sheet__grid') ?? null)
  }, [dropOn])

  useEffect(() => {
    if (!notes) return
    const onDown = (event: PointerEvent) => {
      const node = event.target
      if (node instanceof Node && cardRef.current?.contains(node)) return
      setNotes(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotes(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [notes])

  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      const node = event.target
      if (node instanceof Node && cardRef.current?.contains(node)) return
      if (node instanceof Element && node.closest('.shop-modal')) return
      collapseRef.current = node instanceof Element && Boolean(node.closest('.machine-prompt, .prompt-bar'))
      onPurse()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.querySelector('.shop-modal')) return
      if (event.key === 'Escape') onPurse()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onPurse])

  return (
    <aside
      ref={cardRef}
      className="wallet-card"
      aria-label={buddy ? `${buddy.name}, wallet ${shortAddress(address || '')}, ${SOL_BALANCE} SOL, $${USD_VALUE}` : connected ? `Wallet connected, ${shortAddress(address || '')}` : 'Connect wallet'}
    >
      <div className="wallet-card__bar">
      <div className="wallet-card__identity">
        {buddy ? (
          <span className="wallet-card__nft" aria-hidden="true">
            <span className="wallet-card__nft-fit">
              <PixelCat
                base={buddy.dna.base}
                moving={false}
                energy="still"
                zzz={false}
                lean={0}
                mood="content"
                hunger={0.2}
                happiness={0.4}
              />
            </span>
          </span>
        ) : (
          <span className="wallet-card__mark">
            <SolanaLogo />
          </span>
        )}
        <span className="wallet-card__who">
          <span className="wallet-card__name">{buddy ? buddy.name : 'Wallet'}</span>
          <span className="wallet-card__address">{buddy ? shortAddress(address || '') : connected ? 'Connected' : api.walletNote || 'Not connected'}</span>
        </span>
      </div>
      <div className="wallet-card__actions">
      {connected ? (
        <button
          type="button"
          className={`wallet-card__session${open ? ' is-on' : ''}`}
          aria-expanded={open}
          aria-controls="wallet-drop"
          onClick={onPurse}
        >
          <PhantomLogo />
          <span>{buttonAddress(address || '')}</span>
        </button>
      ) : (
        <button type="button" className="wallet-card__purse" onClick={() => void api.connect()}>
          Connect wallet
        </button>
      )}
      <button
        type="button"
        className={`wallet-card__button wallet-card__notify${notes ? ' is-on' : ''}${NOTE_NEW ? ' has-new' : ''}`}
        aria-label={`Notifications, ${NOTE_NEW} new`}
        aria-expanded={notes}
        aria-controls="wallet-notes"
        onClick={() => {
          if (!notes && open) onPurse()
          setNotes((value) => !value)
        }}
      >
        <Bell strokeWidth={1.75} />
        {NOTE_NEW ? <i className="wallet-card__notify-pip" aria-hidden="true">{NOTE_NEW}</i> : null}
      </button>
      </div>
      </div>
      {connected && (dropOn || dropLive) ? (
        <div className="wallet-drop" id="wallet-drop" ref={dropRef} aria-hidden={dropOn ? undefined : true}>
          <div className="wallet-drop__token">
            <span className="wallet-card__mark">
              <SolanaLogo id="wallet-solana-mark-drop" />
            </span>
            <strong>
              {SOL_BALANCE}
              <span>SOL</span>
            </strong>
            <em>${USD_VALUE}</em>
          </div>
          <div className="wallet-drop__token">
            <span className="wallet-card__mark">
              <BuddyMark />
            </span>
            <strong>
              {BUDDY_BALANCE}
              <span>BUDDY</span>
            </strong>
            <em>{BUDDY_SHARE}</em>
          </div>
          <div className="wallet-drop__address">
            <code>{address}</code>
            <button type="button" aria-label={copied ? 'Copied' : 'Copy address'} onClick={() => void copyAddress()}>
              {copied ? <Check strokeWidth={1.75} /> : <Copy strokeWidth={1.75} />}
            </button>
          </div>
          <div className="wallet-drop__lanes">
            <button type="button" className="wallet-drop__lane" onClick={() => onOpenSheet?.('stats')}>
              <span className="wallet-drop__lane-top">
                <StatsGlyph />
                <span className="wallet-drop__lane-index">01</span>
              </span>
              <span className="wallet-drop__lane-kicker">Sheet</span>
              <strong className="wallet-drop__lane-title">Stats</strong>
              <span className="wallet-drop__lane-detail">Radar, level, and the five numbers</span>
              <span className="wallet-drop__lane-foot">Open</span>
            </button>
            <button type="button" className="wallet-drop__lane" onClick={() => onOpenSheet?.('abilities')}>
              <span className="wallet-drop__lane-top">
                <AbilitiesGlyph />
                <span className="wallet-drop__lane-index">02</span>
              </span>
              <span className="wallet-drop__lane-kicker">Skill</span>
              <strong className="wallet-drop__lane-title">Abilities</strong>
              <span className="wallet-drop__lane-detail">Signature, aegis, and the rest</span>
              <span className="wallet-drop__lane-foot">Open</span>
            </button>
          </div>
          <PurseSheet onOpenShop={openShop} />
        </div>
      ) : null}
      {notes || notesLive ? (
        <div className="wallet-notes" id="wallet-notes" ref={notesRef} aria-hidden={notes ? undefined : true}>
          <header className="wallet-notes__head">
            <div className="wallet-notes__lead">
              <p className="wallet-notes__kicker">Inbox</p>
              <h2 className="wallet-notes__title">Notifications</h2>
            </div>
            <span className="wallet-notes__meta">
              <em>{String(NOTE_NEW).padStart(2, '0')}</em>
              new
              <i aria-hidden="true" />
              <em>{String(NOTES.length).padStart(2, '0')}</em>
              total
            </span>
          </header>
          <div className="wallet-notes__list" role="list">
            {NOTES.map((note) => {
              const Icon = note.icon
              return (
                <article
                  className={`wallet-notes__item${note.unread ? ' is-new' : ''}`}
                  key={note.id}
                  role="listitem"
                  aria-label={`${note.unread ? 'Unread. ' : ''}${note.title}. ${note.line}. ${note.time}`}
                >
                  <span className="wallet-notes__mark">
                    <Icon strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="wallet-notes__kind">{note.kicker}</span>
                  <time className="wallet-notes__time" dateTime={note.time}>{note.time}</time>
                  <strong className="wallet-notes__name">{note.title}</strong>
                  <p className="wallet-notes__line">{note.line}</p>
                  <i className={`wallet-notes__dot${note.unread ? ' is-on' : ''}`} aria-hidden="true" />
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
      {shop ? <ShopModal onClose={closeShop} /> : null}
    </aside>
  )
}
