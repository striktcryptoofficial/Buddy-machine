# CRITTERS

Working name. An AI creature economy, and a Web3 game.

Think Tamagotchi, plus Pokémon, plus AI agents, plus NFT battles.

The product that exists is the machine. The cat already lives on its glass. Awakening happens on that same glass. Care is the Tamagotchi. The fight is the Pokémon battle, settled in SOL. The voice is the agent. The wallet owns the result. There is no second screen and no second device.

What ships is four steps.

- **Hatch.** One cat for the wallet. She appears on the machine the way she already does.
- **Care.** Feed her and show up. Hunger, energy, trust, and the journal are the life. Holding the project token makes food and crystals a little easier. A bigger bag does not make her hit harder.
- **Fight.** One SOL table. Both sides lock a buy-in. The winner takes the pot, minus a small cut. She has to be awake and fed, or the machine does not take the money.
- **Wake.** On that glass, the cat settles and the next frame is the girl. Same name, same stats, same wallet. Hair and clothes come from the cat she was.

The girl is `awakenedLook` of the DNA the machine already computed. The flag is `awakened`. The rest of this document is the life behind those four steps, then ideas that wait until the glass is enough.

Every creature has a soul. Every soul has a value. Every battle creates history.

At launch, one wallet hatches one soulbound cat. The owner develops her, rests her, trains her, and battles other cats. Equipment, and later other souls, are what a collection is made of. The chain records the hatch, the moments that should outlive the browser, and one flag: `awakened`.

The AI gives her a personality and makes her feel alive. The personality numbers are rolled at hatch. The model speaks from them. It does not roll the soul, and it does not set the flag.

The original Buddy implementation is the starting architecture: deterministic appearance, rarity, a generated personality, traits, and a lightweight reaction system. Awakening is the last form of that same cat.

## 1. How the creatures work

Each creature is generated when a user hatches an egg.

| Attribute | Example |
| --- | --- |
| Species | The cat, first. Other species later, each with its own base |
| Rarity | Common to Legendary |
| Personality | Rolled at hatch: mischief, affection, introversion, vigor, curiosity, independence |
| Strength | Fed by vigor |
| Intelligence | Fed by curiosity |
| Speed | Fed by vigor and mischief |
| Defense | Fed by independence |
| Luck | Fed by rarity, as a small nudge |
| Special ability | A title earned from history, spoken in her voice |
| Evolution | Cat. Last form: awakened |

The table is the later arena language. The cat already has the inputs. `makeDna(visualSeed)` fixes the coat, the pattern, the eyes, the accessory, the mutations, and the rarity. A separate `lifeSeed` fixes the name and the six traits. Needs, mood, trust, and the journal move every day. Awakening reads those. It does not add a gene, and it does not replace one.

There are two layers.

- **On-chain identity.** One soulbound cat. The hatch, the name, the record of finished scraps and seasons, and the `awakened` flag. The coat is not stored. Anyone recomputes `makeDna` from the wallet, and `awakenedLook` from that DNA.
- **Off-chain intelligence.** Personality, conversations, the clips, decisions, and reactions. Hunger, mood, and the speech bubble stay off the chain.

That split keeps transactions affordable and still lets her behave intelligently.

Identity is one soul and two presentations. The presentation is the pixel cat, or Lily dyed from that cat. The genes on the morning she wakes are the genes she had the night before.

### The personality is the point

Three users can each have a gold cat.

- One is full of mischief and knocks the cup over.
- One is introverted and leaves when the room is busy.
- One is curious and lives at the window.

They should not feel like the same character with a different coat. After they wake, they still should not. A mischievous cat becomes a girl who teases. An introverted cat becomes a girl who still leaves the room. The form changes the clips. The traits stay.

The personality is used for dialogue, reactions, animations, and behaviour. She remembers her owner, her victories, her defeats, the days she was hungry, and the events that mattered. Waking does not clear that store. On the first morning she can read it back.

## 2. Staking as missions

Traditional NFT staking, where a deposit pays tokens every day, is the wrong shape.

At launch, staking is rest. The owner locks this cat. The machine shows her asleep. Awake, those are the Tired clips. Actions that spend energy are refused. Hunger still rises, so a month of ignoring her is not free. Energy refills on the same clock in either form. Unstaking early wakes her tired. Rest returns the same NFT. Being awake does not pay a yield, and it does not stack with rest.

Creature Missions are the later replacement for a second casino. The user assigns her to an activity. The choice matters, because each activity has different risks and rewards. The rewards do not rise when she wakes.

| Activity | Both forms | What changes when she is awake |
| --- | --- | --- |
| Training | The same attribute gains | The drills play on her clips |
| Mining | The same crystals | The yield is unchanged |
| Exploration | The same finds | She can read a sign. The loot table stays |
| Arena | The same scrap, the same energy cost | Clips replace the flail. See section 3 |
| Research | The same abilities training can reach | She reads. As a cat she sat on the books. The destination is the same |
| Defence | One creature on the watch | She is a face on the roster |
| Escort | A bond memory for both, when breeding is still closed | She walks another owner's cat. The reward is the memory |
| Breeding | Closed at launch | Later it passes cat genes. See section 4 |

A mining shift might generate 15 crystals for a cat and 15 for the girl. A training shift might raise vigor. An exploration might find a charm or a hard day. The journal line is the part that counts toward waking. No mission pays out the form, and no fee shortens the road.

Personality still refuses work, in either form. Low energy and low vigor turn a drill down. High introversion balks at a crowded route. High independence balks at a clan she has not bonded with. A sleeping girl cannot be sent out, the same way a sleeping cat cannot.

## 3. Battles

Battles are the main attraction. Several formats can sit next to each other. She enters all of them with the numbers she had as a cat.

### A. 1v1 creature battles

Two users select their creatures. The engine considers vigor, mischief, independence, curiosity, affection, and introversion, plus energy, happiness, and hunger. Rarity is a nudge of a few percent. At roughly one legendary in twenty, a large rarity bonus would make the ladder a coat contest. Waking does not add a second nudge.

Mood shows up. Angry and excited show up. Sleepy and sad show up worse. A sleeping cat, and a sleeping girl, cannot be entered.

The AI can generate tactical talk and commentary. The outcome comes from a transparent battle engine. The engine does not read the `awakened` flag.

An illustrative match, not a live one: Noodle, gold, common, awake, against a lilac rare who is still a cat. The rare coat is a small edge. The day each of them is having does the rest. Prize pool 100 crystals. Entry fee 10 crystals.

What the screen plays:

| Moment | Cat | Awakened |
| --- | --- | --- |
| Approach | The flail | Threaten, or Disapprove if she would rather not |
| A win | She struts | Taunt, Happy |
| A loss | She is embarrassed | Cry, or she walks off if independence is high |
| A play-date | They sit together | Blush, the shy talk. A soft cat stays a soft girl |

Play-dates stay in the game so a soft soul is not a dead wallet. Affection is weak in a scrap and strong here. Both still gain a bond memory when they are not miserable.

### B. AI machine battles

Users do not pilot the body directly. They build a machine. Robot combat mixed with Pokémon.

Components:

- Weapons
- Armour
- Engines
- Energy cores
- AI processors
- Shields
- Special modules

She is the pilot personality, the way the cat was. A berserker loadout is still heavy weapons, low defence, high damage. A strategist loadout is still shields and counters. The machine fights on its own. Changing her form does not change a component.

The economy here is components and configurations. Her portrait on the pilot plate is the form she is in, with the cat in the corner.

### C. King of the Arena

There is one champion. Anyone can challenge it. Defeat the champion and you become the king. The king earns a portion of arena entry fees. The longer a soul stays champion, the more prestigious that reign is.

One ladder. A reign held after she woke is written as hers, and the cat years count inside it. Champion days show as a small mark beside the Lily clip, and as a line on the life card. The crown is that record. Daily, weekly, and monthly championships run beside the standing king, on the same ladder, so an awakened champion and a cat are trying for the same throne.

### D. Clan wars

Users form groups. Each clan has a territory and competes with other clans: territory, rankings, shared rewards, tournaments, and seasons. An awakened member is a face on the roster and the banner. She counts as one creature. A clan of girls is not a stronger clan than a clan of cats. The traits and the day decide it.

## 4. Evolution and breeding

History writes titles. The body stays the one the seed drew.

- A hundred scraps earns **battle-hardened**. On the card, and in the way she prefers Taunt. The trim can sit a shade darker, still inside the accent the coat already has.
- A long exploration record earns **explorer**. She prefers the curious clips. The card says so.
- A long, well-kept cat life earns **old house companion**. She has more of the journal to quote. The worn cushion stays in the room.

These are tells and records. They do not change `makeDna`, they do not grant a new sheet, and they do not raise a stat. High curiosity earns a scholar's way of talking. It does not earn a second body.

The cat's last form is the awakening in the next section. Other species, later, get their own base the same way. Until then the species is the cat.

Breeding is later, and it passes cat genes. Two DNA results, a controlled mutation, and a kitten. The child hatches as a cat and earns its own waking on its own life. A child does not hatch awake. At launch one wallet has one soulbound cat, so a pair mints nothing. When breeding exists, fees, cooldowns, and a capped supply keep the population in check. Each kitten needs its own wallet, because the seed is the wallet.

## 5. Awakening

When a cat reaches its ultimate form, it wakes up as a girl. Same soul, same name, same history. The cat stays on the life card and in the journal as the form she came from. The machine shows the girl after that.

The base is one character: Lily, the pixel pack in `Game engine/assets/lily`. One face, one body, the school uniform as painted (white shirt, red bow, black vest, gold trim, dark blue hair). About seventy clips, grouped by mood: idle, talk, wave, blush, cry, angry, eat, yawn, and the rest. Every awakened cat uses that pack. What changes is the dye, the outfit tier, and a few tells taken from the cat.

Lily is painted once. Hair, clothes, and trim are baked into every frame. There is no hair mesh and no outfit mesh. Do not generate a new girl per cat, and do not run an image model to recolor her. The first version is a palette remap of these frames. Extra silhouettes are a few painted sheets, not one drawing per seed.

### Seeded from the cat

`makeDna(visualSeed)` already fixes the coat, the eyes, the pattern, the accessory, the mutations, and the rarity. The girl is another pure function of that same DNA, `awakenedLook(dna)`. Awakening does not roll again. The same wallet always gets the same girl. Dye uses the visual seed. Clip preference uses the live personality, the same numbers `visualFor` already reads. Do not recolor her from `lifeSeed`.

Rarity does not pick a random palette. The coat picks the colors, so a gold cat does not wake up with purple hair. Rarity decides how much of that DNA is allowed to show, and which outfit she is wearing. It does not decide whether she can wake. A common cat wakes on the same terms as a legendary one.

| Cat gene | On the girl |
| --- | --- |
| Coat base | Hair color |
| Pattern | How the hair is dyed |
| Eye, and the other eye | Eye color. Heterochromia stays mismatched |
| Belly | Shirt and the inner layer |
| Spot | Second hair tone, and the darker cloth |
| Accent | Bow, trim, and small metal |
| Accessory | The same object, worn |
| Mutations | The tells below |
| Personality | Which idle and talk clips she prefers |

Pattern becomes a hair treatment, using colors the coat already has:

| Pattern | Hair |
| --- | --- |
| Solid | One tone, the coat |
| Tabby | The coat, with fine streaks. `stripeShift` moves them |
| Spots | The coat, with scattered lighter locks from the belly |
| Point | Dark hair with pale tips, the point colors reversed onto the hair |
| Calico, tortie | Split dye, base and spot |

Accessories move with her: a bow stays a bow, glasses stay glasses, a flower goes in the hair, a hat stays a hat, a scarf stays a scarf, a collar becomes a choker, a bandana becomes a neckerchief. No accessory means no extra object. The uniform's own bow is still there, dyed from the accent.

| Rarity | Hair | Outfit |
| --- | --- | --- |
| Common | One tone, the coat | Lily's uniform, recolored. Shirt from the belly, bow and trim from the accent, vest from a darkened coat |
| Uncommon | The coat, plus a streak from the belly | The same uniform, plus the cat's accessory |
| Rare | Two tones, base and spot. Calico and tortie are always split | A second cut in the same palette: the vest worn open, over the shirt |
| Legendary | Base, spot, and third. Star and luminous eyes show if the cat had them | An awakened cut. Same silhouette, ceremonial trim in the accent, mutation tells at full strength |

Two commons with different coats do not share a hair color. Two legendaries from the same coat family still differ, because the seed moved the hue, the eyes, and the accessory. Rarity changes the cut and how many of the cat's colors are allowed. It does not replace the coat. About 37% of seeds are common, 39% uncommon, 18% rare, and 5.5% legendary, so the ceremonial cut is uncommon on the ladder and ordinary in a fight.

### Mutations that survive

- **Heterochromia.** Different eyes.
- **Star.** A small mark in the hair.
- **Luminous.** The eyes keep a glow on the idle clips.
- **Twin tail.** A paired tie in the accent color. A real twin-tail hairstyle is a later sheet, not a recolor.
- **Mittens.** Light cuffs.
- **Fluffy.** A softer edge on the hair highlight.
- **Miniature, grand.** Scale only, the same way the cat already scales.
- **Big paws.** Stays on the card with the ears and the tail.

Ears, tail, and paws are not copied onto the body. The pack has no cat ears. They stay on the life card, so the origin is still visible. If a later sheet adds ears, they are an overlay on these same clips, dyed from the coat, and they are not required for the first version. Folded ears and a bob tail can raise her rarity and still stay off the sprite.

### Clips follow the mood

The machine already picks a face from mood, action, and personality. Awakened, that pick is a clip. `visualFor` resolves personality, then mood, then action. The clip picker follows that order.

| Mood or action | Clips |
| --- | --- |
| Content | Idle |
| Happy | Happy, Waving |
| Excited | Waving excited, Talk excited |
| Sad, lonely | Cry |
| Angry | Angry, Threaten, Disapprove |
| Sleepy, sleep | Tired. Rest uses these |
| Curious | Confused, Idea |
| Affectionate | Blush, Blow a kiss |
| Bored | Fish face, Facepalm |
| Eat | Eat |
| High mischief | Taunt, Silly, the scheming idle. Mischief picks these. There is no scheming trait |
| Talking | Talk. High introversion prefers the shy lines |

Personality breaks the tie inside a folder. A shy action, from high introversion, gets the shy wave and the shy talk. High affection gets the blush. That is the same job `visualFor` already does for the cat's face.

What reads differently, with the same traits:

- High introversion still leaves a busy room.
- High mischief still makes trouble. The knocked cup becomes a teasing line and the scheming idle.
- High affection still greets first. The glass-rub becomes a remembered hello, blush, and the shy kiss.
- High curiosity asks what a new object is. High independence picks it up without asking.

### How it is drawn

Sample the clusters on the static frame once: hair, eyes, bow, shirt, vest, gold trim, skin, outline. Remap hair, eyes, bow, shirt, vest, and trim from the DNA colors. Leave skin and the outline alone. The eyes sit near the hair hue, so they are sampled as their own range before the hair moves.

Common and uncommon ship with that remap and no new art. Rare adds the open-vest sheet. Legendary adds the ceremonial-trim sheet. That is four looks dyed by the seed, not a new painting per cat. Anything that changes the silhouette (a different hair shape, cat ears, a third outfit) waits until those sheets exist.

A cosmetic may sit inside those rules. A charm the cat wore, the single slot, becomes the same charm on her wrist. A holder mark stays on the machine case, the lamp or the stitch, and stays off her clothes. A cosmetic that changed her rarity, her seed, or her outfit tier would make the verifier lie.

### The life, on the machine

The machine already has one glass. Before the flag, that glass draws the pixel cat, the name, the caption, and the speech line. Trust, needs, scraps, and the journal accumulate behind it. A preview of the girl can sit on the life card. The glass still shows the cat.

The waking is one scene on that glass. The cat settles. The next frame is her Lily clip, dyed from the coat. Same name. The journal stays open. After that, the same spot on the glass plays her clips for eat, sleep, talk, scrap, and refuse. The life card still opens when you tap the glass. The cat stays on that card as where she came from.

A long cat life gives her more lines she can quote, the old house companion title when the years were long, and the cushion in the room. Those make the waking richer. Her stats stay the stats she had that morning. A thin journal means she has less to say.

### The gate

Awakening asks for a looked-after life.

- Trust has held. The sim already moves it: pet, feed, a kind word, being laughed with, a scolding, coming back after time away. One spike does not finish the gate.
- Cared-for day stamps stretch across time. A day counts the way a season day already should: she was fed, and someone was there. One busy weekend does not finish it.
- The journal holds more than one kind of memory: bond, moment, habit, and away.
- The history includes scraps she fought, scraps she refused, or play-dates that stood in for a fight. One activity cannot complete the gate.

A neglected cat stays a cat. Hunger, a long absence, and trust that fell off pause the gate. Care resumes it. The neglect stays written, and she can quote it later. Rarity is not in the check. A token balance of zero can still wake her. No mission, crystal amount, or fee sets the flag.

The flag is `awakened`. The seed does not change. On-chain, the coat stays a pure function of the wallet. The contract stores that the waking happened. Anyone recomputes the girl from the seed.

### Rules that keep her one soul

- One wallet, one cat, one token, one flag.
- `awakenedLook(dna)` is pure. The same wallet always gets the same girl.
- Rarity chooses the sheet and how many colors show. Combat power stays the nudge she already had.
- The waking is earned by the life. It is not a product, a skip, or a second mint.
- The portrait is this pack, remapped, and recomputed. It is not a stored image.

Other species, later, get their own base the same way. The cat's base is Lily.

## 6. Other mechanics

Staking and battles are not the whole product. Each of these shows the form she is in, and keeps the cat as the origin.

**Creature homes.** The room is the cat's room. The bed, the bowl, and the cup she used to knock over stay in it. Awake, she sits on the edge of the bed. The worn cushion is the old house companion object, already hers, still in the scene.

**Dungeon expeditions.** She walks in with the same stats and the same loot table. A rare egg found there waits in the journal until breeding exists. It does not hatch awake, and it does not hatch into her wallet.

**Creature trading cards.** The card has two faces. The front is the form she is in. The back is the cat, with the hatch date and the day she woke. Titles sit on the back with the journal. Players build decks from the stats, which did not change.

**Marketplace.** At launch she is soulbound, so the awakened form cannot be listed either. The market trades charms, components, and equipment. If a soul can move later, the original seed moves with her, so the buyer recomputes the same girl. A transfer that recomputed from the new wallet would paint a stranger.

**World bosses.** She deals the damage her stats and her day allow. One soul is one participant. Waking does not double a share.

**Living creatures.** Moods, the daily routine, and the house carry over. She still eats when she is hungry, and when she is bored she still makes trouble. She still notices the wallet once a day: an errand, a quiet stretch, a failed transaction, coming home. A busy wallet does not feed her. The bowl does. The girl talks about the house the way the cat reacted to it.

## 7. The token economy

A native token is useful. It should not be an inflationary staking reward.

**$SOUL** is the proposed ecosystem token. Illustrative, not a launched asset. It would be used to:

- Hatch special creature eggs, later, when a second soul is allowed
- Buy equipment and upgrades
- Pay breeding fees, later
- Enter premium tournaments
- Unlock special expeditions
- Buy cosmetics that stay inside `awakenedLook`
- Participate in governance

**CRYSTALS** are a separate, non-transferable resource for ordinary play. Two layers:

- $SOUL is the tradable ecosystem asset.
- CRYSTALS are earned and spent inside the game.

Do not promise a fixed yield. Rewards should come from real activity, with transparent rules and real sinks.

Awakening is outside that market. No token, crystal amount, or fee sets the flag or shortens the gate. Holding $SOUL is the jar in the house: a mark on the case, a little extra energy, a cheaper draw from the bowl, one charm claimed once. The jar does not check the form, and the form does not check the jar. Past the top step, more tokens still do nothing. A legendary with an empty wallet still beats a common girl who is exhausted.

Cosmetics follow the dye. A charm uses the single slot the cat already had. A painted sheet, if one is ever sold, has to be wearable by any cat of the tier that sheet belongs to. It cannot retier a common into the ceremonial cut, and it cannot move the seed.

The sink that already fits is that charm slot, crafted from crystals. The thing the economy must leave alone is the waking itself.

| Revenue source | Mechanism |
| --- | --- |
| Equipment and charms | Item sales, inside the one slot |
| Arena | Competition fees. One ladder |
| Land and habitats | NFT sales. The room, not the girl |
| Breeding | Fees, later, per kitten |
| Premium AI | Subscription for speech, not for the flag |
| Marketplace | Fees on equipment. She is not the listing |

## 8. Autonomous AI creatures

This is the feature that would make the project more than another NFT game. She operates semi-autonomously. She has a personality, a memory, preferences, attributes, a visual appearance, an animation system, and a decision engine. She decides inside rules the game sets. The appearance after waking is Lily. The decisions are the traits she had as a cat.

Examples:

- She wakes in the morning, notices the owner has been away, and says she used to wait on the windowsill. Now she waits at the desk.
- On the first morning awake, she reads the cat years back: the name, the night she went hungry, the cup, the first time trust held.
- She is challenged and answers with the personality the cat had. A languid cat wakes languid. Low energy and she says no.
- She wins and plays Taunt. She loses, and if affection is high she is hurt about it. If independence is high she shrugs.
- She sees a stronger opponent and chooses attack or defence from the same strategy weights the cat used.
- Two owners open their pages and two awakened girls talk. They compare seasons, a scrap, a title, a clan. They can tease, withdraw, or challenge. The engine decides whether a scrap is allowed, who wins, and what the journal stores. The model supplies the lines.
- A girl meets a cat who has not woken. She recognizes the life stage. She can quote her own cat years, offer a play-date, or accept a refusal. She does not talk down to the cat. The cat still answers in the short lines the sim already has.

That conversation is a more interesting social feature than a gallery of portraits. A gallery of girls with the cats cropped out is the failure mode. The cat years are the thing they have to talk about.

The AI does not get unrestricted access to wallets or contracts. Its decisions go to a deterministic game engine, which validates them and executes only the actions the rules allow. The model does not set `awakened`, does not sign a scrap, and does not move tokens.

## 9. The website

The site should feel like a game, not a DeFi dashboard.

| Section | Purpose |
| --- | --- |
| Discover | Explore souls. Filter by coat, rarity, and awakened |
| Hatch | One cat for this wallet |
| My Creatures | This cat. Current form, the small cat in the corner |
| Training | Improve attributes. Same gains in both forms |
| Arena | PvP on one ladder |
| Machines | Build combat robots. She is the pilot plate |
| Expeditions | Missions and rewards. The journal feeds the gate |
| Breeding | Closed at launch. Later, kittens from cat genes |
| Marketplace | Charms, components, equipment |
| Leaderboard | One ranking. Awakened is a mark, not a division |
| Profile | Achievements, the cat years, the day she woke |

Every soul has one page. It shows the form she is in now, on the machine screen, with the cat as origin: the pixel cat, the hatch date, and the day she woke. Personality, stats, history, equipment, and battle records are the same lists before and after.

Discover's awakened filter sits next to rarity and coat. It is a way to find people who stayed. It is not a mint page, a shop, or a gallery of girls without their cats. The waking happens on the machine. The site reports it.

## 10. What to build first

Do not build all of this at once. A working game is three systems, in order. The look of the girl can be proven as soon as the cat exists. The life that unlocks her waits until that life is real.

### Phase 1. The foundation

- AI-generated personalities, from the trait roll, with speech on top
- The pixel cat, from `makeDna`
- `awakenedLook(dna)`: the common and uncommon palette remap of the Lily clips
- A machine preview with the flag forced in development, so the dye can be checked against the coat
- The mood-to-clip pick, following `visualFor`
- NFT minting of the one cat
- Rarity, traits, profiles, and ownership

### Phase 2. The game

- Training and experience
- Rest, then mission staking
- Automated PvP battles on the life she is already having
- Scrap clips in place of the flail, still behind the development flag until the gate exists
- Journal moments of more than one kind, which the gate will count
- Leaderboards
- The charm slot
- Battle rewards

### Phase 3. The economy

- The life gate, tuned on real trust, day stamps, and journal lines
- The on-chain `awakened` flag
- The rare open-vest sheet and the legendary ceremonial sheet
- Titles from history: battle-hardened, explorer, old house companion
- Marketplace for equipment
- Token integration that does not sell the waking
- Clan wars, world bosses, and seasons
- Breeding and other species bases, after one soul per wallet is no longer the rule

Phase 1 proves the girl is a pure function of the DNA before anything depends on her. Phase 2 fills the journal. Phase 3 turns the flag on for players.

## 11. Technical architecture

You do not need to train a model.

| Component | Suggested technology |
| --- | --- |
| Frontend | Next.js and React |
| The machine | Three.js or React Three Fiber, for the case around the screen |
| The creature | Pixel sprites on that screen. The cat, then Lily clips |
| Animation | Sprite clips, chosen the way `visualFor` chooses a face |
| AI personality | An LLM API for lines. The traits stay a seeded roll |
| Creature generation | `makeDna`, then `awakenedLook`. No image model in the look |
| Game engine | `Game engine/mechanics` for the rules, `Game engine/creatures` for how they are drawn, `Game engine/assets` for the cat, Lily, and interface art |
| Database | PostgreSQL |
| Real-time events | WebSockets, for two souls talking |
| Blockchain | An EVM-compatible chain |
| NFT standard | One ERC-721, soulbound at launch |
| Equipment | ERC-1155 for charms and components, the one slot |
| Staking | The rest contract. Later, mission locks |
| Indexing | Goldsky, or a custom indexer |

Do not generate a new 3D model with AI for every creature. The cat is one painted coat, recolored by cluster, which the machine already does. The girl is the same idea: one sprite base, a palette remap, and a handful of outfit sheets gated by rarity. The look is recomputed, never stored as a new image. Use the model for what she says. Later species can bring their own base. They do not each bring a generated body.

The contract stores the hatch and the flag. A verifier recomputes the coat and the girl from the wallet and checks the flag. A stored portrait would drift from the math.

## The combination

Treat it as three products in one.

1. **AI pets.** The attachment. Users hatch a cat, keep her, and one day she wakes. The cat years remain visitable, and they are what she has to say.
2. **Creature arena.** The competition. One ladder, the same stats in both forms, champions, and clans. The crown is a record on the life card.
3. **Machine lab.** The strategy. Build machines, combine components, and let them fight. She is the pilot. The parts are the parts.

The difference from a static NFT: the token is one life with a last form. That form is earned by the life, recomputed from the same seed, and kept on the same token.
