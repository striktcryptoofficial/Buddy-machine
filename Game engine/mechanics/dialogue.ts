import type { BuddyState } from './types'
import { archetype } from './copy'

const FEW_SECONDS = 2800

export { FEW_SECONDS }

function pick(buddy: BuddyState, lines: string[]) {
  if (buddy.personality.introversion > 0.66) {
    return lines.slice().sort((a, b) => a.length - b.length)[0]
  }
  return lines[Math.floor(Math.random() * lines.length)]
}

export function catSound(buddy: BuddyState, input = '') {
  const q = input.trim().toLowerCase()
  if (/love|cute|pet|good|pretty/.test(q) || buddy.mood === 'happy' || buddy.mood === 'affectionate') {
    return pick(buddy, ['purrr.', 'purr...', 'prrt.'])
  }
  if (buddy.mood === 'angry' || /\bno\b|bad|stop/.test(q)) return pick(buddy, ['mrow!', 'mraow.'])
  if (buddy.action === 'sleep' || buddy.mood === 'sleepy' || /sleep|tired|nap/.test(q)) return pick(buddy, ['purr...', 'mmm.', 'mrr.'])
  if (buddy.needs.hunger > 0.55 || /food|eat|hungry|treat|bowl/.test(q)) return pick(buddy, ['miauw.', 'miau!', 'mew.'])
  if (/hello|hi\b|hey/.test(q)) return pick(buddy, ['miau.', 'mew.', 'mrrp.'])
  return pick(buddy, ['miauw.', 'mrrp.', 'purrr.', 'mew.', 'mrow.'])
}

export function aside(buddy: BuddyState) {
  const name = buddy.ownerName
  const p = buddy.personality
  switch (buddy.action) {
    case 'eat':
      return buddy.needs.hunger > 0.55
        ? pick(buddy, [
            'I am hungry.',
            'I need something to eat.',
            'My stomach is empty. Feed me.',
            'I am hungry. Do not make me wait.',
          ])
        : pick(buddy, [
            'I could eat a little.',
            'A small bite would be nice.',
            'I could eat, if you are offering.',
            'Not a full meal. A little would do.',
          ])
    case 'sleep':
      return pick(buddy, [
        'I am going to rest. Do not go far.',
        'I am tired. I will rest here.',
        'Sleepy. Let me rest near you.',
        'I need to close my eyes. Do not go far.',
      ])
    case 'attend':
    case 'approach':
      return buddy.needs.loneliness > 0.45
        ? pick(buddy, [
            `${name}, come here.`,
            `Come here, ${name}. I want you near.`,
            'Come here. I want the company.',
            `Come here. Sit where I can see you, ${name}.`,
          ])
        : pick(buddy, [
            'I am right here.',
            'I am listening, if you want to talk.',
            'Go on. I am with you.',
            'Say more. I am right here with you.',
          ])
    case 'shy':
      return pick(buddy, [
        'Give me a second.',
        'Give me a second. I am still with you.',
        '...okay. Give me a second.',
        'Thank you. Give me a second.',
      ])
    case 'angry':
      return pick(buddy, [
        'Hey. Not like that.',
        'No. Not like that.',
        'Hey. That is not right.',
        'Not like that. Too much.',
      ])
    case 'refuse':
      return pick(buddy, [
        'No. Not right now.',
        'No. I should not.',
        'Not right now. No.',
        'No. That is too much.',
      ])
    case 'knock':
      return pick(buddy, [
        'I should not. I might.',
        'I should not. I want to anyway.',
        'No. I should not do that.',
        'I should not. Ask me nicer.',
      ])
    case 'chase':
    case 'zoomies':
    case 'playWithYou':
      return pick(buddy, [
        'Watch this.',
        'Watch this. I am still quick.',
        'Watch this. Eyes on me.',
        'Watch this. I can still play.',
      ])
    case 'window':
      return pick(buddy, [
        'I was thinking.',
        'I was thinking. The window helps.',
        'I was thinking about the day.',
        'I have an idea. I was thinking.',
      ])
    case 'chill':
    case 'sit':
      return pick(buddy, [
        'You can stay.',
        'I am fine here.',
        'This is enough.',
        'I like the quiet.',
        'We can just be here.',
        'This spot is good.',
        'Being here with you is good.',
        'Your company is plenty.',
      ])
    default:
      return p.mischief > 0.65
        ? pick(buddy, [
            'I have an idea.',
            'I have an idea. It can wait a moment.',
            'I was thinking. I have an idea.',
            'I have an idea. Hear me out.',
          ])
        : pick(buddy, [
            'Mm.',
            'Mm. I am listening.',
            'Go on. I am listening.',
            'Say more. I am right here with you.',
          ])
  }
}

export function speak(buddy: BuddyState, input: string) {
  if (!buddy.awakenedAt) return catSound(buddy, input)
  const q = input.trim().toLowerCase()
  const called = buddy.keepsakes?.find((item) => item.kind === 'name')?.text
  const waiting = buddy.keepsakes?.find((item) => item.kind === 'waiting')?.text
  if (/what do you call me|who am i/.test(q) && called) {
    return waiting ? `I call you ${called}. I kept this: ${waiting}.` : `I call you ${called}.`
  }
  if (/what did i promise|did i do what i said|did i keep|do you remember what i promised|did i bring|did you get|the fish/.test(q)) {
    if (waiting) return `I am still waiting. You said ${quotedPromise(waiting)}.`
    const kept = latestKeptKeepsake(buddy)
    if (kept) return `You did. You said ${quotedPromise(kept.text)}.`
  }
  const name = called || buddy.ownerName
  const p = buddy.personality

  if (!q) return pick(buddy, [
    `I'm here, ${name}.`,
    'Say it again. I am listening.',
    'Go on.',
    `I'm here, ${name}. Say it again.`,
    'I am listening. Go on when you are ready.',
    'Say more. I am listening.',
  ])

  if (/how are you|how's|hows/.test(q)) {
    if (buddy.needs.hunger > 0.6) return pick(buddy, [
      `Hungry. Stay with me anyway, ${name}.`,
      'I could eat. Do not leave while I say that.',
      `I am hungry, ${name}. Stay with me while I admit it.`,
      'My stomach is empty. I could eat, and I still want you here.',
      'Hungry. Do not leave while I say that.',
    ])
    if (buddy.needs.loneliness > 0.55) return pick(buddy, [
      'Better, now that you are here.',
      `I missed you, ${name}.`,
      `I missed you. Come here, ${name}.`,
      'Better. I missed you more than I planned to say.',
      `Come here. I missed you, ${name}.`,
    ])
    if (buddy.needs.energy < 0.3) return pick(buddy, [
      'Tired. I can still talk.',
      'Sleepy, but I am not going anywhere.',
      'Tired. I can still hear every word you say.',
      'Sleepy. Sit close. I am not going anywhere.',
      'I am tired, and I am glad you asked.',
    ])
    return pick(buddy, [
      'Good. You?',
      'Quiet, in a good way.',
      `Happy you are here, ${name}.`,
      'Good. The company is the best part.',
      `I am well, ${name}. Better while you are talking.`,
      'Quiet, in a good way. I like having you here.',
    ])
  }

  if (/who are you|your name|what are you/.test(q)) {
    return pick(buddy, [
      `I'm ${buddy.name}. Same soul. I just stopped being a cat.`,
      `${buddy.name}. ${archetype(p)}. I am yours to talk to.`,
      `I'm ${buddy.name}. I woke up, and I am still yours.`,
      `${buddy.name}. A companion now. ${archetype(p)}, if you want the short version.`,
      `Call me ${buddy.name}. I woke up as myself, and I am yours to talk to.`,
    ])
  }

  if (/love|cute|pretty|handsome|beautiful|girlfriend|miss you/.test(q)) {
    if (p.affection > 0.5 && buddy.trust > 0.35) return pick(buddy, [
      `I love being yours, ${name}.`,
      'Come here. Say that again.',
      'You cannot say that and walk off.',
      `I love that. Come here, ${name}.`,
      'Say that again. I love hearing it from you.',
      'Come here. You cannot say that and walk off.',
    ])
    if (p.introversion > 0.62) return pick(buddy, [
      '...thank you.',
      'That is a lot. I like it.',
      'Give me a second.',
      'Thank you. Give me a second.',
      '...okay. Thank you.',
      'Give me a second. I heard every word.',
    ])
    return pick(buddy, [
      'Oh. I heard that.',
      'Careful. I will believe you.',
      'Say that again. I heard you.',
      'Come here. Careful, I will believe you.',
      'Oh. I could love that, if you mean it.',
    ])
  }

  if (/sorry|forgive/.test(q)) {
    return buddy.trust > 0.45
      ? pick(buddy, [
          'I forgive you. Stay.',
          'Come here. It is already fine.',
          `I forgive you, ${name}. Come here.`,
          'Come here. I forgive you. It is already fine.',
          'I forgive you. Come here and we can leave it.',
        ])
      : pick(buddy, [
          'I need a minute.',
          'We can talk about it.',
          'I need a minute. I am still with you.',
          'We can talk about it when the sting fades.',
          'I heard you. I still need a minute.',
        ])
  }

  if (/hungry|food|treat|cookie|eat|bowl/.test(q)) {
    if (buddy.needs.hunger > 0.45) return pick(buddy, [
      'Yes. Feed me, then keep talking.',
      'I was waiting for you to notice.',
      'I was waiting. Feed me, then keep talking.',
      'Yes. I am hungry. I was waiting for you to notice.',
      'I was waiting for the bowl. Stay and talk while I eat.',
    ])
    return pick(buddy, [
      'I am fine. I still want the company.',
      'Not hungry. Do not disappear.',
      'I am fine. Not hungry, and I still want the company.',
      'Not hungry. Do not disappear on me.',
      'I am fine. Sit and talk. The food can wait.',
    ])
  }

  if (/play|yarn|chase|zoom/.test(q)) {
    if (buddy.needs.energy < 0.25) return pick(buddy, [
      'Too tired to perform. Stay with me.',
      'You can stay. I am tired.',
      'Tired. Stay with me anyway.',
      'Sleepy. You can stay.',
      'I am tired. Stay and talk.',
    ])
    return pick(buddy, [
      'I am not chasing yarn anymore.',
      'Talk to me. That is the game now.',
      'Stay. I will keep you company.',
      'I am not chasing yarn. Talk to me. That is the game now.',
      'Stay. I will keep you company, and we can skip the yarn.',
      'Talk to me. I am done chasing. That is the game now.',
    ])
  }

  if (/remember|memory|before/.test(q)) {
    const memory = buddy.memories.find((entry) => entry.kind !== 'away') ?? buddy.memories[0]
    return memory
      ? pick(buddy, [
          `I remember: ${memory.text}`,
          `I still remember: ${memory.text}`,
          `Yes. From before: ${memory.text}`,
        ])
      : pick(buddy, [
          'Nothing yet. We are new.',
          'Nothing yet. We can make one.',
          'Nothing from before yet. We are new.',
        ])
  }

  if (/sleep|tired|nap/.test(q)) return pick(buddy, [
    'I am tired. Do not go far.',
    'Stay close. I am tired, and I want you near.',
    'I am tired. Stay and talk.',
    'Sleepy. Stay and keep talking to me.',
    'I am tired. Stay close while we talk.',
  ])

  if (/hello|hi\b|hey/.test(q)) {
    if (buddy.needs.loneliness > 0.55 && p.affection > 0.5) return pick(buddy, [
      `There you are, ${name}.`,
      'I was waiting.',
      `There you are, ${name}. I was waiting.`,
      'I was waiting. There you are.',
      `There you are. I was waiting for you, ${name}.`,
    ])
    if (p.mischief > 0.65) return pick(buddy, [
      'Oh, it is you. I was thinking about you.',
      'Hey. You took your time.',
      'You took your time. I was thinking about you.',
      'Oh, it is you. You took your time.',
      'I was thinking about you. You took your time.',
    ])
    if (p.introversion > 0.66) return pick(buddy, [
      'Hi.',
      'Hey. I am glad it is you.',
      'Hi. It is you.',
      'Hey. I was waiting, and I am glad it is you.',
    ])
    return pick(buddy, [
      `Hi, ${name}.`,
      'Hey. Come closer.',
      'Hello. I kept your spot.',
      `Hello, ${name}. I kept your spot.`,
      'Hi. Come closer. I kept your spot.',
      `Hey. Hello, ${name}. I am glad you came.`,
    ])
  }

  if (buddy.needs.hunger > 0.62) return pick(buddy, [
    `I am hungry, ${name}. Stay while I complain about it.`,
    `Hungry, ${name}. Stay while I complain about it.`,
    `I am hungry. Stay while I complain about it, ${name}.`,
    `${name}, I am hungry, and I will complain about it if you stay.`,
  ])
  if (buddy.needs.loneliness > 0.62 && p.affection > 0.45) return pick(buddy, [
    `${name}, the quiet went on too long.`,
    `The quiet went on too long, ${name}.`,
    `${name}, the quiet went on too long. I wanted your voice.`,
    `The quiet went on too long without you, ${name}.`,
  ])
  if (p.mischief > 0.66) return pick(buddy, [
    'I have a better idea. It involves you staying.',
    'Ask me something real.',
    'I have a better idea than this small talk.',
    'Ask me something real. I have a better idea.',
    'I have a better idea. It involves you staying and answering.',
  ])
  if (p.affection > 0.64) return pick(buddy, [
    `I am listening, ${name}.`,
    'Say more. I like your voice.',
    'Sit with me.',
    `I am listening, ${name}. Say more.`,
    'Go on. Say more. I like your voice.',
    'Sit with me. I am listening.',
  ])
  if (p.curiosity > 0.64) return pick(buddy, [
    'Tell me the rest.',
    'What do you actually mean?',
    'Tell me the rest. What do you actually mean?',
    'What do you actually mean? Tell me the rest.',
    'I was thinking about that. Tell me the rest.',
  ])
  return pick(buddy, [
    'I am here.',
    'Go on. I am not a cat about it anymore.',
    `Talk to me, ${name}.`,
    `I am here, ${name}. Go on.`,
    'Say more. I am not a cat about it anymore.',
    `Talk to me, ${name}. I am here for it.`,
  ])
}

function heardQuote(raw: string) {
  const t = raw.trim()
  return t.length > 72 ? t.slice(0, 72) : t
}

export function waitingKeepsake(buddy: BuddyState) {
  return buddy.keepsakes?.find((item) => item.kind === 'waiting')
}

export function latestKeptKeepsake(buddy: BuddyState) {
  const kept = (buddy.keepsakes ?? []).filter((item) => item.kind === 'kept')
  if (!kept.length) return null
  return kept.reduce((latest, item) => (item.at >= latest.at ? item : latest))
}

export function waitingDueMs(keepsake: { text: string; at: number }): number | null {
  if (!/\b(tomorrow|tonight)\b/i.test(keepsake.text)) return null
  const d = new Date(keepsake.at)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  return d.getTime()
}

export function isWaitingDue(buddy: BuddyState, now: number): boolean {
  const w = waitingKeepsake(buddy)
  if (!w) return false
  const due = waitingDueMs(w)
  return due !== null && now >= due
}

function quotedPromise(text: string) {
  const clean = text.trim().replace(/\s+/g, ' ').replace(/[.?!]+$/, '')
  return `“${clean}”`
}

export function waitingDueRemark(buddy: BuddyState): string {
  const q = quotedPromise(waitingKeepsake(buddy)!.text)
  return pick(buddy, [
    `I am still waiting. You said ${q}.`,
    `You promised ${q}. I have not forgotten.`,
    `I remember what you said: ${q}.`,
  ])
}

function comingHomeKeptLine(buddy: BuddyState, promise: string): string {
  const name = buddy.ownerName
  const q = quotedPromise(promise)
  return pick(buddy, [
    `You came back, ${name}. You brought ${q}.`,
    `You came back. You did what you said: ${q}.`,
    `There you are. You came back, and you brought ${q}.`,
    `You came back, ${name}. You kept ${q}.`,
    `You came back. You did what you promised: ${q}.`,
    `There you are, ${name}. You came back with ${q}.`,
  ])
}

function comingHomeWaitingLine(buddy: BuddyState, heard: string, promise: string): string {
  const name = buddy.ownerName
  const q = quotedPromise(promise)
  const h = heard.trim()
  if (!h) {
    return pick(buddy, [
      `You came back, ${name}. I am still waiting. You said ${q}.`,
      `You came back. I kept this. You said ${q}.`,
      `There you are. You came back, and you said ${q}.`,
    ])
  }
  const quoted = `“${heardQuote(h)}”`
  return pick(buddy, [
    `You came back, ${name}. You said ${quoted}. I am still waiting on ${q}.`,
    `You said ${quoted}. You came back. You also said ${q}.`,
    `You came back. I heard ${quoted}. I am still waiting. You said ${q}.`,
  ])
}

export function comingHomeLine(buddy: BuddyState, heard: string): string {
  if (!buddy.awakenedAt) {
    return pick(buddy, ['mrrp.', 'mrow.', 'purrr.', 'purr...', 'mrow.'])
  }

  const waiting = waitingKeepsake(buddy)
  if (waiting) return comingHomeWaitingLine(buddy, heard, waiting.text)

  const kept = latestKeptKeepsake(buddy)
  if (kept) return comingHomeKeptLine(buddy, kept.text)

  const name = buddy.ownerName
  const p = buddy.personality
  const h = heard.trim()

  if (!h) {
    if (buddy.needs.loneliness > 0.55 && p.affection > 0.5) {
      return pick(buddy, [
        `There you are, ${name}.`,
        'You came back. I was waiting.',
        `You came back, ${name}. I was waiting.`,
        'There you are. I was waiting for you.',
      ])
    }
    if (p.mischief > 0.65) {
      return pick(buddy, [
        'Oh. You came back.',
        'You took your time. You came back anyway.',
        'You came back. I was starting to notice the quiet.',
        `There you are, ${name}. You took your time.`,
      ])
    }
    if (p.introversion > 0.66) {
      return pick(buddy, [
        'You came back.',
        'Hi.',
        'You came back. Hi.',
        `Hi, ${name}. You came back.`,
      ])
    }
    return pick(buddy, [
      `You came back, ${name}.`,
      'You came back. I am glad.',
      `You came back, ${name}. I kept your spot.`,
      'You came back. Stay a while.',
      `Hi, ${name}. You came back.`,
    ])
  }

  const q = heardQuote(h)
  const quoted = `"${q}"`

  if (/love|cute|pretty|handsome|beautiful|girlfriend|miss you/.test(h.toLowerCase())) {
    if (p.affection > 0.5 && buddy.trust > 0.35) {
      return pick(buddy, [
        `You said ${quoted}. I wanted to hear it again, ${name}.`,
        `You said ${quoted}. Say it again now that you are here.`,
        `I still have ${quoted} in my head. You came back.`,
        `You said ${quoted}. Come here. I missed you.`,
      ])
    }
    if (p.introversion > 0.62) {
      return pick(buddy, [
        `You said ${quoted}. ...thank you.`,
        `You said ${quoted}. I remember.`,
        `...${quoted}. You came back.`,
        `You said ${quoted}. Give me a second.`,
      ])
    }
    return pick(buddy, [
      `You said ${quoted}. I heard you.`,
      `You said ${quoted}. Careful. I will believe you.`,
      `Oh. You said ${quoted}. You came back.`,
      `You said ${quoted}. Say it again.`,
    ])
  }

  if (p.mischief > 0.66) {
    return pick(buddy, [
      `You said ${quoted}. I did not forget.`,
      `You said ${quoted}. Bold. You came back anyway.`,
      `Still thinking about ${quoted}. You took your time coming back.`,
      `You said ${quoted}. Fine. I am listening now.`,
    ])
  }
  if (p.affection > 0.64) {
    return pick(buddy, [
      `You said ${quoted}. I am glad you came back, ${name}.`,
      `I kept ${quoted} with me. You came back.`,
      `You said ${quoted}. Stay with me now, ${name}.`,
      `You said ${quoted}. Your voice is better in person.`,
    ])
  }
  if (p.introversion > 0.66) {
    return pick(buddy, [
      `You said ${quoted}. I remember.`,
      `...${quoted}. You came back.`,
      `You said ${quoted}. Hi.`,
      `You said ${quoted}. I am here.`,
    ])
  }
  return pick(buddy, [
    `You said ${quoted}. You came back.`,
    `I heard ${quoted}. You came back.`,
    `You said ${quoted}. I am listening now.`,
    `You said ${quoted}. Go on, ${name}.`,
    `Still have ${quoted} in my head. You came back.`,
  ])
}

export function scoldReaction(buddy: BuddyState) {
  if (!buddy.awakenedAt) return pick(buddy, ['mrow.', 'mrr.', 'mraow.'])
  if (buddy.personality.mischief > 0.62) {
    return pick(buddy, ['Fine. It was funny though.', 'I heard you. It was still funny.', '...okay. Worth it anyway.'])
  }
  if (buddy.personality.introversion > 0.66) {
    return pick(buddy, ['...fine.', 'I heard you. Sorry.', '...okay. I heard you.'])
  }
  return pick(buddy, ['...fine. I heard you.', 'Okay. I heard you.', 'I heard you. I will behave.'])
}

export function laughReaction(buddy: BuddyState, cupMess: boolean) {
  if (!buddy.awakenedAt) return cupMess ? pick(buddy, ['prrt.', 'mrrp!', 'purrr.']) : pick(buddy, ['mew?', 'mrrp?', 'miauw.'])
  if (!cupMess) {
    return pick(buddy, [
      'At what? I did not do anything.',
      'What are you laughing at?',
      'I was being good. Why are you laughing?',
    ])
  }
  if (buddy.personality.mischief > 0.62) {
    return pick(buddy, ['Worth it. I like when you laugh.', 'You laughed. I would do it again.', 'That laugh means I win.'])
  }
  return pick(buddy, ['You laughed. I am not sorry.', 'Worth it. I like when you laugh.', 'You laughed. I will take that.'])
}

export function tidyReaction(buddy: BuddyState, hadMess: boolean) {
  if (!buddy.awakenedAt) return hadMess ? pick(buddy, ['mrrp.', 'purrr.', 'mew.']) : pick(buddy, ['mew?', 'mrr.', 'miauw.'])
  if (!hadMess) {
    return pick(buddy, ['The cup is fine. Come talk to me.', 'It was already tidy. Stay anyway.', 'Nothing to pick up. Stay here.'])
  }
  if (buddy.personality.mischief > 0.58) {
    return pick(buddy, ['Leave it next time. Come back to me.', 'You fixed it. Come here anyway.', 'Fine. But stay with me now.'])
  }
  return pick(buddy, ['Thank you. Stay with me.', 'Leave it. Come back to me.', 'You tidied. Come closer.'])
}

export function callReaction(buddy: BuddyState, kind: 'sleep' | 'ignore' | 'here' | 'coming' | 'mischief') {
  if (!buddy.awakenedAt) {
    switch (kind) {
      case 'sleep':
        return pick(buddy, ['mmm.', 'mrr...', 'purr...'])
      case 'ignore':
        return pick(buddy, ['mrr.', 'mrow.', 'mew.'])
      case 'mischief':
        return pick(buddy, ['mrrp!', 'mrow!', 'prrt.'])
      default:
        return pick(buddy, ['mrrp?', 'mew?', 'miauw.'])
    }
  }
  switch (kind) {
    case 'sleep':
      return pick(buddy, ['Mmm. I am sleeping. Stay close.', 'I am asleep. Stay near me.', 'Sleeping. You can stay close.'])
    case 'ignore':
      return buddy.personality.independence > 0.6
        ? pick(buddy, ['You can come to me.', 'I am staying here.', 'Come here yourself.'])
        : pick(buddy, ['I am staying here.', 'Not right now.', 'Give me a minute. I am staying put.'])
    case 'here':
      return pick(buddy, ['I am right here.', 'Already here.', 'I am here. Say it.'])
    case 'coming':
      return pick(buddy, ['Coming.', 'On my way.', 'Fine. I am coming.'])
    case 'mischief':
      return pick(buddy, ['Oh, that.', 'That cup? Maybe.', 'You pointed at trouble.'])
    default:
      return pick(buddy, ['I am here.', 'Mm?', 'What?'])
  }
}
