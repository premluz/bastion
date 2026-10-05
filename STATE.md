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
