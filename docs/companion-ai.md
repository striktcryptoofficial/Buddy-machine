# The companion

The plan is a real AI pet. What runs today is the game engine: her numbers, her needs, Lily’s clips, and a script she speaks from. The mind is the part still to connect.

Many people will connect a wallet and hatch. Her life cannot live in one browser. Each cat is one record on a server, keyed by the wallet that hatched her. Two screens on the same wallet see the same hunger, the same memories, and the same last thing she said. A second wallet is a second cat. The page is the glass they look through.

The chain records the hatch. The server keeps the life. The model writes the sentence. The glass plays it.

## Where each piece lives

| Piece | Where it lives |
| --- | --- |
| The machine, the camera, Lily’s clips | The browser. `lilyPick` chooses the frames. |
| Coat, DNA, personality numbers | Math from the wallet, checked by the server. Written once. |
| Hatch | The wallet signs. The chain confirms. The server stores the cat only after that. |
| Needs, mood, trust, memories, journal | The server. One row per wallet. |
| A reply | The server calls Anthropic, then sends the line back. |
| Fights, expeditions, holder tier | The server, when those exist. The model may comment after. |
| The script in `dialogue.ts` | Fallback, when the call fails. She still speaks. |

Today the save is `buddy-ai-v4` in this browser’s localStorage. That key stays while the engine is single-player. The server replaces it as the record once wallets hatch for real. Hunger, mood, and the speech bubble stay off the chain. They move from this browser to the server, not onto a transaction.

## One vendor, two mouths

Get an Anthropic API key. It lives on the server. The page never sees it.

Claude Haiku speaks while she is a cat. One short line. She still hears what was said, and she still sounds hungry, lonely, or pleased from the numbers the engine already has. A meow is allowed. This is a real reply with a small mouth.

Claude Sonnet speaks after she awakens. Same name, same personality numbers, same memories. She has room to answer, and she can bring up a bond, a moment, a habit, or a time the owner was away, because the server already stored those. Awakening is the deep companion. The cat is the same soul, earlier.

One company, so the voice grows up instead of changing brands. There is no model trained per cat, and no second vendor.

## The talk door

The browser sends a packet. The server calls Claude. The browser receives a line and a moment, and plays them.

The packet carries:

- Her name, the owner’s name, and the six personality numbers.
- Hunger, energy, happiness, loneliness, mood, and what she is doing.
- Whether she is still a cat or already Lily.
- A few memories the engine wrote: `bond`, `moment`, `habit`, `away`.
- The line the owner just said.

Claude returns a sentence and one moment Lily can already play: `live`, `talk`, `approach`, `win`, `loss`, `awaken`, `eat`, `sleep`. `lilyPick` chooses the clip. The server writes any real change. A mood word is not permission to edit her DNA, her trust, or a fight.

If the key is missing or Anthropic is down, `dialogue.ts` answers. A failed call never leaves her silent.

## What the model does not decide

The server keeps these, and the model only reads them:

- Coat, DNA, and the personality numbers.
- Hatch, needs, trust, and the awakening flag.
- Fights, pots, expeditions, and the wallet.
- Which clip plays.

A holder tier, later, buys more lines in a day. That cap is how the server spends the key. It does not change her coat, her stats, or who takes a pot.

## Order of work

1. **The key.** An Anthropic account. The key stays on the server.
2. **The record.** A server that stores one cat per wallet and exposes one talk route. The browser stops being the save.
3. **The cat.** Haiku. She answers from her needs and from what was just said.
4. **Lily.** Sonnet, with the memories the server already keeps. This is the voice the deeper prompt is written for.
5. **The cap.** A daily limit on lines. Later it grows with the holding, and the server is the one that counts.

The cat is connected first, so she can be spoken to while she is still small. The door is built once. Her voice gets deeper when she awakens. Every wallet that hatches later uses that same door.

## Prepared

`server/talk.mjs` is that door. It listens on `127.0.0.1:8787`. The page asks `/api/talk`, and Vite forwards that to the door. Copy `.env.example` to `.env` and put the Anthropic key there. Then run `npm run talk` beside the page.

With a key, a cat gets Haiku and an awakened Lily gets Sonnet. The reply is a line plus a moment: `talk`, `live`, `approach`, `eat`, or `sleep`. She still cannot set awakening, DNA, or a fight. Forty cat lines or twenty Lily lines per creature per day, then the script answers. No key, a failed call, or a full cap does the same: `dialogue.ts` speaks, and the key never reaches the browser.

The life is still `buddy-ai-v4` in this browser until wallets hatch for real. The talk route already takes a creature id, so the same door counts lines per cat when the record moves to the server.

## What it costs

The server always runs. The model does not have to live on that same machine. Renting a GPU to host an open model costs money every hour, including the hours nobody talks. Anthropic charges for the tokens in a line, and nothing when the machine is quiet.

List prices, Claude API, October 2026. Haiku 5.5 is $0.10 per million input tokens and $0.50 per million output tokens on a short prompt. Sonnet 5.5 is $2 and $10. A cat line is a few hundred tokens in and a few dozen out. A Lily line is longer. Worked example, not a quote:

| Voice | About one line | A chatty day | A month of that day |
| --- | --- | --- | --- |
| Cat, Haiku, ~600 in and ~30 out | $0.00008 | 30 lines, well under a cent | Under $0.10 |
| Lily, Sonnet, ~1,200 in and ~180 out | $0.004 | 15 lines, about $0.06 | About $2 |

A thousand people talking to an awakened Lily at that cap is on the order of $2,000 a month. A thousand people only poking the cat is a few dollars. The cap in step 5 is the cost control. Holding buys more lines. It does not buy an uncapped Sonnet.

A self-hosted model, the kind [Open-LLM-VTuber](https://docs.llmvtuber.com/en/docs/intro/) runs through Ollama for one desktop pet, becomes cheaper than Haiku only after millions of cat lines a month. One always-on GPU is a few hundred dollars whether or not anyone hatches. That project is one person, one Live2D body, voice in and voice out, on their own computer. It can point at Claude, and it can point at a local model. It is not the server many wallets hatch into, and it is not her body. Lily’s clips stay ours. The useful piece is the swap: the talk door takes a provider, it does not marry one app.

So the cheap shape for a crowd is the reverse of a GPU in the closet.

- The cat speaks through Haiku. That bill stays small far past the first players.
- Lily speaks through Sonnet, inside the daily cap. That is the bill worth watching.
- A smaller open model on the server replaces the cat only when the Haiku bill is larger than the GPU. It does not replace Sonnet for the girl.
- A cheaper hosted model can take Lily’s ordinary chatter later, if Sonnet is being spent on small talk. Sonnet stays on the lines that matter: coming home, a memory, the day she awakens.
