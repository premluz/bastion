# Bastion design system

The patterns Bastion's interface is built from, and why. It records what has been decided through
iteration (STATE.md holds the dated history); it is not aspirational. When a change establishes or
alters a pattern, update this file in the same change as the code.

| Topic | Where |
| --- | --- |
| Colour, type, motion values and their tiers | `tokens-spec.md`, `app/src/theme/` |
| How things move: principles, timings, transitions | `motion-language.md` |
| What each registry node is for | `node-vocabulary.md` |
| Semantic tokens ↔ Astryx variables | `app/src/theme/astryx-bridge.md` |
| Surfaces, layout, panes, components, copy | this file |

Values below name their token; the token is the source of truth. The reference theme is
**Bastion Pastel** (light); **Bastion Aura** is its dark counterpart. Both share Aura's geometry
(`theme/aura.css`).

## Foundations

- **Tokens only.** Components read semantic tokens, never raw values or Astryx variables
  (CLAUDE.md rules 4 and 7). A theme is a mapping file; adding one changes no component.
- **Corners are concentric.** A card's radius is its leading circle's radius plus its padding:
  `--list-card-radius = --list-accessory-size / 2 + --aura-card-padding` (44 / 2 + 20 = 42 px).
  A row inside a card is the card's radius less the card's inset. Change the padding and every
  radius follows.
- **Cents are subtle.** The decimals of a balance are 62% size in the muted ink (`MoneyText`,
  `--cents-scale`, `--cents-ink`); Settings → Subtle cents turns it off. Default on.
- **Numbers** are tabular (`hasTabularNumbers`, `.heroBalance`) and change by rolling, never by
  jumping (`RollingText`, see `motion-language.md`).

## Surfaces and materials

| Surface | Light (Pastel) | Dark (Aura) |
| --- | --- | --- |
| Card (balance tiles, alert, lists) | white 94%, no edge, a white top highlight, a shadow pooled underneath (`--card-light`, negative spread) | translucent dark, light inner rims, deep soft drop |
| Glass button (menu, +, chat row, history) | white 80% over a 40 px blur, no edge, pooled shadow (`--glass-shadow`) | clear glass with inner light |
| Pane in a conversation | the card's radius, `--send-pane-wash` / `--approval-pane` | same |

- **In light, edges are light, never a line.** No grey ring, no dark inner shade. A translucent
  edge under a translucent fill reads darker than the fill: give edges no colour of their own
  (`--glass-edge`, `--card-rim` transparent).
- **Shadows sit under a surface, not around it.** A negative spread pulls the shadow in so it
  never traces the edge as an outline; reach below stays about 32 px (`--carousel-shadow-room`
  leaves room for it).
- **The alert is a card like the others.** Same fill and rim as Money and Investments; the only
  colour is its glow rising from the bottom (orange for due, as Investments' is green) and its
  mark. No wash, no coloured edge.
- **Glows are light inside the card** (`theme/glow.module.css`): clipped to the card, a wide soft
  haze rising from the bottom, the kind's colour (gain green, alert orange, info blue).

## Layout

- **Home (`CalmHomePage`).** 20 px side margins, 16 px between cards, 28 px between sections.
  The gap from the account tiles to the alert equals the gap from the alert to the insights.
- **Header.** The date and greeting sit at the avatar's level (`HomeGreeting`): small, regular
  weight, the hello one step larger than the date.
- **Dock.** Menu and + are 48 px glass circles, iOS's toolbar-button size
  (`--dock-context-button-size`); the cube (56 px) sits centred between them, level with them.
  The row's bottom clearance is `--dock-bottom-inset` = safe area + max(`--pill-inset`, safe
  area), so it follows Settings' safe-area switch. The chat's bottom row stands at exactly the
  same height: back on the left, the history button top right (48 px, where the avatar is).
- **Contextual dock.** On a page that takes the screen, the way back takes the menu's cell; the
  glass stays and only the icon changes (`theme/dock-context.css`).

## Conversations

A conversation is a thread of the user's words, the assistant's replies, and **panes**: the
question card (`approval-card`) and the confirmation (`payment-card`). Panes are the only
surfaces in a thread; everything else is text.

- **Order of a turn.** The reply prints first ("Got it. Here's the top-up."), then the pane grows
  in under it, pushing what is above (`motion-language.md`, Conversations).
- **One step stands at a time.** Once a question is answered it folds away; the next step takes
  its place. Never leave answered choices above a pane that repeats them.
- **Entering the assistant** (off for now, `config.agent.chatSweep`) can be marked by one faint wave of iridescent light rising up the screen
  with the home's recede, in the theme's prism colours (`ChatSweep`); it decorates the opening, it
  never replaces it.
- **An alert opens its own conversation.** The tapped alert card travels to the top of the thread
  and becomes the turn's opening line; the question arrives under it. Same card, same body
  (`AttentionCardBody`), in both places.

### Question pane (`approval-card`)

- **One question:** the options are rows; tapping one chooses it and moves on. No radios, no
  Continue (`data-approval-tap`).
- **Several questions:** numbered ("1 of 2"), previous / next arrows, a Continue.
- Option rows carry a label and one supporting line (what is available, what it costs).

### Confirmation pane (`payment-card`)

One component for every transfer; each flow supplies its data
(`contracts/props/payment-card.ts`).

| Part | Rule |
| --- | --- |
| Parties | `from` → `to`, always the three chevrons. A person is their avatar; one of the user's own accounts is its icon (wallet, house, coin). `from` omitted = the user. |
| Captions | Optional text under each party, rolling to an `outcome` when the transfer lands. Supported by the component; no flow uses it now (the top-up had before → after captions and dropped them, 2026-11-01). |
| Amount | The hero figure (`.heroAmount`, 40 px). |
| Details | A list of label / value rows, empty by default. Only what matters for this transfer: a person transfer shows Arrives and Network fee; the mortgage top-up shows none, and from USDC only a Conversion row ("190 USDC → $190.00 · no fee"), the fee folded in. |
| Actions | **Not now** (ghost) and **Confirm** (primary), right-aligned so the primary sits under the thumb. No Edit. |
| States | review → sending (ripples, "Sending…") → sent (parties converge into a check mark, "Transfer complete.") or cancelled. Actions fold away once the user has answered. |

## Lists

- **Insights** on the home use the plain list, the same rows as the assistant's landing
  (`SuggestionList` default variant): an icon disc, a headline with its figure, an action line
  under it. No pane, no chevrons.
- **Activity and suggestions** share that row anatomy, so a list reads the same wherever it is.

## Copy

- **Alerts and insights:** the finding with its figure first, the action on a second line, ending
  in an arrow where it opens something. "Mortgage due today: $190 short" / "Top up →".
  "Portfolio up $228 (4.2%) this week" / "See what moved".
- **Dismissing a decision is "Not now"**, not Cancel: nothing is lost, the user can come back.
- **Replies are short and in the assistant's voice** (`--face-voice`). The pane carries the figures;
  the reply doesn't repeat them.

## Open

- The card's editing view and the engines' `editing` stage are unreachable since Edit was removed;
  remove them if editing is not coming back.
- No reverse transition yet from the conversation back into the alert card.
- Tab switches and the Explore chips have no shared choreography (`motion-language.md`, Open).
