import { useEffect, useState } from 'react'
import type { Dna, EarType } from '../../mechanics/types'
import type { Visual } from './visual'

const INK = '#1a120c'
const BODY = 'M250 176C362 162 424 232 412 332C400 444 338 518 250 526C158 518 90 444 100 332C110 232 138 162 250 176Z'

const TAIL: Record<Dna['tail'], string> = {
  long: 'M128 408C70 442 12 376 46 318C72 274 30 228 8 252',
  fluffy: 'M126 412C62 454 0 372 44 312C76 268 24 210 2 244',
  slim: 'M134 402C92 418 46 370 66 328C84 294 56 258 34 276',
  curled: 'M136 414C74 458 4 376 50 314C84 268 22 210 6 252',
  bob: 'M150 424C114 436 98 392 118 370',
  kinked: 'M132 408C96 440 62 394 84 360C108 322 58 302 40 334',
}

function stickerFilter(id: string) {
  return (
    <filter id={id} x="-140" y="-120" width="900" height="900" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="13" result="dilate" />
      <feFlood floodColor="#ffffff" result="flood" />
      <feComposite in="flood" in2="dilate" operator="in" result="edge" />
      <feMerge>
        <feMergeNode in="edge" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

function useBlink(eyes: Visual['eyes']) {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    if (eyes !== 'wide' && eyes !== 'smug') return
    let cancel = false
    let wait = 0
    let shut = 0
    const loop = () => {
      wait = window.setTimeout(() => {
        if (cancel) return
        setBlink(true)
        shut = window.setTimeout(() => {
          if (cancel) return
          setBlink(false)
          loop()
        }, 120)
      }, 1700 + Math.random() * 3400)
    }
    loop()
    return () => {
      cancel = true
      window.clearTimeout(wait)
      window.clearTimeout(shut)
    }
  }, [eyes])
  return blink
}

function Ear({ side, type, fill }: { side: 'l' | 'r'; type: EarType; fill: string }) {
  const origin = side === 'l' ? '188px 188px' : '312px 188px'
  const outer =
    side === 'l'
      ? type === 'wide'
        ? '138,208 164,112 232,198'
        : type === 'folded'
          ? '150,190 206,154 234,214'
          : '146,206 184,46 230,196'
      : type === 'wide'
        ? '268,198 336,112 362,208'
        : type === 'folded'
          ? '266,214 294,154 350,190'
          : '270,196 316,46 354,206'
  const inner =
    side === 'l'
      ? type === 'wide'
        ? '160,190 176,132 210,186'
        : type === 'folded'
          ? '168,190 196,166 214,200'
          : '168,188 188,84 212,176'
      : type === 'wide'
        ? '290,186 324,132 340,190'
        : type === 'folded'
          ? '286,200 304,166 332,190'
          : '288,176 312,84 332,188'
  const cx = side === 'l' ? 186 : 314
  return (
    <g className={`svg-motion ear ear-${side}`} style={{ transformOrigin: origin }}>
      {type === 'rounded' ? (
        <>
          <ellipse cx={cx} cy="132" rx="36" ry="48" fill={fill} stroke={INK} strokeWidth="18" />
          <ellipse cx={cx} cy="140" rx="18" ry="28" fill="#ffc3d4" stroke={INK} strokeWidth="8" />
        </>
      ) : (
        <>
          <polygon points={outer} fill={fill} stroke={INK} strokeWidth="18" strokeLinejoin="round" />
          <polygon points={inner} fill="#ffc3d4" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
          {type === 'tufted' && side === 'l' && <polygon points="170,58 184,18 198,56" fill={fill} stroke={INK} strokeWidth="10" />}
          {type === 'tufted' && side === 'r' && <polygon points="302,56 316,18 330,58" fill={fill} stroke={INK} strokeWidth="10" />}
        </>
      )}
    </g>
  )
}

function Paw({ x, y, fill, big }: { x: number; y: number; fill: string; big: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${big ? 1.28 : 1})`}>
      <circle r="36" fill={fill} stroke={INK} strokeWidth="16" />
      <g fill="#ffb3c6" stroke={INK} strokeWidth="4">
        <ellipse cx="-13" cy="-8" rx="7" ry="9" />
        <ellipse cx="0" cy="-16" rx="7" ry="9" />
        <ellipse cx="13" cy="-8" rx="7" ry="9" />
        <ellipse cx="0" cy="8" rx="10" ry="12" />
      </g>
    </g>
  )
}

function OpenEye({
  cx,
  cy,
  rx,
  ry,
  iris,
  gaze,
  luminous,
  lid,
}: {
  cx: number
  cy: number
  rx: number
  ry: number
  iris: string
  gaze: number
  luminous: boolean
  lid: boolean
}) {
  const px = cx + gaze
  return (
    <g>
      {luminous && <ellipse cx={cx} cy={cy} rx={rx + 6} ry={ry + 4} fill={iris} opacity="0.28" />}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fffdf8" stroke={INK} strokeWidth="8" />
      <circle cx={px} cy={cy + 1} r={Math.max(5.5, ry * 0.62)} fill={iris} stroke={INK} strokeWidth="2" />
      <circle cx={px} cy={cy + 1.5} r={Math.max(3.4, ry * 0.34)} fill={INK} />
      <circle cx={px + 3} cy={cy - 2} r="2.4" fill="#fff" />
      {lid && (
        <path
          d={`M${cx - rx + 2} ${cy - 1} Q ${cx} ${cy - ry - 8} ${cx + rx - 2} ${cy - 2}`}
          fill="none"
          stroke={INK}
          strokeWidth="9"
          strokeLinecap="round"
        />
      )}
    </g>
  )
}

function Face({ dna, eyes, mouth, blush }: { dna: Dna; eyes: Visual['eyes']; mouth: Visual['mouth']; blush: number }) {
  const radii = {
    round: { rx: 28, ry: 18 },
    almond: { rx: 32, ry: 13 },
    large: { rx: 34, ry: 24 },
    narrow: { rx: 30, ry: 11 },
  }[dna.eyeShape]
  const luminous = dna.mutations.includes('luminous')
  const gaze = dna.gaze * 7
  return (
    <g>
      {dna.pattern === 'point' && <ellipse cx="250" cy="268" rx="82" ry="60" fill={dna.spot} />}
      {dna.pattern === 'tabby' && (
        <g fill="none" stroke={dna.spot} strokeWidth="8" strokeLinecap="round" opacity="0.8">
          <path d="M208 186 Q250 208 292 186" />
          <path d="M196 170 Q250 196 304 170" />
          <path d="M250 156 V204" />
        </g>
      )}
      {eyes === 'happy' && (
        <g fill="none" stroke={INK} strokeLinecap="round">
          <path d="M158 258 Q196 214 234 258" strokeWidth="12" />
          <path d="M276 258 Q314 214 352 258" strokeWidth="12" />
          <path d="M146 276 Q162 266 178 278" strokeWidth="6" />
          <path d="M332 278 Q348 266 364 276" strokeWidth="6" />
        </g>
      )}
      {eyes === 'closed' && (
        <g fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round">
          <path d="M166 260 H232" />
          <path d="M278 260 H344" />
        </g>
      )}
      {eyes === 'sad' && (
        <g fill="none" stroke={INK} strokeWidth="12" strokeLinecap="round">
          <path d="M162 246 Q198 276 234 246" />
          <path d="M276 246 Q312 276 348 246" />
        </g>
      )}
      {eyes === 'angry' && (
        <g fill="none" stroke={INK} strokeLinecap="round">
          <path d="M160 232 L214 250" strokeWidth="10" />
          <path d="M296 250 L350 232" strokeWidth="10" />
          <path d="M164 266 L216 252" strokeWidth="12" />
          <path d="M294 252 L346 266" strokeWidth="12" />
        </g>
      )}
      {eyes === 'smug' && (
        <>
          <OpenEye cx={198} cy={258} rx={radii.rx} ry={Math.min(radii.ry, 16)} iris={dna.eye} gaze={gaze} luminous={luminous} lid />
          <OpenEye cx={314} cy={258} rx={radii.rx} ry={Math.min(radii.ry, 16)} iris={dna.eyeRight} gaze={gaze} luminous={luminous} lid />
        </>
      )}
      {eyes === 'wide' && (
        <>
          <OpenEye cx={196} cy={256} rx={Math.max(radii.rx, radii.ry + 8)} ry={Math.max(radii.rx, radii.ry + 8)} iris={dna.eye} gaze={gaze * 0.4} luminous={luminous} lid={false} />
          <OpenEye cx={316} cy={256} rx={Math.max(radii.rx, radii.ry + 8)} ry={Math.max(radii.rx, radii.ry + 8)} iris={dna.eyeRight} gaze={gaze * 0.4} luminous={luminous} lid={false} />
        </>
      )}
      {blush > 0 && (
        <>
          <ellipse cx="148" cy="292" rx="20" ry="11" fill="#ff8eab" opacity={0.35 + blush * 0.35} />
          <ellipse cx="352" cy="292" rx="20" ry="11" fill="#ff8eab" opacity={0.35 + blush * 0.35} />
        </>
      )}
      {mouth !== 'laugh' && <path d="M242 286 l8 12 8 -12 q-8 -8 -16 0" fill={dna.nose} stroke={INK} strokeWidth="4" />}
      {mouth === 'laugh' && (
        <>
          <path d="M178 294 Q255 308 332 294 Q304 372 255 378 Q206 372 178 294" fill="#ee5d78" stroke={INK} strokeWidth="10" />
          <ellipse cx="255" cy="342" rx="38" ry="24" fill="#ffc0d0" stroke={INK} strokeWidth="7" />
        </>
      )}
      {mouth === 'smile' && <path d="M214 308 Q255 342 296 308" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" />}
      {mouth === 'flat' && <path d="M220 314 H292" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />}
      {mouth === 'open' && (
        <>
          <ellipse cx="255" cy="318" rx="34" ry="30" fill="#ee5d78" stroke={INK} strokeWidth="9" />
          <ellipse cx="255" cy="332" rx="18" ry="14" fill="#ffc0d0" stroke={INK} strokeWidth="6" />
        </>
      )}
      {mouth === 'tongue' && (
        <>
          <path d="M214 306 Q248 328 276 304" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="286" cy="316" rx="14" ry="10" fill="#ffb3c6" stroke={INK} strokeWidth="6" />
        </>
      )}
      <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity="0.8">
        <path d="M168 286 L138 278" />
        <path d="M166 298 L132 298" />
        <path d="M170 310 L142 322" />
        <path d="M332 286 L362 278" />
        <path d="M334 298 L368 298" />
        <path d="M330 310 L358 322" />
      </g>
    </g>
  )
}

function Accessory({ dna }: { dna: Dna }) {
  const accent = dna.accent
  switch (dna.accessory) {
    case 'bow':
      return (
        <g transform="translate(168 158)">
          <ellipse cx="-18" cy="0" rx="18" ry="13" fill={accent} stroke={INK} strokeWidth="7" />
          <ellipse cx="18" cy="0" rx="18" ry="13" fill={accent} stroke={INK} strokeWidth="7" />
          <circle r="8" fill={accent} stroke={INK} strokeWidth="6" />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(348 156)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="0" cy="-16" rx="8" ry="13" fill={accent} stroke={INK} strokeWidth="5" transform={`rotate(${deg})`} />
          ))}
          <circle r="7" fill="#ffe56a" stroke={INK} strokeWidth="5" />
        </g>
      )
    case 'hat':
      return (
        <g>
          <ellipse cx="250" cy="118" rx="74" ry="16" fill={accent} stroke={INK} strokeWidth="10" />
          <path d="M214 118 V70 Q250 40 286 118" fill={accent} stroke={INK} strokeWidth="10" />
        </g>
      )
    case 'glasses':
      return (
        <g fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round">
          <circle cx="198" cy="258" r="34" />
          <circle cx="314" cy="258" r="34" />
          <path d="M232 258 H280" />
        </g>
      )
    default:
      return null
  }
}

function Neckwear({ dna }: { dna: Dna }) {
  if (dna.accessory === 'collar') {
    return (
      <g>
        <path d="M172 330 Q250 372 328 330" fill="none" stroke={INK} strokeWidth="20" strokeLinecap="round" />
        <path d="M172 330 Q250 372 328 330" fill="none" stroke={dna.accent} strokeWidth="12" strokeLinecap="round" />
        <circle cx="250" cy="366" r="12" fill={dna.accent} stroke={INK} strokeWidth="6" />
        <circle cx="250" cy="376" r="6" fill="#ffe9a0" stroke={INK} strokeWidth="4" />
      </g>
    )
  }
  if (dna.accessory === 'bandana') {
    return <path d="M176 318 L250 392 L324 318 Q250 346 176 318" fill={dna.accent} stroke={INK} strokeWidth="8" />
  }
  if (dna.accessory === 'scarf') {
    return (
      <g fill="none" strokeLinecap="round">
        <path d="M166 326 Q250 374 334 326" stroke={INK} strokeWidth="22" />
        <path d="M166 326 Q250 374 334 326" stroke={dna.accent} strokeWidth="14" />
        <path d="M308 348 Q338 400 304 432" stroke={INK} strokeWidth="18" />
        <path d="M308 348 Q338 400 304 432" stroke={dna.accent} strokeWidth="10" />
      </g>
    )
  }
  return null
}

function Spark({ x, y, s, delay }: { x: number; y: number; s: number; delay: string }) {
  const d = 'M0 -18 L4.5 -4.5 L18 0 L4.5 4.5 L0 18 L-4.5 4.5 L-18 0 L-4.5 -4.5 Z'
  return (
    <g className="sparkle" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: delay }} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={d} fill="#ffe56a" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
      <path d={d} fill="#ffe56a" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
    </g>
  )
}

export function CatSticker({ dna, visual, phase }: { dna: Dna; visual: Visual; phase: number }) {
  const blinking = useBlink(visual.eyes)
  const eyes = blinking && (visual.eyes === 'wide' || visual.eyes === 'smug') ? 'closed' : visual.eyes
  const fluffy = dna.tail === 'fluffy' || dna.mutations.includes('fluffy')
  const bigPaws = dna.mutations.includes('bigPaws')
  const point = dna.pattern === 'point'
  const pawFill = dna.mutations.includes('mittens') ? '#fff8f2' : point ? dna.spot : dna.base
  const earFill = point ? dna.spot : dna.base
  const tailD = TAIL[dna.tail]
  const furW = dna.tail === 'slim' ? 18 : fluffy ? 36 : dna.tail === 'bob' ? 28 : 24
  const tailColor = point ? dna.spot : dna.base
  const spots = dna.pattern === 'solid' || dna.pattern === 'point' ? [] : dna.spots
  const stripes = dna.pattern === 'tabby'
  const tilt = {
    transform: `rotate(${visual.tilt}deg)`,
    transformOrigin: '250px 270px',
    transformBox: 'view-box' as const,
  }

  return (
    <svg className="cat-svg" viewBox="-80 -50 660 660" aria-hidden="true">
      <defs>
        {stickerFilter('buddySticker')}
        <clipPath id="buddyBody" clipPathUnits="userSpaceOnUse">
          <path d={BODY} />
        </clipPath>
      </defs>
      <g filter="url(#buddySticker)">
        <g className={`svg-motion tail-pivot tail-${visual.tail}`} style={{ transformOrigin: '132px 408px', animationDelay: `-${phase}ms` }}>
          <path d={tailD} fill="none" stroke={INK} strokeWidth={furW + 18} strokeLinecap="round" />
          <path d={tailD} fill="none" stroke={tailColor} strokeWidth={furW} strokeLinecap="round" />
          {stripes && (
            <path d={tailD} fill="none" stroke={dna.spot} strokeWidth={furW * 0.9} strokeLinecap="butt" strokeDasharray="16 18" opacity="0.8" />
          )}
          <path d={tailD} fill="none" stroke="#fff" strokeWidth={furW * 0.22} strokeLinecap="round" opacity="0.45" />
        </g>
        {dna.mutations.includes('twinTail') && (
          <g className={`svg-motion tail-pivot tail-${visual.tail}`} style={{ transformOrigin: '150px 430px', animationDelay: `-${phase + 120}ms` }}>
            <path d="M150 430C108 468 58 430 82 384" fill="none" stroke={INK} strokeWidth={furW + 14} strokeLinecap="round" />
            <path d="M150 430C108 468 58 430 82 384" fill="none" stroke={tailColor} strokeWidth={furW * 0.8} strokeLinecap="round" />
          </g>
        )}
        <path d={BODY} fill={dna.base} stroke={INK} strokeWidth="22" />
        <g clipPath="url(#buddyBody)">
          {stripes && (
            <g fill="none" stroke={dna.spot} strokeWidth="14" strokeLinecap="round" opacity="0.55" transform={`translate(0 ${dna.stripeShift})`}>
              <path d="M120 318 C200 296 320 340 400 308" />
              <path d="M112 368 C210 346 320 392 398 360" />
              <path d="M130 418 C220 404 330 446 390 420" />
            </g>
          )}
          {spots.map((spot, index) => (
            <ellipse
              key={index}
              cx={spot.x}
              cy={spot.y}
              rx={spot.rx}
              ry={spot.ry}
              fill={spot.color === 'spot' ? dna.spot : dna.third}
              opacity="0.9"
              transform={`rotate(${spot.rot} ${spot.x} ${spot.y})`}
            />
          ))}
          <ellipse cx="250" cy="430" rx="120" ry="70" fill="#000" opacity="0.06" />
          <ellipse cx="188" cy="246" rx="62" ry="26" fill="#fff" opacity="0.5" transform="rotate(-32 188 246)" />
          <ellipse cx="230" cy="360" rx="90" ry="36" fill="#fff" opacity="0.16" transform="rotate(-18 230 360)" />
        </g>
        <ellipse cx="176" cy="508" rx="56" ry="32" fill={pawFill} stroke={INK} strokeWidth="16" />
        <ellipse cx="328" cy="516" rx="50" ry="30" fill={pawFill} stroke={INK} strokeWidth="16" />
        <g fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round">
          <path d="M146 500 q14 12 24 0" />
          <path d="M168 498 q12 14 22 0" />
          <path d="M188 502 q10 10 18 0" />
          <path d="M300 510 q12 12 22 0" />
          <path d="M320 508 q12 12 20 0" />
          <path d="M338 512 q8 8 14 0" />
        </g>
        {stripes && (
          <g fill="none" stroke={dna.spot} strokeWidth="7" strokeLinecap="round" opacity="0.7">
            <path d="M140 512 H214" />
            <path d="M292 520 H366" />
          </g>
        )}
        <g className={`svg-motion arm-pivot arm-left arm-${visual.arm}`} style={{ transformOrigin: '150px 378px' }}>
          <rect x="124" y="368" width="52" height="112" rx="26" fill={dna.base} stroke={INK} strokeWidth="18" />
          <Paw x={150} y={484} fill={pawFill} big={bigPaws} />
        </g>
        <g className={`svg-motion arm-pivot arm-right arm-${visual.arm}`} style={{ transformOrigin: '356px 366px' }}>
          <rect x="330" y="356" width="52" height="112" rx="26" fill={dna.base} stroke={INK} strokeWidth="18" />
          <Paw x={356} y={472} fill={pawFill} big={bigPaws} />
          {visual.treat && (
            <g transform="translate(382 458) rotate(-18)">
              <circle r="20" fill="#e7b15a" stroke={INK} strokeWidth="7" />
              <circle cx="-6" cy="-2" r="3.2" fill="#6a3d22" />
              <circle cx="5" cy="3" r="2.6" fill="#6a3d22" />
              <circle cx="1" cy="-7" r="2.2" fill="#6a3d22" />
            </g>
          )}
        </g>
        <g className={`head ears-${visual.ears}`} style={tilt}>
          {dna.accessory === 'hat' && <Accessory dna={dna} />}
          <Ear side="l" type={dna.ears} fill={earFill} />
          <Ear side="r" type={dna.ears} fill={earFill} />
          {dna.mutations.includes('star') && (
            <path d="M250 148 l6 14 14 2 -11 9 4 14 -13 -8 -13 8 4 -14 -11 -9 14 -2 z" fill="#ffe56a" stroke={INK} strokeWidth="4" />
          )}
          <Face dna={dna} eyes={eyes} mouth={visual.mouth} blush={visual.blush} />
          {dna.accessory !== 'hat' && <Accessory dna={dna} />}
        </g>
        <Neckwear dna={dna} />
      </g>
      {visual.sparkle && (
        <>
          <Spark x={78} y={150} s={0.85} delay="0s" />
          <Spark x={430} y={78} s={1.05} delay="0.2s" />
          <Spark x={500} y={168} s={0.7} delay="0.45s" />
        </>
      )}
      {visual.zzz && (
        <g className="zzz">
          <text x="400" y="150" fontFamily="Baloo 2, cursive" fontSize="34" fontWeight="700" fill={INK} stroke="#fff" strokeWidth="8" paintOrder="stroke fill">
            z
          </text>
          <text x="438" y="108" fontFamily="Baloo 2, cursive" fontSize="46" fontWeight="700" fill={INK} stroke="#fff" strokeWidth="8" paintOrder="stroke fill">
            z
          </text>
        </g>
      )}
    </svg>
  )
}

export function SeedEgg() {
  return (
    <svg className="cat-svg" viewBox="-80 -50 660 660" aria-hidden="true">
      <defs>{stickerFilter('eggSticker')}</defs>
      <g filter="url(#eggSticker)">
        <path d="M150 430C100 450 48 400 78 350" fill="none" stroke={INK} strokeWidth="40" strokeLinecap="round" />
        <path d="M150 430C100 450 48 400 78 350" fill="none" stroke="#f5c43a" strokeWidth="24" strokeLinecap="round" />
        <path d={BODY} fill="#f5c43a" stroke={INK} strokeWidth="22" />
        <polygon points="146,206 184,46 230,196" fill="#f5c43a" stroke={INK} strokeWidth="18" />
        <polygon points="270,196 316,46 354,206" fill="#f5c43a" stroke={INK} strokeWidth="18" />
        <polygon points="168,188 188,84 212,176" fill="#ffc3d4" stroke={INK} strokeWidth="8" />
        <polygon points="288,176 312,84 332,188" fill="#ffc3d4" stroke={INK} strokeWidth="8" />
        <g fill="none" stroke={INK} strokeLinecap="round">
          <path d="M166 258 Q198 228 230 258" strokeWidth="12" />
          <path d="M280 258 Q312 228 344 258" strokeWidth="12" />
          <path d="M214 310 Q255 340 296 310" strokeWidth="10" />
        </g>
      </g>
      <Spark x={96} y={120} s={0.8} delay="0s" />
      <Spark x={470} y={140} s={0.9} delay="0.3s" />
    </svg>
  )
}
