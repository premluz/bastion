# Bastion motion language

How things move in Bastion and why. Values live in the token cascade (`app/src/theme/`); this file
names the intent behind them. When a new motion is needed, find its pattern here first; if none
fits, add the pattern here in the same change as the code.

## Principles

Restrained, directed, Apple-like. Distilled from Apple's HIG *Motion*, Emil Kowalski's
animations.dev, and the motion-design curriculum (easing, offset + delay, parenting, masking,
overlay, dimensionality).

1. **Purposeful.** Every motion explains something: where a thing came from, where it went, what
   is now in front. Nothing moves for decoration.
2. **Realistic, following the gesture.** A sheet that slides up closes by sliding down. The glow
   rises with the finger, 1:1, and only snaps when the gesture commits.
3. **Brief, and exits briefer.** People wait for what arrives and are already moving on from what
   leaves. Entrances take their time; exits are short.
4. **Decelerate in, never ease-in on arrival.** Arrivals start fast and settle (ease-out family).
   An ease-in start feels laggy at exactly the moment the eye is watching.
5. **One direction per story.** The page leaves bottom-up; what replaces it arrives top-down, on
   the same beat, so the two read as one movement.
6. **Choreography by order, not by hand.** Staggers come from document order and the scene's
   `reveal` index (CLAUDE.md rule 15), never from per-component timing.
7. **The screen never budges unasked.** Opening something must not scroll, jump or reflow what
   is behind it. Focus moves with `preventScroll`.
8. **Optional.** Under *Reduce Motion*, staggers and travel collapse to a plain fade or nothing,
   and no information lives only in motion.

## The system

| Role | Token | Value |
| --- | --- | --- |
| Stride: one beat of any stagger | `--motion-assembly-stagger` | 60ms |
| Quick feedback, state changes | `--motion-enter-duration` / `--motion-exit-duration` | 200 / 120ms |
| Mode change (assistant opens, page recedes) | `--shell-mode-duration` | 480ms |
| Deliberate arrival (sheets, pages, the nav highlight) | `--duration-480` + `--ease-float` | 480ms, long deceleration |
| Spring: press release, snaps | `--ease-spring-pop`, `--ease-spring-soft` | 550ms |
| Sheet in / out | `--sheet-enter-*` / `--sheet-exit-*` | 480ms float / 250ms standard |
| Detail page out | `--detail-exit-*` | 270ms, scale .9, sections ½-stride apart |
| Recede into the assistant | `--agent-recede-duration` + stride | 320ms per element |
| A pane arriving in a conversation | `--pane-enter-*` (pane-entry.css) | 480ms float, from scale .94 and 8px blur |
| A home alert becoming its conversation | `--scenario-*` (scenario-expand.css) | recede at ⅓ stride, then the pane's own push |
| A value or label changing | `RollingText` (components/trail) | 320ms float, 30ms per changed character |
| The sweep on opening the assistant | `--chat-sweep-*` (chat-sweep.css) | the recede's own span (recede + 7 strides), linear, 20% strength, then a 200ms fade |

**Curves.** `--ease-float` for arrivals that should feel placed; `--ease-standard` for state
changes and exits; the springs only where something is physically pushed or released.

**Travel.** Small: 4–12px of rise, plus 8px of blur on the way in or out. Content materialises
rather than flying. Large travel is reserved for things that really come from somewhere: a sheet
from the bottom edge, a card from its deck.

## Patterns

- **Page landing.** Sections rise out of a soft blur, one stride apart (`shell-page-enter`).
- **Into the assistant.** The page's contents leave bottom-up, one stride apart
  (`--recede-index`; the attention home's blocks via `data-recede-step`). The welcome and the
  suggestions arrive on the same stride while the page is still leaving: two beats in, then one
  beat apart.
- **The glow and the nav.** Finger-driven: the pill lifts and its icons fade with the swipe's
  progress; on commit the glow snaps (overshoot, settle) on the same beat as the nav morphs into
  the composer.
- **Sheets.** Glide up over 480ms on the float curve with the scrim fading on the same beat;
  leave in 250ms. Back, Confirm, a drag down and a tap on the scrim all play the same exit before
  anything unmounts.
- **Detail pages (card detail).** Arrive by a shared-element FLIP from the tapped card. Leave very
  fast: the whole page shrinks back toward the point it came from and fades, its sections
  leaving bottom-up half a stride apart. The page, not the card, returns, because the user may be
  scrolled far from the card.
- **Press.** Hover scales to .95 (`--press-hover-scale`), a press to .88 (`--press-active-scale`);
  release springs back. The whole control answers, surface and icon together.

### Conversations (2026-10-31)

- **Panes arrive from depth and push.** A question or confirmation pane in a conversation
  (approval-card, payment-card) fades in from scale .94 and blur, settling in place: it never
  rises from below. It is its own grid row growing from nothing, so what is above it is pushed
  up as it arrives; surfaces on one level never overlap (`theme/pane-entry.css`).
- **Words first, then the pane.** A pane that follows the assistant's reply waits until the reply
  has finished printing (`renderer/AfterReply.tsx`), then grows in. The thread follows it down
  (`useAutoScrollBottom` re-pins on every resize).
- **An alert becomes its conversation.** Tapping a home alert: the rest of the home recedes on a
  third of its usual stride; the card holds its place; then the question rises from depth under
  it and both travel up together, the question visibly pushing the card to the top. The card is
  never a container that grows into the page (`theme/scenario-expand.css`, `scenarioPush.ts`).
- **Opening the assistant sends a wave of light up the screen** (off for now: `config.agent.chatSweep`). A faint iridescent band in the
  theme's prism colours (a fifth of its full strength) rises bottom to top, its crest bowed and
  waving, timed from the recede's own tokens so it passes each block as that block blurs out; the
  conversation then arrives as before. It is decoration over the choreography, never a curtain: it blocks no tap
  and is absent under reduced motion (`ChatSweep`, a WebGL port of glimm's sweep shader).
- **What is answered folds away.** Once its choice is made, a question's row closes with its
  gap and fades, so the next step stands where it stood. Done as a transition, so a transcript
  mounted later starts folded (SendMoneyTranscript.module.css).
- **The result stays on screen.** When a transfer lands, its parties converge into the check
  mark; a caption under a party, where a flow has one, rolls to its outcome and stays. Nothing
  that tells the user what happened is tidied away.

### Values and controls

- **Every change moves; only what changed.** Changing text rolls (`RollingText`): paired from
  the right like figures, the last changed digit first, unchanged characters still; characters
  only in the new text open their room, only in the old close it. Per-character spans exist only
  while it moves; then it is one plain text node again (balance hide/show, transfer captions).
- **A control keeps its place when its job changes.** The dock's menu becomes the way back in the
  same cell: the glass button stays, only the icon changes; what leaves goes fast, right to left
  one short beat apart, and what arrives comes a beat later on the soft spring
  (`theme/dock-context.css`).

## Rules of thumb

- Feedback (press, toggle, hover): 100–200ms. Popovers and menus: 150–250ms. Sheets and pages:
  250–500ms. Nothing in the regular UI runs longer unless the finger is driving it.
- Exits run at roughly half to two-thirds of the matching entrance.
- A stagger never runs past about five beats. Long lists stagger the first few rows and bring
  the rest in together.
- Animate `transform`, `opacity` and `filter` only, never layout properties, so motion stays on
  the compositor. Two sanctioned exceptions, both because the room itself is the message: a pane
  growing its grid row to push what is above it, and a rolling character opening or closing its
  column. Both are short and one element at a time; the pane clips only while it grows, and
  rolling text never clips (a clip would move its baseline).
- A layout-moving exception must not add to a scroll container's height mid-flight: move the
  picture (a view transition), not the live element, when the thread is pinned to its end.
- Anything that unmounts after an exit waits for the exit's own `animationend` or
  `transitionend`, or for a constant named after the token it mirrors, never a bare magic number.
- Every new motion ships with its reduced-motion branch.

## Open refinements

- `Sheet` exits on a JS constant (`SHEET_EXIT_MS`) that mirrors `--sheet-exit-duration`. Move it
  to `transitionend`, as the card detail page now does.
- The welcome no longer types out. If typing returns, it must start on the stagger's second
  beat, not after it.
- Tab switches and the Explore category chips have no shared choreography yet; give them the
  page-landing rise at half travel.

## Sources

- Apple Human Interface Guidelines, *Motion*: purposeful, realistic, brief, optional.
  developer.apple.com/design/human-interface-guidelines/motion
- Emil Kowalski, animations.dev: easing and duration choice, springs, performance, knowing when
  not to animate. Community summaries of his guidance give the duration tiers above and the
  ease-out default.
- Stageshow (Benji Taylor's skill, `~/.claude/skills/stageshow`, `references/motion.md`): every
  change moves and only what changed; result follows press feedback; the result is left on screen;
  an object keeps its identity when it changes; landings decelerate with no bounce.
- Zero To Mastery, *Learn Motion Design*: easing; offset and delay; parenting; transformation;
  masking; overlay; obscuration; parallax; dimensionality.
