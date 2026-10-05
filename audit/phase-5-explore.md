# Phase 5 — Explore composition, 2026-09-13

Explore is a Scene JSON layout inside MobileFrame's existing page slot. There is no ExplorePage component. Shell navigation owns category, perpetual-filter and drilldown state; the engine chooses authored nodes and the existing registry/renderer validates and renders them. Home retains its shell layout and now renders owned rows through the same AssetRow registry node.

## Components and stories

- `AssetRow`: owned quantity/total value/change versus market price/cap/volume/change. Owned, Market and LongName stories.
- `ProminentAssetCard`: left-aligned logo, symbol/leverage or APY, secondary metadata; optional price/change and a child Sparkline. Perp, Earn and WithPriceAndSparkline stories.
- `ContentGroup`: heading/chevron link plus stacked, row, page or Astryx Carousel layout. Default and WithoutLink stories.
- `LinkChips`: linked Lists and horizontally scrollable Categories stories. Active category is exposed with aria-current on its wrapper.
- Shared CoinLogo helper retains existing static assets and uses initials for unknown brands; no invented brand artwork or external requests. Original shell export and logo CSS remain compatible.

All new stories select safe-one. Existing theme registrations remain intact. Mock prices/yields are authored fixtures, not market feeds.

## Files

Four nodes and stories under `app/src/components/nodes/`, four schemas under `contracts/props/`, shared `ExploreComponents.module.css`, `CoinLogo.tsx`/CSS and `theme/explore.css`; registry adds four entries. `app/scenes/explore.scene.json` is the All layout; `explore-categories.scene.json` supplies Commodities and alternate perpetual rows. Engine files `exploreScenes.ts`, `ownedAssetsScene.ts`, `exploreScenes.test.ts`; shell `useExploreNavigation.ts`, MobileFrame integration and AssetsHomeList/CSS adaptation. Browser coverage is `tests/explore.config.ts` and `tests/visual/explore.spec.ts` with component-scoped snapshots.

## Interaction

All/Crypto/Stocks/Perps/Commodities change the authored scene groups. Perpetual subfilters switch Stocks/Forex/Indices/ETFs. Group chevrons and list chips open filtered content; asset surfaces open a simulated preview. Back restores the selected Explore category. Home still toggles its selected owned row. Composer and account overlays remain shell-owned.

The prior pill-navigation request is integrated in MobileFrame Default, with ClassicNavigation retained. Popover labels/icons are right aligned, icon centers match the +/× center, and rows have no separators. The right inset accounts for the actual borderless popover geometry. Existing composer and stretchy-highlight motion are retained.

## APIs and tokens

Checked installed Astryx 0.1.4 docs/source for Item, ClickableCard, Carousel and Token. Reused Item href/selection slots, ClickableCard href, Carousel snapping and Token links. Token drops arbitrary data/ARIA props, so a native wrapper carries delegated navigation and current-state attributes. ClickableCard's accessibility anchor is hidden; pointer tests target its actual card surface.

Two structural aliases in `theme/explore.css`: `--explore-card-width` (160 from existing spacing), `--explore-card-min-height` (96 from existing spacing). Existing semantic surfaces, ink, radii and motion are reused. No dependencies or inline styles added. Sparkline and TrendDelta retain their existing implementations.

## Verification

49 unit/contract tests pass, including registry validation of all category/filter combinations, link destinations and owned-value formatting. Storybook build, token lint and diff whitespace checks pass. Explore browser checks cover scene composition, filters/list/card links, 320px overflow, Home selection, composer placement and precise popover geometry. Snapshot evidence is under `tests/visual/explore.spec.ts-snapshots/`.

Full-app TypeScript remains red in untouched files (raw diagnostic headlines):

```text
RiskReturnScatter.tsx(56,20): error TS2322: TooltipPayload is readonly and cannot be assigned to the mutable payload type.
SceneGrid.tsx(7,11): error TS2322: grid columns optional max is incompatible with exactOptionalPropertyTypes.
AssetsHomePage.tsx(62,14): error TS2375: icon: string | undefined is not assignable to PromoCardProps icon?: string.
```

The first two were previously recorded baseline errors; the Home promo error was present during this session's first full-app check. No Explore errors were reported. Exact output: `/tmp/bastion-explore-types-final.log`. No unrelated fixes were made.

Final browser gate: **5 Explore tests pass with screenshot diffs**, including all five component baselines; **7 pill-navigation tests pass**, with all three intentionally regenerated nav/popover/composer baselines. No unresolved browser failures.

## Follow-up: full-bleed card sparkline

Sparkline now has an optional block variant reusing AssetTrendGlyph, the same shared directional line/gradient component used by AssetCardGrid. Explore's authored card charts and prominent-card story opt in; inline sparklines retain their previous rendering. Card CSS publishes its inset and uses the existing bleed styles to reach both sides and the bottom, clipped to the card radius. No new chart implementation or tokens.

Gate: 49 unit tests, six Explore browser tests with snapshot diffs, Storybook build, token lint and whitespace checks pass. Browser geometry verifies side/bottom edges within one pixel after scene entrance settles, and verifies gradient stops/area fill. All five Explore snapshots regenerated and final diff pass confirmed. Full-app TypeScript retains the same three errors recorded above; no new diagnostics.
