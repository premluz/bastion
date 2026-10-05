# Phase 6 — Send to Paul, 2026-09-13

Built the requested simulated transfer scene in the existing MobileFrame transcript. Enter `Send $50 to Paul for coffee`, or open `Shell/MobileFrame/SendToPaul`. Composer and conversation render the same per-message state; switching modes never restarts consolidation or creates a second debit.

## Behavior

- Four visible, timed progress labels check balances, resolve Paul, identify the insufficient single-account balance and inspect stables.
- Existing ApprovalCard presents consolidation, ETH→USDT and card-funding choices.
- Selecting consolidation automatically advances the three internal-move progress steps. No additional approval is required for this selected internal mock operation.
- Main starts at $18 USDT; secondary mock accounts contain $20 USDT and $24 USDC. Consolidation produces $62 Main USDT, using an explicitly disclosed simulated 1:1 USDC conversion.
- Final PaymentCard shows recipient, amount, note, funding source, $0.08 fee, instant arrival, balance and Accept/Edit/Cancel chips. Only final Accept subtracts $50 + $0.08, leaving $11.92.
- Edit changes the amount and note, validates amount plus fee against available Main funds, and returns to review without sending. Cancel after consolidation retains $62 in Main. Terminal actions are idempotent.
- Alternative ETH/card funding requires its own funding acceptance; it funds Main and then presents a separate transfer review. Accepting funding never sends to Paul.

All balances and actions are local scene simulation. No wallet, payment service, account history, or real funds are changed. Paul is the authored mock contact; this is not a general contact resolver.

## Structure / files

`app/scenes/send-paul-options.scene.json` and `send-paul-review.scene.json` author the approval/review nodes and thinking steps. `engine/sendMoneyState.ts` defines parsing, integer-cent accounting and guarded actions; `sendMoneyScenes.ts` composes validated scenes and advances timed progress; `useSendMoneyFlows.ts` owns timers/state once per message.

New registry `payment-card` consists of `contracts/props/payment-card.ts`, `nodes/PaymentCard.tsx`, CSS, and Review/Editing/Insufficient/Sent stories. It reuses Astryx Avatar, Card, TextInput and pill-shaped Button controls. Changes bubble through native data attributes to the shell, with no engine dependency in the node. Existing ApprovalCard is reused unchanged.

`SendMoneyTranscript.tsx` and CSS host progress/prose plus SceneRenderer; `useMobileFrame.ts`, `MobileFrame.tsx` and its stories wire entry/shared state. MobileFrame and ConversationModeOverlay transcript CSS now uses `safe flex-end`: short messages retain bottom alignment, while long payment reviews remain reachable by scrolling rather than overflowing above the scroll origin.

No dependencies, tokens, real payment integrations, or inline styles were added. Existing semantic safe-one surfaces and spacing are reused.

## Verification

62 unit/contract tests pass. New tests cover parser inputs, consolidation without payment, one-time debit including fee, cancellation, fee-aware editing, aggregate insufficiency, sufficient Main balance and separate approval of alternative funding. Fixture validation covers both scenes.

Storybook production build, token lint and whitespace checks pass. Five send browser tests cover visible stages, explicit approval, editing/cancel, typed inline entry, shared state across mode switching, alternate funding and 320px layout. Two component snapshots are reviewed and regenerated. Browser tests live in `tests/visual/sendMoney.spec.ts`, config `tests/send-money.config.ts`.

Full-app TypeScript remains red only in three unchanged files. Raw diagnostic headlines:

```text
RiskReturnScatter.tsx(56,20): error TS2322: TooltipPayload is readonly and cannot be assigned to the mutable payload type.
SceneGrid.tsx(7,11): error TS2322: GridColumns optional max is incompatible with exactOptionalPropertyTypes.
AssetsHomePage.tsx(62,14): error TS2375: icon: string | undefined is not assignable to PromoCardProps icon?: string.
```

Exact output: `/tmp/bastion-send-types.log`. No new-code errors remain.

Final gate: all five send tests pass without snapshot updates; all six existing Explore/Home/composer tests also pass. Final logs: `/tmp/bastion-send-diffs.log`, `/tmp/bastion-send-regression.log`.
