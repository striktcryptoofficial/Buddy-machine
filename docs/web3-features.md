# Building BUDDY toward web3

The machine is the product. The chain is the record that a wallet hatched, and the scoreboard for the few moments that should outlive a browser.

This doc is the direction to build toward: an NFT that is the cat, battles that spend the life the cat already has, staking that is rest rather than a second casino, a cat that notices what the wallet did today, a capped perk for holding the token, and the tools around them. It assumes the rule from the wallet hatch: one address, one cat, coat computed from the wallet, name written once.

Numbers below use the current scorer in `Game engine/mechanics/dna.ts`. Across 200,000 random seeds that lands about 37% common, 39% uncommon, 18% rare, and 5.5% legendary. A legendary is not a 1% myth. Battles and rewards have to be designed for that, or the scorer has to be tightened before the first permanent hatch.

## The split

| Piece | Where it lives | Changes? |
| --- | --- | --- |
| Coat, pattern, mutations, rarity | Pure function of the wallet | Never |
| Name, hatch time | The cat NFT | Name once, at hatch |
| Needs, mood, action, journal | The machine, plus signed day stamps | All the time |
| Battle result, season award, equipped charm | Chain events | Only when something finished |
| Food bowl, rest lock | A stake position on the cat | While the owner chooses it |
| What the wallet did today | A daily read of the address, not a new transaction | Once a day |
| Holding the project token | A balance check on that same address | While they hold it |

Do not put hunger ticks, mood ticks, or the speech bubble on-chain. The sim already runs locally. A transaction per heart makes the cat expensive and trains people to ignore it.

## 1. The cat NFT

One ERC-721 per wallet. Soulbound at launch: the contract refuses transfer. The token id can be the address, or a counter, but the seed is always derived from the minter.

`hatch(name)` stores:

- minter
- name
- hatched at

It does not need to store the coat. Anyone recomputes `makeDna` from the address and gets the same cat the machine shows. The life card, the serial, and the foil case are that proof, drawn on the device.

Second hatch from the same wallet reverts. Replacing a cat, which the app does today, becomes a later explicit burn, not a free button.

The token URI can be a small JSON file: name, rarity, coat title, image of the pixel cat or the life card. The image can be rendered from the seed so the metadata cannot drift from the math.

What this is for: identity, the public gallery, and anything later that needs “this wallet has a cat.” It is not a pack you open, and it is not a coin.

## 2. Battles

A battle is a short scrap between two cats, played on the machine, settled by traits and the life they are having that day. It is not a damage race and it does not take the other person’s cat.

### What a scrap uses

The cat already has the numbers:

- Vigor, mischief, independence, curiosity, affection, introversion
- Energy, happiness, hunger
- Rarity as a small nudge, not a win button. A legendary edge of a few percent is enough. At 5.5% of all cats, a large rarity bonus makes the ladder a coat contest.
- Mood as a modifier. Angry and excited show up. Sleepy and sad show up worse. A sleeping cat cannot be entered.

Suggested weights, tuned later, not sacred:

- Vigor and mischief do most of the work
- Low energy or high hunger cuts the score hard
- Happiness keeps the cat from folding
- Independence helps if the other cat is trying to spook them
- Affection is weak in a scrap and strong in a different mode (see play-dates below)

Both sides sign a snapshot of needs and mood. The contract, or a referee that both can recompute, rolls one number from the two signatures plus the block. Same inputs, same winner. Nobody trusts a hidden server.

### How a match starts

Async, so both people do not have to be online.

1. The challenger picks an address and signs a challenge. It costs energy on their cat immediately, in the local sim, and the signature says so.
2. The challenge sits for a day.
3. The other owner accepts on their machine. Their cat spends energy too. If they ignore it, the challenge expires and the challenger gets the energy back in the next day stamp. No griefing by forcing a fight.
4. The result is one transaction, or one signed result both wallets can show: winner, loser, a short reason the machine can speak (“Noodle was too hungry to care”).

A cat can scrap a few times a day. Energy is the limit. When it is low, the button is dim and the cat says no. That is the anti-grind. Staking and resting refill energy. Spamming fights empties it.

### What you win

Not the other cat. Not a pile of tokens on day one.

- A journal line, the kind the life card already understands (`moment`)
- A win count on the public record
- Season points, if a season is running
- A small chance of a charm (see equipment), higher if the scrap was close, not if you were legendary

Losing still writes a line. The cat is embarrassed, happiness dips, the machine plays it. That is the point of using the life sim instead of a separate combat screen.

### Two modes

| Mode | Uses | Feel |
| --- | --- | --- |
| Scrap | Vigor, mischief, energy | A short fight. The pixel cat flails. Winner struts. |
| Staredown | Independence, introversion, hunger | No contact. The hungrier or shyer cat looks away. |
| Play-date | Affection, happiness, curiosity | Not a fight. Both cats gain a bond memory if they are not miserable. Counts as a social win for seasons, not for a battle ladder. |

Play-dates matter so a soft cat is not a dead wallet.

### What the machine shows

The scrap happens on the glass, not on a new website. Two pixel cats, a few seconds, then the speech line. The 3D case does not need a new model. The screen already changes for hatch, boot, and the journal.

## 3. Staking

Staking here means putting the cat, or a bowl of value, into a rest. It is not “buy the token, earn more token” as the core loop.

### Rest the cat

The owner stakes the cat NFT into a rest contract. While it is there:

- The machine shows the cat asleep. Actions that spend energy are refused.
- Hunger still rises slowly, so a month of ignoring a staked cat is not free. The day stamp, or a view-only sim, shows that.
- Energy refills to full over a set time, for example a day. Unstaking early wakes the cat tired.
- A rested cat can hold a season point multiplier for the next scrap, small, so rest is a choice against playing, not a requirement.

Unstake returns the same NFT. Nothing is minted.

### The bowl

A separate stake: the owner locks a little ETH, or later a project token, as the food bowl. The machine’s Feed button draws from that bowl.

- The bowl is not required to hatch or to exist.
- Feed without a bowl still works, as it does now. The bowl is a public commitment: this cat is being kept.
- The lock does not need to stream value every block. A simple balance is enough. Feeding signs “I fed,” and the bowl’s recorded level drops on the next stamp.
- If you want a reward at all, it should be cosmetic or seasonal, paid from a capped pool, and it should stop if the cat is starving. A bowl that pays you to neglect the cat is the wrong game.

### What not to stake

- Do not stake a coin to raise rarity. The coat is the wallet.
- Do not stake the cat to farm a liquid token as the reason to open the app. The machine gets abandoned the week emissions end.
- Do not auto-compound. There is one cat. It either rests or it is awake.

## 4. Wallet activity

The cat notices the wallet the way the April Fool’s buddy noticed a failed test. Activity is not a score you farm. It is the day the house had. The machine reads it once, on the day stamp, from a public index of the address. It does not send a transaction to “check in,” and it does not watch the mempool live.

Hunger still only moves when the cat is fed or neglected. A busy wallet does not feed the cat. A quiet one does not starve it faster than the sim already does. Activity fills curiosity, loneliness, and the journal. The bowl fills the stomach.

### What it can see

Keep the list short. A wide scan of every token the wallet has ever touched is slow, easy to fake, and turns the cat into a portfolio dashboard.

| Signal | What the cat does |
| --- | --- |
| Wallet age | An old address gets one journal line at hatch: the house was already here. No stat change. |
| Any transaction today | Curiosity ticks down a little. The cat watched you leave. |
| No transaction for several days | Boredom and loneliness rise. The existing cup-knock and away memories are this. |
| A burst of swaps or transfers | The cat is overstimulated. Energy dips, curiosity is high, the caption says the house was loud. |
| A failed transaction | One snark line, the way a buddy reacted to an error. Once that day, not once per revert. |
| This wallet hatched, rested, scrapped, or filled a bowl | First-class. Those contracts are ours, so the cat can name them. |
| Came back after a long quiet stretch | The existing catch-up. The cat is distant, then warms up if you stay. |

Incoming value can make the cat affectionate that day. Sending a lot can make it anxious. Both are one mood nudge, capped, so a whale transfer does not max the meter.

### What it should not see

- Every NFT in the wallet, listed on the life card. That is a gallery of other projects, and it dates badly.
- A leaderboard of gas spent. People will waste fees to climb it.
- Other people’s activity. The cat gossips about its own house only.
- Activity from the last hour on every frame. Read once a day. Cache it. The machine stays smooth.

### How it becomes play

A few rules, all checked at the day stamp:

- **Errand.** At least one transaction today satisfies a slice of curiosity. It does not replace Feed.
- **Homebody.** Three quiet days and the cat knocks the cup. Seven quiet days and the away memory fires, which the sim can already do.
- **Reunion.** The first day back after a long quiet stretch is a journal moment, not a punishment screen.
- **Season credit.** A day counts toward a season if there was a stamp and the cat was fed. A transaction can be a third optional tick, so a holder who never opens a wallet still has to show up. Activity alone is not a streak.

The public machine can show a single line, “last errand, Tuesday,” from the last stamp. It should not stream a live feed of the owner’s trades.

## 5. Holding the token

Holding is a jar in the house. It is not the cat, and it is not the coat.

The cat still hatches, eats, plays, and speaks with a zero balance. Pet, feed, and play never check the token. Rarity never checks the token. A flash loan or a one-block buy should not count: the day stamp reads a seven-day average balance, not the balance at the moment someone opens the app.

Use three steps, not a slider. Past the top step, more tokens do nothing.

| Step | Balance, averaged over 7 days | What changes |
| --- | --- | --- |
| None | Below the floor | The cat is whole. No mark. |
| Jar | A small floor, cheap on purpose | A thin mark on the case, one extra scrap of energy per day, holder lines in the speech |
| Full jar | A higher floor, still not a whale number | The mark stays. Feed from the bowl draws a little less. One holder charm can be claimed, once, for this cat. |

Above “full jar” the perks do not grow. A larger bag does not make a stronger cat. That is the whole point of the steps.

### What holding is allowed to change

- The speech. The cat knows there is a jar. It can be pleased, smug, or unimpressed. Personality already decides which.
- A mark on the case, separate from the foil rarity skin. Rarity foil stays the DNA. The holder mark is a lamp or a stitch, and it goes out when the average falls back under the floor.
- One extra scrap of energy at the jar step. Not a damage bonus. A legendary with no tokens still beats a common cat that is exhausted. A held bag cannot reverse hunger.
- A cheaper draw from the bowl, at the full jar only. The bowl still has to be filled. Holding is not feeding.
- One charm, claimed once per cat, cosmetic, unequippable, and not a new rarity. If they sell the tokens first, the claim stays. The claim was for having kept a jar, not for still holding one. The case mark does go away.

### Holding versus staking the token

These are different, and they should not pay twice for the same coins.

| | Holding in the wallet | Staked in the bowl |
| --- | --- | --- |
| The cat notices | Yes, the jar | Yes, the food |
| Counts for the 7-day average | Yes | No. Staked coins are not also “held.” |
| Feeds the cat | No | Yes, when you press Feed |
| Extra scrap energy | At the jar step | No |
| Case mark | Yes, while the average holds | No |

Move coins from the wallet into the bowl and the jar perk steps down. The cat is being fed instead of shown a balance. That is a real choice, not a double count.

### What holding must not do

- Gate the hatch, the name, or the basic buttons.
- Add a percentage to scrap power that scales with balance.
- Mint a second cat.
- Change `makeDna` or `rarityFor`.
- Pay a yield just for sitting in the wallet. If there is a reward, it is the charm and the mark. A wallet that pays rent for holding will be farmed and then left, and the machine will be empty.

If the token does not exist yet, skip this section in the build. Wallet activity works with ETH and the contracts alone. The jar is an addition, not a requirement.

## 6. Other mechanics worth building

### Day stamp

The owner signs a snapshot once a day: needs, mood, action, win count, bowl level. A new browser imports the stamp and continues. Missed days run the existing catch-up decay, so a cat you abandon comes back hungry and distant. The stamp can live on a cheap log or even just as a signature the app stores, and only the important ones get a chain event.

### Charms

Born-with hat, glasses, and bow stay in the DNA. They are not items.

Later charms are small tokens equipped on the cat: a bell, a sweater, a paper crown. One slot. They can come from a close scrap, a season, or a bowl that stayed full. They never change rarity. Unequipping returns the charm to the wallet. Selling a charm is fine. Selling the cat is a later decision.

### Seasons

A month with a public board:

- hatch, if you have not
- feed streak
- three scraps, win or lose
- one play-date
- a week of day stamps

Rewards are charms, a line on the life card, and a season mark in the token metadata. No infinite points shop. When the month ends, the board freezes.

### Public machine

`/cat/0x…` opens that wallet’s machine, read-only. The foil, the name, the life card, and the last stamp. Pet, feed, play, and scrap are hidden. This is the gallery item and the thing you send someone.

### Gallery and verifier

The gallery lists hatches. Filters: rarity, coat, awake versus resting, active this week.

The verifier recomputes DNA from the address and shows it beside the NFT metadata. If they differ, the metadata is wrong, not the cat. This is the trust tool. It should be boring and exact.

### The room

The `/room` route can be the place two awake cats share for a play-date. No chain call until both owners agree on the result. Until wallets exist, the room can stay local.

### Name

The hatch name is the name on the glass and on the NFT. One change, ever, if you allow it, as its own transaction, so a joke name is not permanent on day one and a name is not a toy. After that, the life card serial stays, the name does not move again.

### Age

`createdAt` on the hatch is the birthday. The life card already prints a date. Age is public. It is not a stat you can buy.

## 7. A token, if you add one

You do not need one for the NFT, the scraps, the rest stake, or the wallet-activity lines. Those can all read ETH and the cat contracts.

If a token exists, section 5 is the rule for holding it: three steps, a seven-day average, no effect on the coat, no gate on care. The same token can also be what you put in the bowl. Coins in the bowl are not also counted as held.

Uses that fit:

- the jar, with a hard cap on the perk
- fill a bowl
- enter a season’s last-week board, as an optional stake you get back
- trade charms, if charms are not themselves NFTs

Uses that break the project:

- pay to hatch
- pay to reroll
- pay to raise rarity
- unlock pet, feed, or play
- a yield for holding, with no cat and no cap

The cat has to work with an empty wallet except for gas on hatch.

## 8. Order to build

1. **Wallet on the case.** Replace the stand-in address and QR. Read-only is enough to start. No contract yet.
2. **Seed from the address.** A connected wallet hatches the cat that address will always have. Still local. This is the dress rehearsal.
3. **Cat NFT.** `hatch(name)` on a cheap chain. One per wallet. Metadata rendered from the seed.
4. **Public link and verifier.** So the NFT and the machine cannot disagree.
5. **Day stamp.** So the life is not trapped in one browser. This is also when the wallet-activity read starts: one cached look at the address per day.
6. **Scraps.** Local first, two cats on one screen, using traits and needs. Then the signed challenge. Then the on-chain result.
7. **Rest stake.** The cat NFT locks, the machine sleeps, energy refills.
8. **Bowl, charms, seasons.** Only after people are actually feeding and scrapping.
9. **The jar.** Only after a token exists. Seven-day average, three steps, no double count with the bowl.

Battles before staking. A stake with nothing to come back for is a vault. A scrap with a tired cat is a game.

## 9. Leave out

- Breeding. A kitten needs a second empty wallet and breaks “one life.” Revisit only if the first cat is already precious.
- Transfer, until a journal is worth moving. When you add it, the bones stay computed from the original minter, or the cat’s identity changes under the new owner and the life card becomes a lie. Pick one and write it on the card. The clean version: the cat keeps the original seed forever, and transfer moves the soul, not the math.
- Liquid staking derivatives of the cat.
- Random loot boxes for rarity.
- A battle pass you buy.
- A live feed of the owner’s trades on the public machine.
- A holding bonus that scales with balance, or that counts the same coins in the wallet and in the bowl.

## 10. What the chain stores, in one list

- Hatch: wallet, name, time
- Rest: whether the cat NFT is in the rest contract
- Scrap result: the two wallets, winner, day
- Season mark: wallet, season id, charm id if any
- Bowl: balance, last fed day
- Day stamp: the day’s mood, whether there was an errand, and which jar step the seven-day average landed on

The raw transaction list stays in the index. The chain keeps the stamp, not the history.

Everything else is the machine.
