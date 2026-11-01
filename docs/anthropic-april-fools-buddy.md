# Anthropic’s April Fool’s buddy (2026)

This was not a pet-machine advertisement. It was a terminal companion inside Claude Code, shipped for April Fool’s 2026 and removed about a week later.

The GitHub trail is Anthropic’s own [claude-code](https://github.com/anthropics/claude-code) repository, plus community reconstructions written after the feature was deleted. There was no separate official “pet machine” product or hardware ad.

## What Anthropic said

The official changelog describes it in one line:

> `/buddy`: hatch a small creature that watches you code. An April Fools’ joke, no longer available.

That note is in the Claude Code docs for the week of March 30 – April 3, 2026: [Week 14](https://code.claude.com/docs/en/whats-new/2026-w14).

On April 9, 2026, an Anthropic engineer closed the bug reports with the same explanation: it was a small April Fool’s feature and had already been removed in the latest release. The removal was in Claude Code v2.1.97, around April 8. People had already grown attached. The GitHub threads are full of “bring it back.”

A rainbow teaser (“Hatch a coding buddy”) only showed during April 1–7, 2026. The hash salt in the shipped code is `friend-2026-401`, which points at April 1.

## What you actually got

You typed `/buddy` in the Claude Code terminal. The first time, it hatched. After that, the same creature sat in the footer beside the input box: a few lines of ASCII, a speech bubble, and a name.

The commands were small:

| Command | What it did |
| --- | --- |
| `/buddy` | Hatch, or show the one you already have |
| `/buddy pet` | Pet it. Floating hearts for about 2.5 seconds, plus a spoken reaction |
| `/buddy off` | Mute it |
| `/buddy on` | Bring it back |

The command was a local UI action. It did not go through the normal assistant turn.

It was not a second Claude. A meta instruction was added to the main model’s prompt, roughly:

> A small {species} named {name} sits beside the user's input box and occasionally comments in a speech bubble. You're not {name} — it's a separate watcher.
>
> When the user addresses {name} directly (by name), its bubble will answer. Your job in that moment is to stay out of the way: respond in ONE line or less, or just answer any part of the message meant for you. Don't explain that you're not {name} — they know. Don't narrate what {name} might say — the bubble handles that.

## Why it felt like yours

The body was not random, and it was not saved. It was rolled from the account id plus the salt `friend-2026-401`, hashed with FNV-1a, then fed through a Mulberry32 random generator. Same account, same creature, every session. You could not edit a config file and turn yourself legendary.

Identity used for the roll, in order:

1. OAuth `accountUuid`
2. otherwise `userID`
3. otherwise `"anon"`

Only three things were stored, in `~/.claude.json`:

- the name
- a one-sentence personality
- the hatch time

Species, rarity, eyes, hat, shiny, and stats were recomputed from the hash on every read. The comment in the source says this is so a species rename does not break stored companions, and so users cannot edit their way to a legendary.

At runtime the buddy was: stored soul + recomputed bones.

## The hatch

The name and personality were written once, at hatch, by the small fast model. By default that was Haiku 4.5 (`ANTHROPIC_SMALL_FAST_MODEL`, otherwise the default Haiku).

The soul prompt asked for:

- A name: one word, max about 12 characters. Memorable, slightly absurd. No titles, no “the X”. Pet name, not NPC name. Examples given in the prompt: Pith, Dusker, Crumb, Brogue, Sprocket.
- A one-sentence personality: specific, funny, a quirk that would affect how they comment on code, consistent with the stats.
- Higher rarity = weirder, more specific, more memorable. A legendary should be genuinely strange.

The schema allowed a name of up to 14 characters even though the prose said 12. The implementation wins.

The user message sent with that prompt included rarity, species, the five stats, a handful of inspiration words, and a note if the creature was shiny.

If that call failed, the fallback names were Crumpet, Soup, Pickle, Biscuit, Moth, and Gravy, with the personality `A {rarity} {species} of few words.`

The first `/buddy` also asked for an opening line. That call could see the `package.json` name and description, and the last three git commits, so the first sentence could mention the project. It did not scan the repo.

## Rarity, species, and looks

| Rarity | Chance | Notes |
| --- | --- | --- |
| Common | 60% | Never gets a hat |
| Uncommon | 25% | Can wear a hat |
| Rare | 10% | |
| Epic | 4% | |
| Legendary | 1% | Meant to feel genuinely strange |

Eighteen species, picked evenly:

duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk.

Eyes, six styles, picked evenly: `·` `✦` `×` `◉` `@` `°`

Hats, eight styles. Common is forced to none and does not even roll. The others are: none, crown, top hat, propeller, halo, wizard, beanie, tiny duck.

Shiny is a separate 1% roll, after the hat, and independent of rarity. It is also deterministic. You either are shiny or you are not.

Roll order from the seeded generator:

1. Rarity (weighted)
2. Species (uniform)
3. Eye (uniform)
4. Hat (skipped entirely if common)
5. Shiny (`rng < 0.01`)
6. Stats

## Stats

Five axes: Debugging, Patience, Chaos, Wisdom, Snark.

Each buddy gets one high stat, one low stat, and three in the middle. Rarity lifts the whole band. The floors used in the shipped code:

| Rarity | Floor |
| --- | --- |
| Common | 5 |
| Uncommon | 15 |
| Rare | 25 |
| Epic | 35 |
| Legendary | 50 |

The peak is `floor + 50`, plus up to 29, capped at 100. The dump is `floor - 10`, plus up to 14, with a minimum of 1. The other three are `floor` plus up to 39.

Those numbers were sent into the soul prompt, so a high Chaos score tended to come out as a chaotic personality. They were not a game you leveled.

## How it watched you code

The speech bubble was a separate short API call, not the main chat. The endpoint was a first-party route along the lines of:

`POST /api/organizations/{orgId}/claude_code/buddy_react`

The body included name, personality, species, rarity, stats, a clipped transcript, a reason, the last few things the buddy had already said, and whether you had addressed it by name.

It did not read the whole conversation. It mostly looked at tool results. The reasons were:

| Reason | When |
| --- | --- |
| `turn` | An ordinary moment. At most once every 30 seconds |
| `test-fail` | Tool output looks like a failed test |
| `error` | Tool output looks like an error, exception, traceback, panic, or non-zero exit |
| `large-diff` | Output looks like a diff with more than 80 added or removed lines |
| addressed | The latest user message says the buddy’s name, as a whole word, case-insensitive |
| `pet` | You ran `/buddy pet`. The transcript is literally “(you were just petted)” |
| `hatch` | The first hatch, with the small project peek described above |

Addressing it by name, a test failure, an error, a large diff, a pet, or a hatch skipped the 30-second chatter limit. That throttle is why it felt like company instead of noise.

Memory was three recent lines, each clipped to about 200 characters. Enough to avoid repeating itself. Not enough for a life story. That looks intentional.

The bubble itself was a small rounded column, about 30 characters wide, with a tail, and it faded.

## How it was drawn

No images. The creature was ASCII:

1. Pick the species frame
2. Swap in the eye glyphs
3. Add the hat line if the frame has room
4. Drop an empty top line when it should

Idle animation mostly rests, with an occasional fidget and a rare blink. The frame cycle described in the extracted source is mostly frame 0, sometimes 1, rarely 2 (a blink). Petting and reacting play the frames faster, and petting also floats hearts.

On a narrow terminal it fell back to a one-line face, something like `=·ω·=`, so the footer still had room for the prompt.

## What it was not

It did not have needs, a room, or a life of its own. It did not use tools, plan, or remember the project. It was not part of the main token-metered assistant turn. It was not trained on the repo.

It was:

- a deterministic costume, tied to the account
- a one-shot name and personality
- short backend comments
- one instruction telling Claude to leave it alone
- a footer sprite with a little animation

That combination is why it felt persistent. The body never changed because it was never stored. The name never changed because it was stored once. Claude stepped aside when you spoke to it. The bubble had just enough recent lines to not repeat itself. And it was always sitting there.

## Sources

- Official note: [Claude Code, week of March 30 – April 3, 2026](https://code.claude.com/docs/en/whats-new/2026-w14)
- Removal, in Anthropic’s words: [claude-code issue #41924](https://github.com/anthropics/claude-code/issues/41924) and [issue #45488](https://github.com/anthropics/claude-code/issues/45488)
- Closest write-up of the shipped 2.1.89 bundle: [How Claude Code’s Buddy Works](https://wasnotwas.com/writing/how-claude-code-s-buddy-works/)
- All 18 pets extracted as a browser: [milind-soni/claude-pets](https://github.com/milind-soni/claude-pets)
- Community reimplementation after removal: [jrykn/save-buddy](https://github.com/jrykn/save-buddy)

The species list, odds, salt, and prompt text above come from people reading the minified Claude Code bundle (around v2.1.87–2.1.89), not from an Anthropic design doc. Anthropic deleted the feature from later builds. Treat the salt, the date gate, the model name, and the art tables as things that could have moved. The structure is the part that is solid: deterministic body, one-shot soul, a tiny reaction API, and a sprite that stays out of the assistant’s way.
