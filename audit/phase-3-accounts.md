# Phase 3 account preview — 2026-09-12

Implemented in `Shell/MobileFrame`, reviewed with the safe-one theme.

- Avatar opens the account menu. The originating page remains mounted, translates right, scales to 90%, fades to 40%, and receives a rounded clip and top gradient. The visible page is a return button; scroll position survives closing.
- Astryx fullscreen Dialog supplies native modality. Account sheets fade and translate upward from 50% of their height over 320ms, using the existing enter easing. Closing retains the dialog through a 200ms exit. Reduced motion removes both animations and page transitions.
- Account list supports selection, address viewing and editing. Names and notification preferences update locally. Five add-account methods open a demo setup form, adding a selected local account without collecting secrets or contacting wallets.
- History uses validated mock entries, UTC date groups, category filters, reusable HistoryItem rows and activity details. Pending and failed transactions have explicit badges.
- Profile, Chats, Watchlist, Settings and Help have lightweight mock destinations. These are shell previews, not scene-registry additions or a new navigation engine. Account changes reset on reload.
- Entry-state stories live under Shell/MobileFrame; HistoryItem includes sent, received, app interaction, pending and failed stories. Existing theme toolbar behavior is preserved.

Astryx docs checked: List, ListItem, Item, SegmentedControl, Switch, Badge and useFocusTrap. Existing verified Dialog, Button, IconButton, Avatar, Text and TextInput APIs reused. Custom CSS supplies only the page-preview arrangement and motion that the primitives do not offer.

New `theme/accounts.css` contains structural aliases for account spacing, page transform/mask and sheet motion; colors remain semantic tokens. No dependencies added.

Validation:

- `pnpm exec tsc -p tests/tsconfig.accounts.json` — passed.
- `pnpm exec storybook build -c .storybook --quiet` — passed.
- `pnpm lint:tokens` and `git diff --check` — passed.
- `pnpm exec playwright test -c tests/accounts.config.ts` — 6 passed. Tests cover return/focus/scroll preservation, rename/create/select, history filtering/details, native focus containment, mid-screen keyframes, reduced motion and 320/392px widths.
- Captured five screens at both widths; visually reviewed menu, edit, add and history. Corrected narrow amount wrapping and missing handle color after first screenshots.
- Full-app TypeScript remains blocked only by the existing errors in RiskReturnScatter.tsx:56 and SceneGrid.tsx:7; no new account errors.

The prior session's automatic approval usage-limit block did not recur; all browser checks above ran successfully. Wallet integration and persistence remain outside this mockup scope.
