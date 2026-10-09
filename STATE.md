# Bastion — Session state
Read first, append last. Never rewrite history — append only.

---

## 2026-09-12 — Fork from Merlin

Bastion was forked from Merlin (`/Users/przemek/Merlin`) via `git clone` with full history preserved (`git remote remove origin` afterward — no push target). Merlin's own 1500+-line STATE.md, its own 21-phase build history, and its own node-vocabulary.md/tokens-spec.md content are not carried forward as Bastion's law; they remain readable in git history (`git log`) for "why does this exist" archaeology, but Bastion's own phase history starts now, at this entry.

**What Bastion is:** a mobile-only simulated crypto wallet prototype (explore assets, view owned assets, connect a mock wallet, ask an AI trading assistant) reusing Merlin's engine (scene contracts, registry, renderer, trail player, token cascade) with Merlin's desktop shell and enterprise/risk-desk domain content stripped. Full mission/architecture/rules: see `CLAUDE.md`, rewritten for Bastion in this same fork pass (not a find-and-replace — a real per-section rewrite, see the top of this session's fork report for the section-by-section diff summary, or the CLAUDE.md file itself).

**Kept as-is (engine/contracts layers):** `app/src/contracts/scene.ts`, `thinking.ts`, `hydrate.ts`; `app/src/registry/registry.ts` (structure — entries pruned, see below); `app/src/renderer/` (SceneRenderer, FallbackNode, bindings.ts); `app/src/engine/` (resolver, trailPlayer, stores, liveChannel — pane-visibility/artifact-stack machinery reviewed but NOT removed this pass, see open item below); `app/src/components/trail/` (ThinkingTrail and subcomponents, untouched); `app/src/theme/tokens.base.css` and the token-cascade mechanism; `EntityLink`'s data-attribute + delegated-listener pattern.

**Rebuilt this pass (minimal, not the real mobile shell):** `Frame.tsx` and `Sidebar.tsx` had their two risk-desk-specific dashboard-page routes (`portfolio-dashboard`, `risk-dashboard`) removed so the app keeps compiling; `pageStore.ts`'s `PAGES` list updated to match. The REAL mobile shell (`TabBar`, `ScreenStack`, retiring `WorkbenchRow`/pane-collapse/resize) is explicitly NOT built in this pass — that's Phase 3 per the new CLAUDE.md's phase plan. `Frame.tsx` today still renders Merlin's desktop workbench shape; it compiles and its Storybook story still boots, but it is not yet Bastion's mobile shell.

**Pruned from the registry (8 nodes, three artifacts each):** `concentration-map`, `entity-graph`, `geo-panel`, `comparison`, `ring-gauge`, `ring-chart`, `signal-feed`, `status-grid`. Each node's component/story/prop-schema removed as a set; `registry.ts` and `contracts/data.ts` (dropped the `graph`/`geo` DataSet kinds and the `EntityDerivative` sub-shape) updated accordingly. `RiskDashboardPage.tsx`/`PortfolioDashboardPage.tsx` (risk-desk/derivatives-specific pages built on the generic, kept `dashboard-layout` node) deleted.

**Kept, flagged for later re-skinning:** `data-table`, `metric`/`metric-grid`, `sparkline`, `time-series`, `entity-header`, `recommendation` — per the fork spec's own list. Additionally kept (see CLAUDE.md §10 open questions, not silently decided): the full Phase 19–21 "TradableAsset" asset-detail subsystem (`analyst-consensus`, `asset-price-header`, `earnings-history-chart`, `price-movement-timeline`, `ai-rationale-rail`, `trend-chart`, `key-issues-card`, `asset-card-grid`, `asset-trend-card`, `news-feed`) and the domain-agnostic chart nodes `bar-series`/`sparkline`/`contribution-bars`/`risk-return-scatter` — the fork spec's own author didn't have visibility into how far Merlin's registry had grown, so this pass kept rather than guessed-and-pruned; confirm in CLAUDE.md §10. The wallet-connect mock flow (`walletConnectionStore`, `ConnectWalletDialog`) and the Holdings/Watchlist/EntityDetail pages built on it are kept as the explicit starting point for Bastion's own "connect wallet"/"view owned assets" features, per the fork spec.

**Universe/scene content — pruned, not adapted:** all 11 `app/scenes/*.scene.json` fixtures, all `app/universe/*.json` files (including the two TradableAsset golden fixtures and the crypto-flavored-but-still-Merlin-fictional `wallets.json`/`watchlist.json`), `narratives/universe.md`, and `mcp-server/demo-scenes/*` deleted. `scenes/manifest.json` reduced to an empty `{ "scenes": [] }` skeleton with a comment; deleted universe JSON files replaced with empty-but-type-valid `{}` placeholders so `Record<string, X>`-typed imports keep compiling — Bastion's own universe is fresh Phase 1 content, not authored in this pass. `contracts/tradableAsset.test.ts` deleted (asserted against the now-deleted golden fixtures); `engine/tradableAsset.ts`'s fixture lookup now resolves every id to `undefined` (honest empty state) until real fixtures exist. A handful of Storybook stories/Playwright specs that imported deleted scene/universe JSON directly (`TrendChart.stories.tsx`, `Fixtures.stories.tsx`, `Playground.stories.tsx`, `fixtures.test.ts`, `tests/visual/renderer.spec.ts`, `tests/visual/nodes.spec.ts`, `tests/visual/shell.spec.ts`) were patched to either use inline placeholder data or (for `shell.spec.ts`'s single end-to-end test, which asserts against specific deleted query strings/scene content) skipped with a comment rather than rewritten with invented content.

**tokens-spec.md:** kept as-is (color/type/motion OKLCH values, ops-dark/glass/glass-light semantic mappings) — contains no Merlin business vocabulary, only visual-language primitives. Flagged as an open question in CLAUDE.md §10 rather than assumed: keep as Bastion's starting visual identity, or go fresh.

**node-vocabulary.md:** trimmed to the Principles section (verbatim — domain-agnostic register/design law) plus entries for every node kept per the registry prune above (dropping entries for the 8 pruned nodes and the Phase 12/13/14-specific risk-desk sections). See the file itself for the exact cut.

**`audit/merlin-architecture-audit.md`:** NOT touched this pass — it's a point-in-time static-analysis report of Merlin's own component tree, references files now pruned, and goes stale immediately. Not named in the fork spec. Flagged as an open question (CLAUDE.md §10): keep as historical record or delete as dead weight.

**Open items carried to CLAUDE.md §10** (full list and reasoning there, not repeated here): buy/sell simulated action or view-only assistant; analyst-consensus's fit for a crypto context; trail-driven investigation vs. a more direct assistant response model; the TradableAsset subsystem's wholesale retention; the four domain-agnostic chart nodes' retention; signal-feed/status-grid's prune (too aggressive?); the Holdings/wallet-connect precedent's strength; LandingState's bottom-composer-bar replacement (assumed, not confirmed); final tab-bar destinations; tokens-spec.md/theme.safe-one.css retention; d3-hierarchy/d3-array's continued need; the architecture-audit file's fate; narratives/universe.md's deletion (extended the spec's explicit rule by analogy, confirm the extension was correct).

Bastion's own Phase 1 has not started. Next session should read CLAUDE.md in full (especially §10) before writing any code.

## 2026-09-12 — Phase 3 mobile shell, Storybook-isolated preview

Prem explicitly scoped this session to the Phase 3 shell preview, then narrowed themes to **safe-one only**. Built TabBar, AssistantOrb, ConversationModeOverlay, and the shared pure ChatBarComposer extracted from the existing ChatBar. A Storybook-only MobileShellPreview/hook owns provisional selection, composer drafts and user-only transcripts. No Frame/pageStore/routing/ScreenStack integration, resolver calls from the preview, assistant responses, microphone recording, or wallet actions.

Behavior: idle → Assistant opens composer above nav → broadcast action enters native full-screen conversation overlay; Close/Escape returns to composer, Close composer returns to idle. Focus restoration, background inertness, token-driven chrome fades/orb motion, reduced motion, long-message scrolling, and mobile touch targets are verified. Nine new safe-one stories and three screenshot baselines ship. Shell chrome is exempt from registry Zod schemas under §2.1/§2.14.

**Gate:** root `pnpm exec tsc -b`, dedicated shell/story/test typecheck, `pnpm lint:tokens`, and Storybook build pass. Built index contains 116 entries. Focused Playwright suite: **9 passed (3.2s)**, including saved screenshot comparisons and existing Frame smoke test. Additional `tsc -b app` remains red on two baseline errors in RiskReturnScatter.tsx:56 and SceneGrid.tsx:7, independently reproduced against unchanged tracked source; no new shell diagnostics. This completes the requested preview slice, not the full Phase 3 gate.

**Open:** final tab set (§10.9), LandingState/persistent versus expandable composer (§10.8), eventual identity/theme set (§10.10–11), and assistant behavior (§10.1/3) remain undecided. New component-tier tokens live in a safe-one-only extension; other theme files/registrations are untouched. Exact inventory, Astryx lookup evidence, token proposals, and gate outputs: `audit/phase-3-mobile-shell-preview.md`. Existing Frame logo 404 and Storybook chunk warnings remain.

**Raw learning:** root `tsc -b` omits most app code; check shell/app separately. Setting inert can clear focus before a modal captures its opener. CSS durations can serialize in seconds or milliseconds. Storybook strips PascalCase without inserting hyphens: use the built index for story IDs.

## 2026-09-12 — Phase 3 preview correction: composer below nav, continuous orb

Prem corrected the reference interpretation: composer opens **underneath** the nav, with a bottom gradient in the open state. Entering conversation collapses the composer so the same nav orb travels downward continuously; nav destinations, Assistant label, and composer fade out, while mic/close fade in beside the settled bottom-center orb. Implemented in safe-one only. The transparent native overlay reuses the visible nav orb rather than replacing it; standalone overlay usage retains its own orb.

Gate: shell/story/test TypeScript, token lint, Storybook build, and **11 browser tests** pass. Added in-browser rAF motion/identity/geometry checks at 320px and 392px; regenerated the three state screenshots. Original full-app baseline TypeScript errors remain as previously documented. Files and token inventory updated in `audit/phase-3-mobile-shell-preview.md`.

Raw learning: animate the composer's grid track to move one persistent orb through real layout; fading an entire dock and mounting a replacement orb cannot produce the reference's continuous transition.

## 2026-09-12 — Assets/Home page (Home tab)

Built `AssetsHomePage` (Home tab's own always-visible screen): avatar+search row, `theme/glow.module.css`'s existing `.topLeft`+`.topRight` combination behind the balance (colored via `--accent-signal`, a placeholder call flagged pending §10's visual-identity answer, not a new glow primitive), balance figure + `TrendDelta`-based percent/abs change (reused, not re-derived — `nodes/TrendDelta.tsx`'s existing `--delta-up`/`--delta-down` arrow+percent component), a 5-action row (Buy/Send/Receive/Stake/Swap — Swap replaces the reference mockup's own duplicated "Stake"), a Crypto/Earn/NFTs `SegmentedControl` (Earn/NFTs render an honest empty state, no fabricated rows), and a "Your assets" list (`AssetsHomeList` on `List`/`ListItem`) with real per-ticker logos.

**Universe data:** `universe/wallets.json`/`entities.json`/`datasets.json` were still Phase 1's un-authored `{}` placeholders (STATE's own fork entry). Rather than drift into full Phase 1 universe authoring (out of this phase's scope) or invent a parallel data path, authored the smallest honest seed this one page needs — 5 crypto entities (eth/sol/usdc/usdt/gala) with a 7-point `*-price-volume-90d` series each, and one mock wallet holding all five — explicitly flagged here as a minimal Phase-3-scoped seed, not Phase 1 content. `app/src/engine/assetsHome.ts` reuses `HoldingsPage.tsx`'s own `resolveEntityDetail`-based quantity×price math rather than duplicating it; `AssetsHomePage` is a new page alongside `HoldingsPage.tsx` (not a replacement/restyle) since they answer different questions — HoldingsPage is the connected-wallets DataTable view, this is the Home tab's own always-on balance/list view.

**Logos:** real SVGs fetched from `github.com/Pymmdrza/Cryptocurrency_Logos` (`SVG/` dir, `mainx` branch) into `app/src/assets/coin-logos/` (a leaf addition under the existing `app/src/` area, not a new top-level directory) — eth/sol/usdc/usdt/gala, matching the reference mockup's tickers exactly against what universe/entities.json now defines. License check: no top-level `LICENSE` file, GitHub's own detector reports none, but `package.json` declares `"license": "ISC"`; used per the human's explicit approval with an attribution `NOTICE.md` recorded in the assets directory per the declared terms. Static ES module imports only (`CoinLogo.tsx`), no runtime GitHub fetch.

**Wiring:** `TabBar.tsx`'s destinations already had `home` first (Phase 3's prior session) — no reorder needed. The only existing Home-tab integration point is `MobileShellPreview.tsx` (still Storybook-only, not Frame/ScreenStack — real app-shell wiring remains future work per the prior session's own note); it now renders `AssetsHomePage` in place of the plain header+transcript when `activeTab === 'home' && mode === 'idle'`, since the page brings its own avatar/search row.

**Tokens:** no new tokens proposed — every value resolves through existing tokens (`--accent-signal`, `--delta-up`/`--delta-down` via `TrendDelta`, `--space-*`, `--radius-*`, `--surface-2`, `--tint-subtle`). `--glow-color`/`--glow-strength` set via inline `style` per `glow.module.css`'s own documented per-consumer contract (same pattern as `TrendChart`/`KeyIssuesCard`), not a rules violation of the "no inline style" ban, which targets layout/positioning.

**Lint fix:** `lint:tokens`'s hex-value grep false-positived on real brand-color hex codes inside the vendored SVG logo markup (not component code) — added `--exclude=*.svg` to the existing grep, same carve-out category as its pre-existing `astryx-bridge.md` exclude.

**Gate:** `pnpm exec tsc -b` (app) clean except the two pre-existing baseline errors (RiskReturnScatter.tsx:56, SceneGrid.tsx:7, unrelated/reproduced against unchanged tracked source). `pnpm lint:tokens` clean (50 tokens, parity OK across 5 themes). Storybook build succeeds, 121 entries (up from 116; +5 `Shell/AssetsHomePage` stories, one per registered theme — default/ops-dark/glass/glass-light/safe-one, re-checked from `.storybook/preview.ts` rather than trusted from CLAUDE.md text). `pnpm test` (vitest): 16/16 passed, no regressions from populating `entities.json`/`wallets.json` (WatchlistPage/EntitiesPage/AssetCardGrid's own fixture story all read the new data safely — none hardcode against the old empty state).

**Open / flagged, not decided here:** the glow color (`--accent-signal` placeholder) and the whole page's visual identity depend on §10.10's still-open tokens-spec.md question. The 5-crypto universe seed is intentionally minimal — real Phase 1 universe authoring (more entities, non-mock wallet data) remains future work. `MobileShellPreview` is still not the real app shell; Home-tab wiring will need to move to `Frame`/`ScreenStack` once Phase 3's real shell integration lands.

### 2026-09-12 — Account screens in MobileFrame

Built the requested account-menu/page-preview transition, fullscreen sheets entering from mid-screen, account list/edit/add flows, reusable HistoryItem and filterable mock history. Originating page and scroll stay mounted; tapping the minimized page returns. Account edits and creation are local preview state. Added entry stories under Shell/MobileFrame and row variants under Shell/HistoryItem. Safe-one screenshots reviewed at 320px and 392px.

Gate: focused account TypeScript, Storybook build, token lint and diff checks pass; 6 Chromium tests pass. Full-app TypeScript still has only the two prior RiskReturnScatter/SceneGrid errors. No engine/store or dependency changes. Details: `audit/phase-3-accounts.md`.

### 2026-09-13 — Phase 6 ETH conversational mockup and ApprovalCard

User explicitly requested a simulated ETH purchase flow. Added streamed replies, shimmering statuses, a one-second best-price stage, fading funding approval and scene-driven staggered quote. Entry is a typed buy-ETH query or Shell/MobileFrame/BuyEth. Confirmation is local simulation; both supported funding currencies remain consistent throughout the quote.

Follow-up design correction: replaced the funding-only node with reusable ApprovalCard, a subtler border and native left-aligned RadioList controls. Multi-question stories expose horizontal carets, question count, Skip/Continue, optional dismissal and custom answer; single-question ETH cards omit the multi-question footer. No dependency or wallet integration added.

Gate: 40 unit/contract tests and 8 browser tests pass, including three screenshot baselines; focused new-code TypeScript, Storybook build, token lint and diff checks pass. Full-app TypeScript retains only the two existing errors. Report: `audit/phase-6-buy-eth.md`. Learning: Astryx Button wraps children as button text; use RadioList for radio-option rows rather than custom marker spans inside Button.

### 2026-09-13 — Alternate pill navigation component

Added Shell/PillNavigation independently of the current TabBar: Home, Explore, Assets, Assistant in a pill; detached +/× toggles a floating Add cash/Send/Receive/Trade popover. Five interactive stories, typed host callbacks, semantic tokens and reduced-motion support. Existing navigation retained as requested.

Gate: focused TypeScript, Storybook build, token lint and diff checks pass; 4 Chromium tests and 2 screenshot baselines pass. Report: `audit/phase-3-pill-navigation.md`. Learning: Astryx Popover suppresses reopening for 50ms after hide; rapid repeat-action tests must account for that guard.

### 2026-09-13 — Pill composer reveal and stretchy active highlight

Added a persistent composer slot underneath PillNavigation, with height/fade/slide reveal and bottom gradient. Storybook Assistant opens the shared ChatBarComposer, preserves drafts and supports submission. Active fill is now one sliding indicator with a brief 118% stretch and 480ms eased settle. Existing TabBar retained. Reduced motion disables both animations.

Gate: focused TypeScript, Storybook build, token lint and diff checks pass; 7 Chromium tests and 3 screenshot baselines pass. Report: `audit/phase-3-pill-motion.md`. Learning: sample related animated-element geometry in the same browser evaluation.

### 2026-09-13 — Phase 5 Explore composed from registry nodes

Built Explore in MobileFrame's second navigation destination as authored Scene JSON, not an ExplorePage component. New reusable AssetRow (owned/market), ProminentAssetCard (Perp/Earn, optional price/change/Sparkline), ContentGroup (heading/chevron/layout) and LinkChips nodes each ship schema + stories. Home owned rows now use the same AssetRow via renderer; its shell/header and row selection remain. Categories, perpetual subfilters, group/list drilldowns and asset previews use shell-delegated links with mock fixture data. Safe-one stories; no new dependencies.

Completed prior Default pill-nav integration and popover correction: right-aligned labels/icons, exact +/× icon center alignment, no separators; classic nav retained. Gate: 49 unit tests, 5 Explore browser tests with five snapshot diffs, 7 pill browser tests with three refreshed baselines, Storybook build, token lint and whitespace checks pass. Full-app TypeScript still reports RiskReturnScatter, SceneGrid and untouched Home PromoCard optional-icon errors; raw headlines and files in `audit/phase-5-explore.md`.

Learning: Astryx Token does not forward arbitrary data/ARIA props; use a native wrapper for delegated actions/current state. ClickableCard's hidden accessibility anchor is a keyboard target, while pointer tests must click the visible card surface. Scene groups/filters are selected by explicit stable IDs, never display labels.

### 2026-09-13 — Explore chart full bleed

Per user correction, prominent-card sparklines reuse AssetCardGrid's AssetTrendGlyph via an optional block Sparkline variant. Existing bleed styles cancel the card inset on both sides and bottom; directional gradient fills the chart area. Inline sparklines unchanged. Gate: 49 unit tests, six Explore browser checks/snapshot diffs, Storybook build and token lint pass; same three unrelated TypeScript errors remain. Details: audit/phase-5-explore.md. Learning: measure chart/card edges after the renderer's entrance transform settles, even when reduced motion is requested.

### 2026-09-13 — Phase 6 Send $50 to Paul

Added the authored insufficient-balance → consolidation → final transfer-review scene. Typed entry and Shell/MobileFrame/SendToPaul share per-message flow state across composer/conversation. Existing ApprovalCard offers the three funding choices; new registry PaymentCard supplies recipient/amount/details and Accept/Edit/Cancel chips with schema and four stories. Mock Main $18 + secondary USDT $20 + USDC $24 consolidate to $62 at disclosed simulated 1:1; only final Accept debits $50.08. Edit validates the fee; Cancel retains consolidated funds. Alternative funding has its own approval before transfer review. No real funds or wallet state changed.

Gate: 62 unit/contract tests, five send browser tests with two snapshot diffs and six Explore/Home/composer regressions pass. Storybook build, token lint and whitespace checks pass. Same three unrelated TypeScript errors remain (RiskReturnScatter, SceneGrid, AssetsHomePage optional icon); raw headlines and file inventory in audit/phase-6-send-money.md.

Learning: use safe flex-end for bottom-aligned scrollable transcripts; plain flex-end can place long card content above the scroll origin. Scope interaction tests to the active semantic transcript: opacity-hidden/inert mirrors can still match Playwright :visible, and Astryx buttons include their own status nodes.

### 2026-09-30 — safe-one glass edges, orb halo, page landing motion

Direct feedback: composer glow should read as an AI orb (subtle), composer border more coloured (subtle), borders toward glass with top-lit gradient fading downward, decisive subtle page-landing stagger. New semantic tokens in all 5 themes: `--glass-fill`, `--glass-sheen`, `--glass-edge`, `--glass-edge-accent`, `--glass-shadow`, `--halo-fill`, `--shell-ambient`; safe-one carries the new look, the other four reproduce their prior look (`none` edges/sheen/ambient, original single-colour halo). `--assistant-orb-halo` now aliases `--halo-fill`. Gradient edges are painted as layered backgrounds (edge on border-box, fill+sheen on padding-box, transparent border) — the only way to keep border-radius; the pill uses a `::before` layer so it can still fade. Applied to composer, text inputs, panelFlat/cardSurface1 cards, pill nav + toggle, wallet tab switch, BalanceCategoryCard, ContributingBalanceRow tiles. Page landing: `.page` sections rise from a soft blur with `--shell-page-*` tokens; `<main>` keyed per tab so it replays on tab switch.

Deviation to confirm: BalanceCategoryCard had a 2026-09-16 "no border" ruling; it now carries the top-lit glass hairline in safe-one only (other themes keep no edge). Non-safe-one pill loses its faint `--pill-edge` outline (glass edge is `none` there).

Gate: theme parity OK (57 tokens), tsc only the two baseline errors, safe-one shell screenshot test re-baselined (3 snapshots, intentional) and passing; landing stagger measured in-page (sections opacity 0 → 1 within 1.2s). lint:tokens fails only on two pre-existing committed `rgb()` scrim fallbacks (PillNavigation/Sheet). Pre-existing visual-suite failures unrelated to this change: tests reading removed `shell.safe-one.css`, dock-composer locators (composer moved to overlay 2026-09-16), changed transcript copy in buyEth/sendMoney, renderer stress-test height, pruned concentration-map.

Learning: a gradient layer clipped to border-box paints the whole interior too — the fill layer above it must be opaque-ish or the edge tints the surface (used deliberately on the translucent composer).

### 2026-09-30 (cont.) — Island-morph tab switch, larger glass search, header shade

Direct feedback: Money/Investments switch should enter like a Dynamic-Island tab bar (pane springs out from island footprint; active bg must not bounce on entrance); header search larger and clear glass; a shade under the header that content scrolls beneath, with the corner glow above it.

Motion primitives added (tokens.base.css): `--ease-spring-snappy/-soft/-pop` (sampled damped springs as `linear()`, ζ .7/.82/.5), `--duration-300/-380/-550`. shell.css: `--morph-*` tokens (from 126×36, scale .75, content .9; width 380ms snappy, height 300ms soft, pop 550ms, fade 120ms), `--shell-search-height` (48px; `--shell-header-height` now follows it), `--shell-header-shade(-height)`, `--shell-ambient-height`. Themes: `--glass-fill-clear` (safe-one .38 alpha; others `--surface-1`); safe-one `--shell-ambient` re-proportioned for its band.

WalletTabSwitch: glass moved to a `::before` pane that morphs (only `from` keyframes, so springs overshoot the real geometry); tabs/track grow in after it; `data-switched` (set on first user switch) gates the squash-stretch; `data-entrance` opts its section out of the page rise. MobileFrame: `.topFade` restored on pages as a translucent shade, `::after` paints `--shell-ambient` above it (replaces the 09-16 `display:none`); header search gets `--size-element-md`/`--field-glass-fill` overrides by inheritance; avatar button blurs its backdrop.

Bug fixed from the earlier pass: the page-stagger reduced-motion override lost on specificity, so the stagger ran under reduced motion — the animation rule now lives inside `@media (prefers-reduced-motion: no-preference)`.

Gate: measured in-page — pane 124px → 391 peak → 380 settled, scale .75 → 1.04 → .99 → 1, opacity 1 by ~120ms, ≈550ms total; highlight 0 animations on entrance, stretch present after a switch; tab row 0 page-rise animations. Parity OK (58), tsc baseline-only, lint:tokens only the pre-existing committed rgb() fallbacks, vitest unchanged (6 pre-existing sendMoneyState failures). safe-one-idle baseline regenerated (1 of 3 — composer/conversation cover the header and are unchanged); 5/5 consecutive passes. Not built: the reverse/exit morph (the switch unmounts with the page, nothing to animate out without keeping it mounted).

Learning: the first screenshot run right after a CSS edit can capture Storybook's pre-HMR bundle — rerun before trusting a 1% diff.

### 2026-09-30 (cont.) — Send to Paul: sending screen, recede, payment pane

Direct feedback: payment pane styled like the "Which Paul did you mean?" card; Accept recedes the page into depth (smaller than the account push, centred) with a scrim; a sending screen with calm emitting ripples, sequential chevrons between two avatars, shimmering "Processing…", and after 3s the glow turns green, avatars converge, a green mark pops in and a check draws.

Engine: new `sending` stage (review Accept → `sending`, `SEND_DEMO.sendingMs` 3000; `tickSend` lands it as `sent` and debits then — so Cancel mid-send debits nothing), `acknowledged` + `done` action to dismiss success. `useSendMoneyFlows` schedules the sending deadline. PaymentCard contract mode gains `sending` (actions hidden). Test helpers updated to the current flow (recipient + Continue) — the 6 previously failing tests were stale helpers from before the recipient question; now 63/63 pass, incl. new sending/cancel/done coverage.

UI: `SendingScreen` (Astryx Dialog, transparent over its own scrim, story Shell/SendingScreen) + `SendingScreenMount` mounted once in MobileFrame — not in the transcript, which mounts in up to three overlays (Astryx's non-inline Dialog keeps children mounted while closed). Composer/Conversation overlays take `isReceded` (scale .94, blur 8, 55% opacity, radius; tokens in new `theme/sending.css`). Colours are semantic only (`--accent-signal` → `--accent-ok`), no per-theme values. Shimmer reuses ThinkingTrail's `.shimmerText` via CSS-modules `composes`. Avatars: Astryx Avatar size 64 (named `large` is 128) with `src` `/avatars/<id>.png` from `app/public/avatars/` — `me.png`, `paul-bennett.png`, `paul-morgan.png`; initials until files exist. PaymentCard `.details` now uses ApprovalCard's pane tokens.

Gate: end-to-end in Storybook (safe-one) — Accept → sending dialog, composer layout scale .94, ripple/chevron/shimmer animations running; after 3s success: green glow opacity 1, mark opacity 1, check dashoffset 0, status "Sent"; Done closes it, un-recedes, "Payment simulated." outcome present; no page errors. Parity OK, tsc baseline-only, lint:tokens only the pre-existing rgb() fallbacks, safe-one shell screenshot passing. tests/visual/sendMoney.spec.ts was already failing on stale copy/locators and does not yet cover the sending stage.

Learning: Astryx Avatar's named `large` is 128px, not a step above medium's 48 — use its numeric scale when a layout depends on the size.

### 2026-09-30 (cont.) — Restrained palette, scene-page stagger, notch-drop morph

Direct feedback: accents (purple/green/red) and allocation colours too neon — restrained but modern; every page should stagger in like Wallet; the Money/Investments entrance was cartoony/abrupt and "just stretches to the sides" — should come down and widen as if from under the notch.

Palette (safe-one only; hues unchanged, so principle 8's semantic hues hold): accent-signal .7/.11, alert .66/.12, warn .76/.1, ok .73/.1, delta-up .75/.12, delta-down .69/.14 (+ bg twins), viz-1..6 at ~.68/.08; composer accent edge, orb halo and ambient chroma reduced to match.

Stagger: `merlin-reveal` gained `--reveal-rise/-blur/-duration/-ease` hooks (fallbacks = the original 4px/no-blur/motion-enter values, so scenes elsewhere are unchanged); `.page` feeds them the landing tokens under `prefers-reduced-motion: no-preference`. Explore scene nodes now carry `reveal` (section k → k, children k+1+j) and its `<main>` is `data-scene-page`, which keeps the section rise off it (no double animation). Home coin rows get `reveal: index + 1` in `ownedAssetsScene`. Measured: Explore 28 reveals at 0–540ms, Home rows 60–300ms, Wallet unchanged.

Morph: scale pop removed; `morph-drop` (island-sized pane translates down `--shell-header-height - --space-12`, 320ms ease-float, faded in by ~110ms), then after 200ms width/height widen on the soft spring (124 → 383 → 380px); tabs fade/settle 400–600ms. Removed now-unused primitives `--ease-spring-snappy`, `--duration-300/-380`.

Gate: parity OK, tsc baseline-only, vitest 63/63, lint:tokens only pre-existing rgb() fallbacks; safe-one shell baselines regenerated (3/3, palette) and 3/3 consecutive passes.

### 2026-09-30 (cont.) — Header glass that actually blurs; liquid-glass press on action circles

Direct feedback: search and avatar should have background blur; Add money/Send/Withdraw should press in on hover, further on click, and spring elastically (Apple liquid glass).

Root cause (measured, not guessed): the header search is a disabled preview TextInput, and Astryx dims disabled fields with `opacity: .5` on the same wrapper carrying the backdrop-filter — so the blurred backdrop was composited at half strength over sharp content and text read straight through. Bisected by placing a test glass at every ancestor level (all blurred; only the wrapper itself failed) before reading its computed opacity. Fix: `.header .astryx-text-input { opacity: 1 }` (inflated specificity). Also `--shell-header-backdrop` (blur 24 + saturate 1.4) for search + avatar button, `--glass-fill-clear` .38 → .62, avatar button gets the clear glass fill.

Press (WalletActionRow `.iconShape`, both shapes): glass edge + sheen layers; hover `--press-hover-scale` .95 (hover-capable only), `:active` .88 over 120ms decel, release rides a 550ms `--ease-spring-pop` transition — measured .88 → .961 → .948 → .95 (overshoots, then settles). Hover overlay kept as a top background layer.

Gate: parity OK, tsc baseline-only, vitest 63/63, lint:tokens only pre-existing rgb() fallbacks; safe-one baselines regenerated (2) and 3/3 passes.

Learning: backdrop-filter plus opacity < 1 on the same element leaks the unblurred backdrop through — check the element's own opacity (e.g. disabled states) before blaming ancestors.

### 2026-09-30 (cont.) — WalletActionRow tile hit area

Direct feedback: Add money/Send/Withdraw need a rectangular hit area including the label. Each tile is now a native `<label>` wrapping the IconButton + caption (no visual panel — the 09-15 "no pane around it" ruling stands); the label's activation behaviour forwards clicks, and press states key off `.action:hover/:active`. Measured: tile 122×72 vs circle 48×48; caption, tile edge and circle each fire exactly one button click; hovering the caption presses the circle to .95. vitest 63/63, safe-one shell screenshot passing.

### 2026-09-30 (cont.) — Press + ink highlight on main nav and action captions

Direct feedback: action captions should highlight too; main nav should get the same press. WalletActionRow caption (`.caption`) lifts --ink-secondary → --ink-primary on tile hover/active. PillNavigation destinations + quick-actions toggle share the `--press-*` tokens (hover .95 + destination ink lift on hover-capable devices, :active .88 fast, spring release); reduced motion drops the transitions. Measured in-page: nav hover .95 / ink primary, active .88; toggle hover .95; caption ink primary on hover. tsc baseline-only, vitest 63/63, safe-one shell screenshot passing.

### 2026-10-01 — Dock ⇄ composer liquid morph

Direct feedback: the nav toolbar and the composer should be one "liquid" element that morphs with page context (reference: macOS Spotlight splitting its bar into buttons). Implemented with the native View Transitions API (no dependency): `morphDock()` (components/shell/dockMorph.ts) runs the mode change inside `document.startViewTransition(() => flushSync(update))`, falling back to an instant switch without API support or under reduced motion; `toggleComposer`/`closeComposer` go through it. Shared names, applied only in the state where each element is visible (a duplicate name aborts the transition): nav `.pill` ⇄ composer root = `dock-bar`, `+` toggle ⇄ `.astryx-chat-send-button` = `dock-action`. theme/dock-morph.css paints the `dock-bar` group itself as the glass stadium (always inside both end shapes) so the shape morphs on `--ease-spring-soft` while contents keep natural size (`object-fit: none`) and cross-fade through an 8px blur; the overlay's own slide-up is suppressed during a morph via `:root[data-dock-morph]`. Tokens `--dock-morph-*` in shell.css.

Gate: both directions verified in-page — transition `ready` resolves (not aborted), `dock-bar`/`dock-action` group/old/new animations present, no console errors; mid-frame captures show the pill swelling into the composer and the bar splitting back into pill + circle. tsc baseline-only, vitest 63/63, parity OK, safe-one shell screenshot passing (reduced-motion path).

### 2026-10-01 (cont.) — Dock morph v2: persistent bar, staggered icons

Direct feedback on v1 ("not just fade — the toolbar persists, icon buttons stagger fade out as it scales up to become the input field, then the input's buttons stagger in"). Every icon now has its own view-transition name (nav: highlight `dock-nav-0`, destinations 1–4 via nth-of-type, `+` toggle 5; composer: field `dock-input-1`, mic/voice via `data-dock-item`, send `-4`), which lifts them out of the `dock-bar` snapshot — the bar is pure glass that stretches (images `height: 100%`), and each icon is a one-sided group with its own staggered clock: out left→right one `--motion-table-stagger` apart (120ms, blur + .8 scale), bar starts after the first item (`--dock-bar-delay`), input controls in from half the bar's travel, nav returns from a third (while the bar still contracts). Composer slide-up moved under `@supports not (view-transition-name: none)`: suppressing it only during the morph restarted it when the morph ended (caught in frame captures: blank frame + second slide-up); the now-unused `data-dock-morph` flag removed.

Gate: both directions `ready` ok with all 13 dock groups, no console errors, frame strip shows stagger-out → glass stretch → stagger-in with no blank frame. tsc baseline-only, vitest 63/63, parity OK, safe-one shell screenshot 4/4 after one post-edit HMR miss.

### 2026-10-01 (cont.) — Quick-actions popover as elevated glass card

Direct feedback: the `+` context menu should match the Crypto/Money balance tile container, elevated. `.popover` (Astryx Popover root, inflated specificity) now uses the tile's glass recipe (sheen + --surface-2 + --glass-edge, --shell-radius) plus `--glass-shadow, --shadow-z3` with the paired `--blur-z3` backdrop (z-depth rule: shadow + blur step together). Verified computed radius 12px, z3 shadow, 24px backdrop blur; screenshot reviewed. safe-one shell screenshot passing.

### 2026-10-01 (cont.) — Quick-actions menu: liquid glass pop, stagger, scrim over nav; avatar glass

Direct feedback: + menu rounder, bounces larger → smaller → actual, liquid glass, items stagger in; scrim must cover the nav icons (not the close toggle); menu had lost its blur; header avatar needs the search's elevated glass + blur.

Root cause for the lost blur (measured): Astryx Popover's visible surface is an unclassed outer wrapper painting opaque `--color-background-popover`; the earlier glass sat on the classed inner `.astryx-popover`, so an opaque, less-rounded box showed behind it (a square edge past the corners) and blocked the backdrop. Glass + pop now live on the wrapper via `div:has(> .popover.astryx-popover)` (inflated specificity), inner cleared. Panel: `--glass-fill-clear`, radius `--pill-menu-panel-radius` (2× shell radius) with concentric item radius; `pill-menu-pop` (scale .6 → 1 on `--ease-spring-pop`, `scale` property so Astryx positioning is untouched, origin bottom-right) + 120ms fade; items rise/blur in bottom-up one table-stagger apart. Nav pill gets its own `::after` scrim layer while open (the dock is a single stacking unit above the page scrim so the toggle stays clickable). Avatar button: same glass recipe as the header search (edge, sheen, clear fill, --glass-shadow, header backdrop). `--pill-menu-radius` removed (no consumers).

Gate: measured pop .635 → 1.062 → .990 → 1.0, items bottom-up stagger, wrapper radius 24px / clear fill / blur 24 + saturate; corner hit-test lands on the popover itself (no stray box); screenshot reviewed. tsc baseline-only, parity OK, lint:tokens only pre-existing rgb() fallbacks, safe-one shell screenshot 3/3.

### 2026-10-01 (cont.) — Pill pane stays under the quick-actions scrim

Direct feedback: opening the + menu faded the nav pill's pane as well as scrimming it. Removed the 09-16 rules that hid the pill's glass `::before` and the active `.indicator` while open (they predate the pill's own scrim layer); the pill now stays intact and is dimmed only by its `::after` scrim, like the page. Verified: pane opacity 1, indicator 1, scrim layer present; screenshot reviewed; safe-one shell screenshot passing.

### 2026-10-01 (cont.) — Condensed payment pane; avatars above sending ripples

Direct feedback: the payment details pane should be condensed like Explore's Perps cards; on the sending screen the avatars should sit on top of the ripples. PaymentCard `.details` now 16px inset, rows 8px apart at --text-14, list bottom margin 12 (pane 297 → 207px tall). SendingScreen `.party` is an opaque glass disc (--surface-2 + sheen + edge) at z-index 1 — the avatar's own fill is translucent, so ripple lines read through it before. Screenshots reviewed; vitest 63/63, safe-one shell screenshot passing.

### 2026-10-01 (cont.) — "Show touches" demo aid with Settings toggle

Direct feedback (spec supplied): 44px flat fingertip dots — primary ink at 16% fill, 2px ring at 50%, no shadow/blur; one per pointer, centred and tracking every frame; down 150ms decel from 80%, release 250ms fading while growing to 125%; cancel leaves like release; off → nothing drawn; never intercepts touches. Configurable in user Settings.

New: `engine/stores/showTouchesStore.ts` (zustand + its built-in `persist` middleware — no new dependency; device preference, off by default, key `bastion-show-touches`); `TouchIndicators` (shell) mounted in MobileFrame; "Show touches" Astryx Switch in AccountInfoPage's Settings screen. Dots are created/moved imperatively (CSS custom props → `translate`) so tracking never waits on React; the layer is a `popover="manual"` element so it renders in the top layer above the app's modal dialogs, re-raised on each press and after each click. Applies to all pointer types (a desktop mouse press shows a dot too — this prototype is demoed in a desktop browser). Tokens `--touch-*` in shell.css; primitives `--duration-150/-250` added for the spec'd timings.

Gate: in-page — Settings switch writes `enabled: true`; dot centred on pointer (200,400), 44px, 2px ring, 16%/50% ink, pointer-events none; tracks to (260,450); mid-release scale 1.15 / opacity .4, removed after; taps still reach the app (composer opened) and the dot draws above the composer dialog without being hit-tested; off → 0 dots; no page errors. tsc baseline-only, vitest 63/63, parity OK, safe-one shell screenshot passing.

### 2026-10-01 (cont.) — Composer ⇄ conversation orb morph

Direct feedback: starting conversation mode, the composer should morph into the sphere — shrink fully round and move down decisively. The orb (ConversationModeOverlay `.indicator > :first-child`, non-shared-orb path) now shares `dock-bar` with the composer; `openConversation`/`closeConversation` run through `morphDock` with transition types `to-orb`/`from-orb` (`morphDock` gained a `types` arg, used only where `ViewTransition.prototype.types` exists). For those types dock-morph.css clips the image pair round (stadium → circle) and swaps the spring for `--orb-morph-ease` (ease-float, no bounce); the composer's controls still stagger out. The orb image surfaces from a quarter of the travel (`--orb-reveal-*`) — a half-travel start left an empty frame. The nav pill is now named only in idle (`isComposerOpen = mode !== 'idle'`), else it duplicated `dock-bar` with the orb and aborted the morph. Conversation overlay slide-up moved under `@supports not (view-transition-name: none)`, like the composer's.

Gate: nav→composer, to-orb, from-orb, composer→nav all `ready` ok, round clip active only for the orb types, no console errors; frame strips reviewed for both directions (no gap). tsc baseline-only, vitest 63/63, parity OK, safe-one shell screenshot 2/2.

### 2026-10-05 — Phase 6 voice turn-taking refinement

Direct feedback: voice mode should accept another spoken request without another mic tap. Recognition now commits the visible transcript after two seconds without new words, then rearms; repeated identical recognition results do not extend the silence timer, and an unexpected browser `onend` preserves the pending words while restarting. Closing discards an unfinished turn. An unmatched *voice* query gets “I can’t help with that yet. Try saying, ‘Send $50 to Paul for coffee.’” Typed chat remains unchanged.

Gate: 7 focused Storybook browser tests and 65 Vitest tests passed; Storybook production build passed; `git diff --check` passed. App build remains red only on the existing `RiskReturnScatter.tsx`/`SceneGrid.tsx` type errors; token lint remains red only on the existing `PillNavigation.module.css`/`Sheet.module.css` RGB fallbacks. No dependencies or visual tokens added. Open risk: device speakers may feed narrated MP3 audio back into the active microphone; hardware echo behavior has not been measured.

Learning: `SpeechRecognition` may end before an app-defined silence timeout; the pending transcript and timer must survive a recognizer restart to keep a single spoken turn intact.

### 2026-10-05 (cont.) — Daniel transfer flow and compact choices

The send demo now accepts a single sentence containing “send” and “dollars,” defaults to $50 when no amount is spoken, and uses Daniel Smith/Jones throughout the scene and final agent-serif reply. Recipient selection advances directly; the send-only approval navigation keeps a disabled Continue on the recipient step and a right-aligned primary Continue on funding, with Skip and pagination removed. The available-across-accounts panel and contact handles are hidden, visual radio circles are hidden without removing keyboard access, voice transcript bottom spacing is increased, and inline sending ripples fit their route.

Gate: 16 focused send/voice browser tests and 3 generic approval-card tests passed; Vitest 66/66 and Storybook build passed. App build remains red on the existing `RiskReturnScatter.tsx`/`SceneGrid.tsx` type errors; token lint remains red on the existing `PillNavigation.module.css`/`Sheet.module.css` RGB fallbacks. The MP3 narration still says Paul, and device-speaker echo into the active mic remains unmeasured.

### 2026-10-05 (cont.) — Suppress narration echo in voice mode

The send-MP3 queue now aborts speech recognition before playback, discards any interim words, and keeps it suspended across queued clips. Recognition rearms after the final clip or a playback error, without adding narration to the transcript. The mic control shows a crossed-out paused state; an invisible, accessible button over the orb restarts listening after a manual stop or recognition failure without changing the orb's morph target.

Gate: all 8 voice browser tests pass, including echo suppression, queue continuity, and orb recovery; 2 orb motion tests, Vitest 66/66, and Storybook build pass. App build remains red only on existing `RiskReturnScatter.tsx`/`SceneGrid.tsx` errors; token lint remains red only on existing `PillNavigation.module.css`/`Sheet.module.css` RGB fallbacks. No dependency added. Hardware acoustics are not measurable in the browser harness, but recognition is inactive for every MP3 playback interval.

### 2026-10-05 (cont.) — Immediate recognized voice scenarios

A finalized speech result that matches the existing send parser, buy-ETH parser, or scene resolver now submits immediately instead of waiting for the two-second silence timer. Interim recognition remains editable; unmatched speech still uses that timer. The fast-path detection reuses the same parsers/resolver as normal submission and ignores stale asynchronous matches after the transcript changes.

Gate: 8 voice browser tests pass, including send, buy, and manifest scenes with the test clock frozen and the unmatched pause fallback; Vitest 66/66 and Storybook build pass. App build and token lint remain red only on the previously documented unrelated errors. No new dependency or visual token.

### 2026-10-05 (cont.) — Mode-specific send questions

The two send questions now use mode-specific controls. Voice hides Continue and advances immediately when a recipient or funding choice is selected. Typed chat keeps each selection pending until Continue, shows “1 of 2” / “2 of 2,” and lets the arrows revisit either question with the prior answer preserved. Switching modes updates the controls without resetting the current question.

Gate: 22 focused browser tests, Vitest 67/67, and Storybook build pass. App build remains red only on the existing `RiskReturnScatter.tsx`/`SceneGrid.tsx` type errors; token lint remains red only on the existing `PillNavigation.module.css`/`Sheet.module.css` RGB fallbacks. No dependency added.

### 2026-10-05 (cont.) — Voice welcome and interface sound cues

Opening voice mode now plays `how-can-i-help.mp3` through the existing queued playback path. Recognition stays paused for the clip and resumes afterward; typed chat requests do not replay send narration. Original low-level Web Audio cues mark taps inside the assistant UI and listening start/end, while narration suspension does not trigger the listening-end cue. No sound dependency or sourced asset was added.

Gate: 20 focused voice/send browser tests, Vitest 67/67, and Storybook build pass; `git diff --check` passes. App build remains red on the existing `RiskReturnScatter.tsx`/`SceneGrid.tsx` type errors, and token lint on the existing `PillNavigation.module.css`/`Sheet.module.css` RGB fallbacks. Open risk: actual speaker/device sound quality and fresh-profile microphone permission timing need hands-on review; automated tests verify cue and playback ordering, not perceived timbre.

### 2026-10-05 (cont.) — Spoken send choices and confirmation-gated transfer

In voice mode, finalized speech containing exactly one current-question keyword selects Daniel Smith/Jones or Consolidate/Swap/Buy immediately, without a chat bubble or silence wait. Ambiguous and partial-word matches do not select. Accepting the transfer in voice mode now enters `confirming`: the review card stays put, 06a/06b/06c plays for the selected funding route, and only that clip's `ended` event starts the simulated transfer. Playback failure returns to review for retry. A chat-origin transfer switched to voice gets only the confirmation clip; chat-mode Accept still starts sending immediately.

Gate: 26 focused browser tests, Vitest 71/71, and Storybook build pass; app build and token lint remain red only on the previously documented unrelated errors. The supplied 06a, 06b, 06c, and 07 MP3s are byte-identical today, so the route-specific clip mapping is distinct in code but not yet audible. No dependency added.

### 2026-10-05 (cont.) — Prototype availability notices

Added one shared prototype-limit notice for unavailable wallet, account, activity, quick-action, and Explore drill-down interactions. Desktop hover uses an Astryx tooltip; mobile uses the top toast, with supported account Settings and Explore category/perps tabs remaining functional. Card Manage continues to open card details, and quick-action buttons no longer start inactive flows.

Gate: focused prototype/Explore browser coverage 9/9, Vitest 71/71, and Storybook build pass. App typecheck remains red only on the existing `RiskReturnScatter.tsx`/`SceneGrid.tsx` errors. No dependency added.

### 2026-10-05 — Bastion theme colour refinement (copper, flat cards, concrete selected tab)

Direct feedback against a reference image, colour only (no layout). theme.bastion.css: surfaces/ink hue 80 → 60 (warmer brown-black), accent apricot `.82 .075 58` → copper `.72 .095 52` (accent edge + ambient follow), cards flat — `--glass-sheen: none`, `--glass-edge` a uniform `--edge` hairline, `--glass-shadow: none`. New semantic token `--surface-selected` (bastion: concrete grey `.31 .008 60`; the other five themes alias `--surface-3`, so they are unchanged), consumed by the WalletTabSwitch and pill-nav highlights in place of `--surface-3`. Parity OK (61 tokens, 6 themes); screenshots of Home/Wallet reviewed; safe-one shell screenshot passing.
Correction to the entry above: the safe-one shell screenshot test is NOT passing — `safe-one-composer.png` fails with a diff that varies run to run (46 / 4,248 / 4,294px), confined to the composer's bottom-right (voice/send buttons, ~x202–371, y683–747). Not caused by this change (in safe-one `--surface-selected` aliases `--surface-3`, identical render); no animations are running there once settled, so it looks like capture-time state (focus/tooltip) around controls changed outside this session (voice-choice / assistant-sound work). Baseline deliberately not regenerated — needs a decision from whoever owns that composer change.

### 2026-10-05 (cont.) — Bastion base = #12100E

Direct feedback: background should be #12100E. Converted exactly to `oklch(.175 .005 68)` for `--surface-0`; the ramp above it lifted with it (`.195 / .225 / .26`, selected `.33`, hue 68) so `--surface-1` consumers (nav, tab track, search, menu) never sit darker than the page; glass fills, `--surface-1-solid`, `--pane-surface`, scrim and canvas backdrop follow. Verified: rendered page background samples #12100E; Wallet screenshot reviewed (cards still separate). Parity OK.

### 2026-10-05 (cont.) — Bastion outlined cards (#161513)

Direct feedback: cards should be an outline variant — fill #161513, barely above the #12100E page, with a subtle outline. New semantic token `--card-fill` (bastion `oklch(.196 .004 85)` = #161513; the other five themes alias `--surface-2`, unchanged), consumed by BalanceCategoryCard, ContributingBalanceRow and the panelFlat rule in bastion + safe-one in place of `--surface-2`. Buttons (action circles, avatar discs) keep `--surface-2`. Verified by pixel sample on Home: interior #161513 (tile #151513, rounding), hairline #25231F, page #12100E. Parity OK (62 tokens).

### 2026-10-05 (cont.) — Home cards tightened; asset pane; copper aura

Direct feedback against the reference: tighter gaps between cards, more padding inside Crypto/Cash/promo, less rounding, assets in one outlined pane with edge-to-edge separators, green Home aura → subtle copper accent. Layout tokens (all themes): `--shell-card-gap` 12px (Crypto/Money gap, supersedes the 09-16 shell-gap ruling), `--shell-card-radius` 8px (balance tiles, promo, Wallet stablecoin tiles, asset pane). BalanceCategoryCard padding 16 → 20 (Card `padding={5}`), promo 16 → 20. AssetsHomeList is now one pane (card fill + hairline edge, overflow clipped): row gap 0, 1px `--edge` separator between rows full pane width, rows square-cornered with 16px inline inset. AssetsHomeHeader glow `--glow-color` → `--accent-signal` (was delta up/down; direction still shown by the delta row). Measured: gap 12, padding 20, radii 8, rows flush and full-width (380/380), separators 1px, logo/value inset 17px each side; screenshot reviewed. tsc baseline-only, vitest 63/63, parity OK. Open: safe-one shell baselines need regenerating for this intentional Home change, held until the composer-snapshot instability (previous entry) is resolved.

### 2026-10-05 (cont.) — Asset pane outline only

Direct feedback: the assets pane should have no background, just the outline over the page colour. AssetsHomeList pane interior is now `--surface-0` (opaque, so the border-box edge gradient cannot bleed through) instead of `--card-fill` + sheen. Verified: interior samples #12100E = page beside it; outline #262320.

### 2026-10-05 (cont.) — Asset pane filled, no separators; card radius/gap restored

Direct feedback: assets as one pane with the Crypto/Money card fill and no separators; "we lost small rounding across panes". Root cause of the lost rounding (measured): `--shell-card-radius` and `--shell-card-gap` had disappeared from shell.css — the file was rewritten outside this session after they were added — so all five consumers resolved to 0 (radius 0, Crypto/Money gap 0). Both restored; a full undefined-custom-property scan found no other missing tokens of this session's (remaining unresolved names are runtime-set or pre-existing Merlin leftovers). AssetsHomeList: interior back to `--card-fill` (+ sheen), separator rule removed, rows flush. Verified: card/pane radius 8px, Crypto/Money gap 12, row gap 0, no separators; screenshot reviewed.

### 2026-10-06 — Bastion: reference surfaces, translucent panes, hairlines, Geist + mono eyebrows

Direct feedback (reference image + hex values): page 0B0B0A, raised surface 0F0F0F, panes 111110 @ 72% with backdrop blur, very subtle 0.5px lines, eyebrow titles (Total balance, Crypto/Cash, section titles) in Geist Mono uppercase with wide tracking, sans → Geist.

theme.bastion.css: `--surface-0 .149 .002 107`, `--surface-1 .168 0 0` (exact conversions), ramp `.195 / .23`, selected `.3`; `--card-fill oklch(.177 .002 107 / .72)`; glass fills on `--surface-1` at .84/.72; `--surface-blur` 0 → `--blur-16`; `--edge` alpha .12 → .09. New semantic `--hairline-width` (bastion .5px, others whole-pixel) now feeds `--shell-edge-width`. Card consumers (BalanceCategoryCard, ContributingBalanceRow, AssetsHomeList, bastion panelFlat) gained `backdrop-filter: blur(var(--surface-blur))` (no visible change where the fill is opaque). Fonts: Geist + Geist Mono added to .storybook/preview-head.html (same sanctioned Google Fonts pattern as Merriweather/Inter; not an npm dependency); primitives `--font-geist`, `--font-geist-mono`; bastion maps `--face-ui` and Astryx `--font-family-body/-heading` to Geist (bridge logged; lint-theme-parity.mjs now treats `--font-family-*` as an asymmetric bridge like `--color-*`). Eyebrows: elements carry a `data-eyebrow` role marker (AssetsHomeHeader total label, BalanceCategoryCard label, ContentGroup h2); only bastion styles it (Geist Mono 12px, .2em, uppercase, secondary ink).

Found and repaired along the way: theme.safe-one.css (committed "Updates") had lost `--card-fill`, which the tile components consume — restored as `var(--surface-2)` (unchanged look). A batch edit aborted midway on that assertion and silently skipped the shell.css/tokens.base.css edits; caught by measurement (text resolved to Times), then applied.

Verified in-page: Geist + Geist Mono loaded; values in Geist; all four eyebrows Geist Mono 12px / 2.4px tracking / uppercase; page `oklch(.149 .002 107)`; card fill .72 alpha with 16px blur. Limitation: Chromium snaps any border under 1px to 1px (a plain `.5px` test div computes 1px at DPR 2), so hairlines render as 1px in Chrome and true 0.5px in Safari/WebKit; the subtler edge alpha compensates. tsc baseline-only, vitest 71/71, parity OK (63), lint:tokens clean apart from the pre-existing rgb() fallbacks.

### 2026-10-06 (cont.) — Activity: one pane per day

Direct feedback: activity items connected into a pane per day, not individual panes. MoneyPage wraps each day's HistoryItems in `.activityPane` (date label stays above it) — same card recipe as the Home asset pane (card fill, hairline edge, `--shell-card-radius`, surface blur, clipped); rows inside lose their own `--surface-2` fill (only while not hovered, so hover still shows) and rounding. Verified: 5 day-panes, radius 8, rows square/transparent and flush; screenshot reviewed. tsc baseline-only, lint:tokens clean apart from pre-existing rgb().

### 2026-10-06 (cont.) — Eyebrow size, Home card order/link, Portfolio actions, APY row

Direct feedback. Bastion eyebrows 12px/.2em → `--text-11`/.28em. Home category cards swapped to Money → Investments; "Crypto" renamed Investments and now opens Portfolio's Investments tab (`openInvestments` in useMobileFrame: activeTab assets, walletTab `crypto`; prop threaded AssetsHomePage → AssetsHomeHeader). Portfolio Investments action row is Buy / Stake / Swap only, full-size circles (WALLET_ACTIONS trimmed — its only consumer was InvestmentsTab; `wallet` variant joins the 3-column rule; compact size dropped; unused PaperAirplaneIcon import removed). Money APY row is now just "4% APY · mUSD" (info icon and Est. annual removed; CardDetailPage's own annual figure untouched). Verified in-page: card order, eyebrow 11px / 3.08px, Investments click lands on the Investments tab, three 48px circular actions, APY row text, no page errors; screenshot reviewed. vitest passing, tsc baseline-only.

### 2026-10-06 (cont.) — Eyebrow 10px; equal spacing across Home's three panes

Direct feedback. Primitive `--text-10` added; bastion eyebrows now 10px (tracking .28em). Home: Money/Investments tiles and the promo now share the tiles' 12px `--shell-card-gap` — AssetsHomeHeader + PromoCarousel wrapped in `.cardStack` (PromoCarousel takes no className, and a negative margin against the 20px section gap was the alternative rejected as fragile); the section gap now starts at Coins. Trade-off: the page-landing stagger now treats header + promo as one section. Measured: tile gap 12, tiles → promo 12, eyebrow 10px; screenshot reviewed. vitest passing.

### 2026-10-06 (cont.) — Nav glass actually blurs; avatar = search height; no row selection

Direct feedback: main nav had no visible blur and the + read as opaque — both should be one material, same as the search; avatar should be search-sized; Coins row hover too strong (same as menu hover), no click-to-select.

Root cause (bisected with a test glass at each ancestor level): the nav pill carries `view-transition-name: dock-bar` (dock morph), and an element with a view-transition name is a backdrop root — so the glass painted on `.pill::before` could only blur the pill's own empty interior, never the page. Glass moved onto `.pill` itself (its own backdrop-filter still samples the page); the `::before` layer removed (its only purpose was the menu-open fade, retired 10-01). Pill and toggle now share the search's material: `--glass-fill-clear` + `--shell-header-backdrop`, `--shell-edge-width` hairline. Note: the composer has the same latent issue (named root, glass on its body child) — not changed here. Avatar: Astryx Avatar `medium` (48px) in a button sized by `--size-element-md: var(--shell-search-height)` (MobileFrame + BuyEthConversation). "Too strong hover" was the selected state (opaque rgb(38,38,38)); AssetsHomeList no longer selects (props removed; placeholder `#owned/` links still held back), callers updated (Home, InvestmentsTab); plain hover already matched the menu's 5% overlay.

Verified: stripes under the pill blur to 48/49 (were sharp 52/15), toggle blurred too; pill/toggle identical fill + `blur(24px) saturate(1.4)`; avatar 48 = search 48; clicked row bg transparent; nav→composer morph still `ready` ok; no page errors; screenshots reviewed. vitest passing, parity OK.

### 2026-10-06 (cont.) — Bastion semantic split; champagne presence glow; orb luminance states; plain send avatars

Direct feedback (reference image + palette spec): sending-screen avatars without the darker rings; glows as soft luminance gradients; orb champagne (core E8DED0, active D8C5AC, outer glow ~.10–.18, copper accent D78A4A); semantic split copper = action/brand, sage = positive, red-ochre = risk, champagne = agent presence; voice states via luminance/motion, not hue.

Bastion tokens (exact conversions): accent `oklch(.701 .123 58.5)`; orb `--orb-liquid-blue .833 .04 74.7` / `--orb-liquid-ice .905 .022 76.5`; ok/delta-up sage (145), alert/delta-down red-ochre (33), warn ochre (70); `--glow` and `--halo-fill` now soft champagne luminance falloffs. New semantic tokens in all six themes: `--presence` (bastion champagne; others alias `--accent-signal`), `--orb-luminance-idle/-listening/-thinking` (bastion .72/1.08/.94; others 1), `--orb-seam` (bastion faint copper; others alias `--orb-liquid-ice`) — other themes render unchanged. AssistantOrb applies the luminance per `data-activity` and swaps the liquid's secondary colour to the seam while thinking (the WebGL renderer reads `--assistant-orb-color-*` from the canvas's computed style). sending.css glow/ripples use `--presence` with a two-stop falloff; success keeps `--accent-ok` (now sage in bastion). SendingScreen `.party`: flat `--surface-2` disc, no edge (the edge read as a darker ring). Not built: speaking / needs-confirmation / complete orb states — AssistantActivity only has idle | listening | thinking today.

Verified: tokens resolve as specified; safe-one `--presence` still its accent; orb listening = brightness(1.08) with champagne colours; screenshots of processing / success / orb reviewed; no page errors. tsc baseline-only, vitest passing, parity OK (68).

### 2026-10-06 (cont.) — Payment card: full-pane wash, ring-free avatars

Direct feedback on the in-transcript transfer card (PaymentCard, rebuilt outside this session): gradients were "radial squashes instead of full estate" and the avatars still had darker rings. Cause: `.route` painted `--send-glow` (radial, `closest-side`) on a wide, short strip, flattening it into an ellipse; the 64px `--surface-2` route disc with an edge surrounded a 48px avatar, leaving an 8px darker band. Fix: new tokens in sending.css `--send-pane-wash` / `--send-pane-wash-done` — a card-sized radial light from the top-left (130% × 100% at 15% 0%, `--presence` 16% / `--accent-ok` 18%) over a surface-1 → surface-0 fall-off — painted on the whole `.card`, sage variant once sent; the route strip no longer paints a glow; the disc is a flat `--surface-2` with no edge and the avatar is 64px (Astryx numeric scale) so it fills it. Verified on Nodes/PaymentCard InlineConfirm with bastion forced (the story pins safe-one in its meta globals): card wash computed, route background none, disc 64 = avatar 64, no border; screenshot reviewed. vitest passing, tsc baseline-only.

### 2026-10-06 (cont.) — Send-flow polish: uncut success glow, copper confirm wash, taller orb glow, serif reply, spacing

Direct feedback. PaymentCard `.route` no longer clips (`overflow: hidden` removed) — the success mark's glow was cut off at the strip's edge; the card clips at its own rounded border. `--send-pane-wash` (confirm) uses `--accent-signal` again (branded tint, size/style kept); sent stays sage. New semantic `--halo-height` in all six themes (others `--space-64 * 3`, unchanged; bastion `* 6`) feeds `--assistant-orb-halo-height`; bastion `--halo-fill` stops raised (.45 / .3 before the shared .40 strength) so the glow lands in the 10–18% range instead of ~7%. Voice-feedback reply ("I can't help with that yet…") renders as a serif `--face-voice` paragraph like the send flow's replies (MobileFrame `.agentReply`). SendMoneyTranscript follow-up: gap 12 → 20 plus 8px top margin; choice chips min-height 40, inline padding 20. ContributingBalanceRow tiles: padding 8/12 → 20, track gap → `--shell-card-gap` (12), logo gap 12 — matching Home's Money/Investments. Verified: route overflow visible + sent screenshot (no cut-off), confirm wash computed copper, halo height resolves `calc(64px * 6)` in bastion, tiles padding 20 / gap 12, composer halo screenshot. Parity OK (69), vitest passing, tsc baseline-only.

### 2026-10-06 (cont.) — Bastion orb glow: seamless bottom wash

Direct feedback: the bottom/orb glow still read as a radial egg. Bastion `--halo-fill` now uses a radial wider than the screen (160% × 100% at bottom centre, champagne .3) over a straight bottom-up linear fade (.22) — no curved edge can show, matching the transfer card's full-pane wash. Verified by screenshot of the composer screen.

### 2026-10-06 (cont.) — Bastion orb glow: gentle curve, lower, softer

Direct feedback: slightly more curve, lower, more blur. `--halo-fill` radial 160%×100% → 120%×75% at bottom centre with a mid stop (.3 → .12 at 40% → transparent 82%) for a softer falloff; vertical linear fade shortened to 55% (.18). Screenshot reviewed.

### 2026-10-06 (cont.) — Bastion orb glow: subtler, blended

Direct feedback: more blur into the background, subtler overall. `--halo-fill` radial 130%×85% at bottom centre, champagne .2 → .1 (35%) → .04 (65%) → transparent at 100%; vertical fade .1 → .03 (40%) → transparent 65%. Screenshot reviewed: soft warm lift at the bottom, no visible boundary.

### 2026-10-06 (cont.) — Hero promo image; premium spacing register

Direct feedback (reference + `app/public/images/hero-promo.jpg`): assets and other components need a more spacious, premium register; use the new image in the promo.

PromoCardFull hero variant rebuilt: the image renders as a real `<img>` (object-fit cover) behind a left-side legibility scrim (`--promo-hero-scrim`), with an optional `eyebrow` (data-eyebrow), a 24px regular-weight title and a copper ArrowLongRight. This replaces the inline `background-image` style, which the 09-16 KNOWN ISSUE recorded as never reaching the DOM (and inline styles are banned anyway); the issue comment was removed. The carousel now leads with the DeFi hero ("Lend Earn Grow / Explore DeFi opportunities", `/images/hero-promo.jpg`, `--promo-hero-height` 192px).

Spacing (all themes): `--shell-gap` 20 → 24; new `--shell-pane-inset` 24 used for BalanceCategoryCard (Card `padding={6}`), promo, ContributingBalanceRow tiles, asset rows (16/24 + 8px pane padding-block) and activity rows. Measured: hero image loaded (naturalWidth 1448), hero 192px, card padding 24, asset rows 16/24 at a 76px pitch; no page errors; Home screenshot reviewed. vitest passing, parity OK, lint:tokens clean apart from pre-existing rgb().

### 2026-10-06 (cont.) — Home: no balance delta/glow; top texture; header shade only on scroll

Direct feedback. AssetsHomeHeader: removed the change row under the total balance and the accent glow (glow.module.css wrapper + inline style); dead imports (TrendDelta, glowStyles) and rules (changeRow/deltaUp/deltaDown) removed. New top texture: `.root::before` paints `--home-texture` (`url('/images/bg-texture.jpg')`, app/public/images) at `--opacity-20`, bled to the screen edges and up under the fixed header, `--home-texture-height` 384px, masked to fade into the content. Header shade (MobileFrame `.topFade` on pages) moved to `::before` and fades in over the first header-height of scroll via a scroll-driven animation: `.page { scroll-timeline: --shell-page-scroll y }`, lifted with `.chrome { timeline-scope }`; `@supports not` keeps the old always-on shade; the ambient `::after` is unaffected. Verified: texture loads (801px) at opacity .2 with mask; no glow; header balance has no delta (the Investments card keeps its own); shade opacity 0 at top → 1 after scrolling 200px; no page errors; screenshot reviewed. vitest passing.

### 2026-10-06 (cont.) — Home Money tile "Earning 6.4%"; real card photos

Direct feedback. BalanceCategoryCard gained optional `earningRate` — renders a copper-tinted pill (CircleStackIcon + "Earning N%") in place of the change row; Home's Money tile passes `MONEY_PLACEHOLDER.earningRate` (new, 6.4 — note: differs from the Money page's 4% APY, flagged to the user). Card photos `app/public/images/card01–03.jpg` mapped to WALLET_CARDS (Metal / Virtual / Travel) via a new optional `image` field; VirtualCardPlaceholder renders it as a full-bleed `<img>` under the existing brand/digits overlay (gradient kept as fallback); MoneyPage deck and CardDetailPage pass it. Verified: Money tile text "Earning 6.4%"; all three card images loaded (1448px); no page errors; screenshots reviewed. vitest passing, tsc baseline-only.

### 2026-10-06 (cont.) — Composer morph end jump fixed; voice activity visuals (orb talks, user wash)

Direct feedback: the composer bar changed shade abruptly at the end of the nav → composer morph; in voice mode the orb should pulse as if talking during voice playback, and the user's speech should move a second subtle bottom gradient — bottom = user, orb = assistant.

Morph jump, root cause (measured by sampling a composer pixel per frame): the overlays' halo is `.root::after`, which painted OVER the content, lightening the live composer (28) — the view transition lifts the composer above everything (18), so it jumped when the morph ended. Both overlays now stack halo (z 0) behind content (`.layout` z 1 composer / z 2 conversation); verified the pixel stays 18–19 through and after the transition end.

Voice: `useSendVoicePlayback` exposes `isSpeaking` (true on the clip's `playing` event, false on drain/stop/failure — after the stale-clip guard). New `useUserSpeaking(isListening, text)` infers speech from the live interim transcript (700ms hold) — no second mic stream/permission. ConversationModeOverlay sets `data-user-speaking` and passes `speaking` to AssistantOrb (`data-speaking`). CSS: orb `.core` + aura run an irregular `orb-talk` scale rhythm; `.root::before` (z 1, between halo and content) is the user wash — `--voice-user-fill` (presence-based radial) flickering opacity/scaleY via `voice-user-level`; both off under reduced motion. Tokens in shell.css (`--voice-*`, `--orb-talk-*`). Verified by toggling the same attributes in-page: orb-talk running (scale varies), user layer live; screenshot reviewed; real audio/mic not exercisable headless. MobileFrame.tsx at 199 lines (budget edge). vitest passing, parity OK.

### 2026-10-06 (cont.) — Voice visuals toned: faint user wash, orb glow-only pulse

Direct feedback: user gradient much subtler; orb shouldn't scale, only its gradient. `--voice-user-fill` presence stops 24%/8% → 9%/3%. AssistantOrb: the `.core` talk animation and its `orb-talk` keyframes removed (unused `--orb-talk-mid/-dip` tokens dropped); only the aura glow pulses (`orb-talk-aura`). Verified in-page: core 0 animations / no scale, aura animating, user fill .09/.03.

### 2026-10-06 (cont.) — Orb talk pulse: opacity only

Direct feedback: dark black visibly sized up around the orb while talking. Cause: the aura is a box-shadow (paints only outside its box); scaling it 1.14 moved the glow's start outward, opening a dark ring between sphere and glow. `orb-talk-aura` is now opacity-only (.55 ↔ 1 irregular); `--orb-talk-peak/-aura-peak` removed. Verified: aura scale none, opacity varying .55–.99; screenshot shows the glow hugging the sphere.

### 2026-10-07 — Home banner image capped at 160px

Direct feedback: "Home banner with image 160px max width" (read as: image width capped at 160px; height-cap alternative offered to the user). PromoCardFull hero: image now right-aligned, `--promo-hero-image-width` 160px, full card height, left edge masked into the card fill; the left-side scrim token `--promo-hero-scrim` removed (unused); title max-width follows the remaining space. Measured: image 160px; card 382×209 (title wraps to 3 lines in the narrower column).

### 2026-10-07 (cont.) — Banner reversal: height 160px

Direct feedback: the 160px-wide-image reading was wrong; "height 160". Reverted to the full-bleed image with the left scrim (`--promo-hero-scrim` restored; `--promo-hero-image-width` removed) and `--promo-hero-height` 192 → 160 (now a fixed `height`, not min-height); body gap 12 → 8 and the arrow's extra top margin dropped so eyebrow + two-line title + arrow fit inside 160 with the 24px inset. Measured: card 382×160, image full width, content 158px (no overflow); screenshot reviewed.

### 2026-10-07 (cont.) — Voice-mode confirmation actions: Cancel · Edit · Accept, right

Direct feedback. PaymentCard contract gains `interaction: 'chat' | 'voice'` (default chat); buildPaymentScene / buildSendTransferScene take the interaction mode and SendMoneyTranscript passes it through (voice = conversation mode). In voice the actions render Cancel, Edit, Accept in that DOM order (tab order matches the visual) with `justify-content: flex-end`; chat is unchanged (Accept, Edit, Cancel, left). New story Nodes/PaymentCard VoiceConfirm. Verified: voice order [cancel, edit, accept] with a 16px right gap, chat order unchanged; screenshot reviewed. vitest passing, tsc baseline-only.

### 2026-10-07 (cont.) — Home assets pane: no pane padding, rounded first/last rows

Direct feedback. AssetsHomeList `.list` loses its `padding-block` (8px); the first row carries the pane's top corners and the last row its bottom corners (`--shell-card-radius`, via `:first-child`/`:last-child` on the scene wrappers), so the hover fill follows the rounding. Verified: pane padding 0, rows flush to the 1px border, first row radii 8/0, last row 0/8, middle rows square; hover screenshot reviewed.

### 2026-10-07 (cont.) — Shared ActivityGroups; hover rounding follows the pane

Direct feedback: transaction-row hover rounding differed from the container's; Card details has the same transaction list and both must use the same component. New `ActivityGroups` (+ module CSS) renders the per-day connected panes and is now the single implementation in MoneyPage (Activity) and CardDetailPage (Transactions tab) — their duplicated `activityList/Group/Pane` CSS removed; Card details thereby gains the per-day panes. Rounding: rows lose their own radius/fill, and the first/last row of each day carries the pane's corners (`--shell-card-radius`) so hover follows the container. First/last are marked per row (`data-first`/`data-last` on a wrapper) — `:first-child`/`:last-child` don't work here because HistoryItem (changed outside this session) now renders a row wrapper plus a tooltip sibling; my earlier child-selector attempt silently matched nothing and my first probe sampled the wrong elements, caught by listing each child. Verified on both pages: pane 8px, first row 8/0, middle 0, last 0/8, row bg transparent; screenshot of Card details reviewed. tsc baseline-only, vitest passing.

### 2026-10-09 — Portfolio Investments chart: taller, soft glow, outside X labels, no Y axis

Direct feedback (screenshot): hard colour ending under the chart; taller (~20%); more space to the Buy/Stake/Swap row; month labels outside the plot, not so close; "different months"; remove Y-axis values.

Root cause of the hard edge (found, not guessed): TrendChart's bottom glow sits in a `glow.module.css .clipped` container (`overflow: hidden`), so the blurred glow was sliced flat at the chart's bottom. New plain-TS prop `airy` on TrendChart (→ TimeSeries → ChartBleedAxes, same precedent as xTicks/xTickFormatter, not part of the Zod schema): glow switches to `.unclipped` so it falls off softly past the chart; Y axis `hide`; X band 44px (`AIRY_X_AXIS_HEIGHT`) with labels 16px below the plot. InvestmentsTab: `AIRY_CHART_HEIGHT` 152 (plot 90 → 108px = +20%, plus the band), `.actions` wrapper with 24px top margin. Measured: svg 414×152, plot bottom 108, labels at 122, chart → actions gap 8 → 32px, Y text gone, no page errors.

Labels: the real window is 7 days of one month, and TrendChart labelled such YTD/1Y/MAX windows with the bare month name ("Sep" ×6 — the 09-01 note already recorded this bug class for >1-month windows). New `'date'` granularity for spans under 31 days ("Sep 7"). Also fixed tick selection: a densified daily series repeats each date label on many rows and the category axis places a tick at the label's FIRST row, so index-picked ticks landed unevenly and recharts hid colliding ones; ticks are now snapped to the distinct label nearest each evenly spaced target row (identical to the old picks when labels are unique). Airy charts use 5 target ticks. Result: Sep 7 / 9 / 10 / 12 (the seed's real, uneven dates). Other TrendChart stories unchanged (Feb/Mar/Apr + Y axis). Literal different MONTHS is not possible without longer data: the series covers one week — flagged to the user. TrendChart.tsx is 391+ lines (already over the 200 budget before this change; not split here). vitest 71 passing, tsc baseline-only.

### 2026-10-09 (cont.) — Vercel deploy fixed

Deploy was failing at `pnpm --filter app build` (`tsc -b && vite build`). Two separate causes. (1) The two type errors I had been logging all session as "baseline / existing" were fatal here — fixed at the source: RiskReturnScatter's tooltip now takes recharts' `TooltipContentProps` and narrows the point with a runtime type guard (recharts passes a readonly payload with an untyped inner `payload`; no cast); SceneGrid maps the Zod columns union to Astryx's `GridColumns`, omitting absent optional keys (exactOptionalPropertyTypes). `tsc -b` is now clean, so "baseline-only" no longer applies to later entries. (2) `vite build` then fails: `app/` has no `index.html`/`main.tsx` — none has ever been committed (CLAUDE.md §4 lists main.tsx, never built); the app has only ever run through Storybook. Not invented here (it would duplicate .storybook/preview.ts's theme/CSS wiring and is an architecture call). Instead: root `build-storybook` and `build:deploy` (= `tsc -b` then storybook build) scripts, and `vercel.json` (buildCommand `pnpm build:deploy`, outputDirectory `storybook-static`, `/` redirects to the Bastion MobileFrame story so the link opens the app, not the Storybook shell). Verified: full `build:deploy` succeeds (~5s); built output served as static files loads with theme bastion, hero image 1448px, 0 failed requests, 0 page errors; vitest 71 passing. Not verified: an actual Vercel run. `pnpm --filter app build` itself still fails at vite (no entry) — only the deploy path changed.

### 2026-10-09 (cont.) — Real app entry; Vercel deploys the app, not Storybook

Direct feedback: deploy as an app — what Shell/MobileFrame Default shows. Supersedes the same-day Storybook-deploy fallback. Added `app/index.html` (data-theme="bastion", data-astryx-theme neutral, viewport-fit=cover for the shell's safe-area insets, the Merriweather/Inter/Geist/Geist Mono links copied from .storybook/preview-head.html — keep the two in step) and `app/src/main.tsx` (same CSS imports in the same order as .storybook/preview.ts, mounts `<MobileFrame />` — the app shell, the one sanctioned mount point under CLAUDE.md §2.1 — in StrictMode). `vercel.json` is now `{ buildCommand: "pnpm build", outputDirectory: "app/dist" }`; the temporary `build:deploy` script and the "/" redirect are gone (`build-storybook` kept). No new dependencies. Theme is fixed to bastion for now (no switcher in the app).

Verified: `pnpm build` (= `tsc -b && vite build`, the exact command Vercel ran) succeeds and emits app/dist (~20MB, mostly the image/voice-clip assets); dist served as static files at `/` renders the Home screen identically to the Storybook default — theme bastion, Geist loaded, hero image + three card images + chart labels, tab switch to Investments, composer opens — 0 failed requests, 0 page errors. vitest 71 passing; lint:tokens clean apart from the two pre-existing rgb() fallbacks. Not verified: an actual Vercel run.
