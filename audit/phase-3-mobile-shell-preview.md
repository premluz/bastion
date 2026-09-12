# Phase 3 — safe-one mobile shell preview

2026-09-12. Storybook-isolated portion of Phase 3; the real mobile Frame and ScreenStack remain unbuilt.

## Delivered behavior

- Five provisional slots: Home, Markets, Assistant, Trade, Assets. Destination presses update only story-local selection.
- Assistant toggles the shared composer underneath the navigation, with a persistent bottom accent gradient. Drafts survive collapse/reopening.
- Send appends user text locally. Conversation mode also submits a nonempty draft before opening, so the user's message appears in its transcript.
- Conversation hides/inerts the underlying chrome. Collapsing the composer moves the same mounted orb down continuously while destination items, the Assistant label, and composer fade away. The native modal remains transparent over that orb; disabled mic and Close fade in at its final bottom-center position.
- Close/Escape returns to the open composer and restores the conversation trigger's focus. Close composer returns to idle and focuses Assistant.
- Header/footer fade overlays allow scrolling content to disappear beneath the fixed chrome. Long/unbroken messages scroll without pushing controls offscreen.
- Microphone and asset search are disabled preview affordances. No audio permission, real assistant response, resolver call, routing, or wallet action is implemented.

## Scope decisions and open questions

- Prem's follow-up **“Only safe-one theme”** supersedes the brief's multi-theme verification request. All nine new stories pin safe-one. No existing theme file or registration changed.
- §10.9: the five destination labels remain placeholders; this does not approve final destinations or simulated buy/sell.
- §10.8: an expandable bottom composer is demonstrated only. LandingState is not replaced, and persistent versus expandable behavior remains open for production integration.
- §10.10–11: safe-one is the preview identity requested this session, not a decision about the eventual product identity or retirement of other themes.
- The brief describes both “close returns to composer” and “close returns to idle.” This preview follows detailed item 3: conversation → composer; a second close returns to idle.
- §10.3: listening/thinking are visual preview states only. No final trail-versus-direct-answer behavior is chosen.
- §2.1 and §2.14 exempt app-shell chrome from registry-only scene schemas. These components have typed props and stories, but no Zod registry schemas or registry entries. The harness and its hook are story-only helpers.

## Astryx evidence

All checks used the installed `@astryxdesign/cli` and `@astryxdesign/core` **0.1.4**, via `pnpm exec astryx search` and `component` docs, followed by installed source/type inspection.

| Check | Result and use |
| --- | --- |
| `search 'bottom navigation'` | Returned AppShell, MobileNav, SideNav, TabList, TopNav and other generic navigation results; no dedicated bottom navigation primitive. MobileNav is explicitly a slide-out drawer. |
| `component TabList` | Categorized view navigation with `Tab` children and roving focus. Not used for a mixed set of destinations plus a composer action. |
| `component Button`, `IconButton` | Used for provisional destination selection, Assistant toggle, conversation entry, disabled microphone, and close controls. The wrapper uses semantic `nav`, not misleading ARIA tabs. |
| `component Icon` | Closed semantic set includes `microphone`, `close`, `search`, and directional arrows; no broadcast/home/market/wallet equivalents. Docs explicitly permit external SVG components. |
| Existing Heroicons 2.2.0 exports | `HomeIcon`, `ChartBarIcon`, `ArrowsRightLeftIcon`, `WalletIcon`, `SignalIcon`, rendered through Astryx Icon. `RadioIcon` was checked, but depicts a physical radio; SignalIcon supplies the intended broadcast affordance. No new dependency or hand-drawn icon. |
| `search 'chat composer'`; `component ChatComposer`, `ChatComposerInput` | Reused controlled `value/onChange/onSubmit`, rich input and `handleRef`, plus documented `footerActions/sendActions` slots. ChatBarComposer is extracted from ChatBar, not a second composer implementation. |
| `search 'orb voice assistant'`, `search orb` | Voice search returned ChatDictationButton and AI chat templates; orb search returned unrelated generic components. No orb/glow primitive found. |
| `component ChatDictationButton` | Requires a speech-recognition return object and is specific to composer dictation. Not instantiated with fake speech state; a disabled IconButton communicates the unavailable microphone. |
| `search 'dialog icon button search avatar'`; `component Dialog` | Search included fullscreen Dialog. Used `variant="fullscreen"`, `purpose="form"`, controlled open state, and native modal/Escape behavior. Harness explicitly restores the trigger because setting inert can clear focus before Dialog records its opener. |
| `component ChatMessage`, `ChatMessageBubble` | Used for user-only transcript messages in normal and conversation states. |
| `component TextInput`, `Avatar`, `Text` | Used for the disabled search preview, initials avatar, and theme-native navigation labels. |

`components/trail/StepRow.tsx` and `ThinkingTrail.module.css` were inspected. Their wrench/check rail and text shimmer are not compatible standalone orb components. AssistantOrb reuses the continuous shimmer motion token and existing safe-one glow/accent vocabulary with CSS only. No animation package is needed.

## Tokens

Reused semantic values: `--surface-0`, `--surface-1`, `--surface-3`, `--ink-primary`, `--ink-secondary`, `--accent-signal`, `--edge-highlight`, `--glow`, `--scrim`, `--face-ui`, `--tint-strong`, `--motion-enter-duration/ease`, `--motion-exit-duration/ease`, and `--motion-shimmer-duration`.

New **component-tier preview proposals**, implemented in `app/src/theme/shell.safe-one.css` under `[data-theme='safe-one']` only:

- Layout: `--shell-inset`, `--shell-gap`, `--shell-label-gap`, `--shell-control-size`, `--shell-nav-height`, `--shell-edge-width`, `--shell-focus-width`, `--shell-focus-offset`, `--shell-radius`, `--shell-round`, `--shell-fade-height`, `--shell-preview-width`, `--shell-preview-height`.
- Fade treatments: `--shell-fade`, `--shell-transcript-mask`.
- Orb: `--assistant-orb-size`, `--assistant-orb-expanded-size`, `--assistant-orb-fill`, `--assistant-orb-ring`, `--assistant-orb-glow`, `--assistant-orb-halo`, `--assistant-orb-halo-strength`, `--assistant-orb-halo-height`, `--assistant-orb-rest-opacity`, `--assistant-orb-rest-scale`, `--assistant-orb-duration`, `--assistant-orb-ease`.
- Mode transition: `--shell-mode-duration` (existing 480ms primitive), `--shell-mode-ease`, `--shell-controls-delay` (existing enter timing). No new motion scale.

Geometry aliases reference the existing spacing/radius/opacity scales in the theme layer. The proposed rest scale is 0.92; gradients combine existing semantic colors. Components contain no raw colors, glow values, durations, primitive references, or inline style objects. No new Astryx bridge override is introduced. The extension keeps the existing oversized safe-one file untouched. Other themes are intentionally unsupported by these preview tokens, per the narrowed scope; the original five-theme parity check remains unchanged, and a browser test separately checks every extension token resolves.

## Files

Created:

```text
app/src/components/shell/TabBar.tsx
app/src/components/shell/TabBar.module.css
app/src/components/shell/TabBar.stories.tsx
app/src/components/shell/AssistantOrb.tsx
app/src/components/shell/AssistantOrb.module.css
app/src/components/shell/AssistantOrb.stories.tsx
app/src/components/shell/ChatBarComposer.tsx
app/src/components/shell/ChatBarComposer.stories.tsx
app/src/components/shell/ConversationModeOverlay.tsx
app/src/components/shell/ConversationModeOverlay.module.css
app/src/components/shell/ConversationModeOverlay.stories.tsx
app/src/components/shell/MobileShellPreview.tsx
app/src/components/shell/MobileShellPreview.module.css
app/src/components/shell/useMobileShellPreview.ts
app/src/theme/shell.safe-one.css
tests/mobile-shell.config.ts
tests/tsconfig.mobile-shell.json
tests/visual/mobileShell.spec.ts
tests/visual/mobileShellMotion.spec.ts
tests/visual/mobileShell.spec.ts-snapshots/safe-one-idle-chromium-darwin.png
tests/visual/mobileShell.spec.ts-snapshots/safe-one-composer-chromium-darwin.png
tests/visual/mobileShell.spec.ts-snapshots/safe-one-conversation-chromium-darwin.png
audit/phase-3-mobile-shell-preview.md
```

Modified: `app/src/components/shell/ChatBar.tsx` (delegate existing UI to the shared pure composer; connected behavior preserved), `STATE.md` (append-only session entry).

## Verification

```text
pnpm exec tsc -b
exit 0; no diagnostics

pnpm exec tsc -p tests/tsconfig.mobile-shell.json
exit 0; no diagnostics (new shell, stories, and browser-test code)

pnpm lint:tokens
Theme parity OK — 50 semantic/primitive tokens consistent across 5 theme files.
exit 0

pnpm exec storybook build -c .storybook
Storybook build completed successfully
exit 0; 116 story entries, including 9 new shell stories

pnpm exec playwright test -c tests/mobile-shell.config.ts
11 passed
exit 0; saved screenshot baselines compared without update mode
```

Browser checks cover state transitions, user-message preservation, keyboard dismissal/focus restoration, 320/392/430px widths, two distinct transcript shapes (normal prose and long unbroken text), reduced motion, semantic timing, all new stories, and the existing Frame story. Three element-scoped screenshots are saved beside the test; these are the visual review artifacts. The dedicated test config serves the static build on port 6010 without reusing the existing port-6006 server.

The follow-up motion tests run in one browser-process requestAnimationFrame sequence at 320px and 392px. They verify the composer's position underneath nav, the open-state gradient, one persistent orb node throughout, intermediate downward positions, nav/composer fade-out, controls fade-in, and final orb/control alignment. Screenshot baselines were explicitly regenerated for the corrected reference layout. The overlay still supports a standalone orb when no shared nav orb is supplied.

An additional full-app check remains **red on two reproduced pre-existing errors**:

```text
pnpm exec tsc -b app
RiskReturnScatter.tsx(56,20): TS2322 — readonly TooltipPayload cannot be assigned to mutable payload array.
SceneGrid.tsx(7,11): TS2322 — optional max/repeat include undefined under exactOptionalPropertyTypes.
exit 1
```

The TypeScript compiler API reproduced exactly those two diagnostics using only tracked source and HEAD's original ChatBar. Neither file was changed. The requested root `tsc -b` does not cover the full app, hence the additional check and dedicated shell configuration. Existing Storybook chunk-size warnings and Frame's `/logo.svg` 404 remain outside this task. No full Phase 3 or app-wide clean-build claim is made.
