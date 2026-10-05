# Phase 6 — ETH conversation and approval card

Completed 2026-09-13 in safe-one. Entry: `Shell/MobileFrame/BuyEth`, or submit “I want to buy ETH” in the composer. The default demo amount is $800; explicit positive amounts are supported.

The engine advances through streamed greeting → shimmering Thinking → streamed approval prompt → selected-balance acknowledgement while the card fades away → Finding best price (1,000ms) → Generating interface (900ms) → streamed introduction → purchase interface. The quote's six child nodes stagger through the existing SceneRenderer reveal indices. Timers cancel on unmount; reduced motion removes shimmer, approval exit and quote assembly animation.

The two scene fixtures are validated by HydratedSceneSchema. Three registry entries ship with schemas and stories: `approval-card`, `purchase-card`, `purchase-detail`. Funding selection and confirmation travel through data attributes and delegated shell listeners. Astryx RadioList's required onChange publishes the selected value to its enclosing approval element; the native change event bubbles to the shell. Registry components have no engine imports or outbound callback props.

ApprovalCard replaces this session's initial funding-only component after user review. Native RadioList controls fix the collapsed radio markers caused by nesting custom spans in Astryx Button's text wrapper. A semantic border mix softens the card outline. Single-question ETH selection advances immediately. Multi-question story configuration adds horizontal previous/next carets, current/total counter, Skip/Continue; optional dismiss and custom-answer fields are exposed separately. The interactive story preserves answers when navigating backward and forward. Its three-question launch example checks reuse beyond wallet balances.

The quote consistently uses the selected USDT or USDC balance, including coin logo, spend and exchange-rate labels. The $800 example produces 0.2980 ETH at the authored demo rate. Fees are marked included, and confirmation is explicitly simulated; it never accesses a wallet or changes real balances. Insufficient balances disable selection. No external price lookup, dependency, or persistence was added.

Astryx APIs checked: Card, RadioList/RadioListItem and useStreamingText; existing verified Button, IconButton, Icon, Text and TextInput APIs reused. Shared shimmer and glow styles are reused. New `theme/purchase.css` and `theme/approval.css` contain structural aliases and a semantic border mix. The existing theme toolbar remains functional.

Validation:

- `pnpm test`: 40 passed, including fixture validation and nine ETH intent/quote cases. Replaced the obsolete zero-fixtures assertion with required ETH fixture presence.
- `pnpm exec tsc -p tests/tsconfig.buy-eth.json`: passed for new leaf nodes, flow logic and browser tests.
- Storybook production build, token lint and `git diff --check`: passed.
- `pnpm exec playwright test -c tests/buy-eth.config.ts`: 8 passed. Includes both currencies, typed entry, insufficient balance, exit, one-second timing measured in-page, shimmer, fade keyframes, scene stagger, native radio geometry, multi-question controls, custom answers and narrow layouts.
- Three element-scoped screenshot baselines: purchase summary, single approval and multiple approval. Reviewed first baselines; final run passed without snapshot updates.
- Full-app TypeScript still reports the two existing errors: RiskReturnScatter.tsx:56 (readonly TooltipPayload) and SceneGrid.tsx:7 (exact optional GridColumns). No errors were reported for the new flow or stories.

Scope: this is the requested conversational mockup in MobileFrame, not a general multi-turn agent or a production wallet. Multi-question orchestration is demonstrated in the ApprovalCard story; the ETH scene currently has one question. The existing keyword resolver manifest is unchanged because this interactive flow is entered through the mobile shell controller.
