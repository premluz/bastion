---
name: merlin-layout-law
description: A spacing, gap, alignment, or layout value is being ratified as system standard (not a one-off fix). Trigger on "this gap should be X everywhere", "make this the standard spacing", "ratify this as a rule", or any moment a spacing/layout fix is confirmed correct and generalizable rather than local to one component.
---

# Layout law ratification — procedure

Guardrails and CLAUDE.md apply. A spacing/layout law is not ratified until every
sibling usage has been checked in the SAME change — reactive discovery (waiting
for Prem to notice each remaining instance) is the failure mode this skill exists
to close.

## 1. Confirm it's actually a law, not a local fix
- Is this value meant to hold everywhere the same relationship applies (e.g.
  "content↔artifact spacing is always --space-24"), or is it legitimately local
  to one component's own internal layout? If local, this skill doesn't apply —
  just fix it and move on.
- If it's a law: name it precisely in one sentence before touching code — what
  relationship does it govern, and what's the ratified value/token.

## 2. Sweep BEFORE closing the fix, not after
- Grep every plausible sibling usage in the SAME session, same change:
  - The exact token/value being ratified (e.g. `gap: var(--space-24)`,
    `gap: 24px` if any raw values slipped through)
  - The category of relationship it governs (e.g. all `gap:` declarations in
    `components/shell/` and `components/nodes/` if the law is about pane/panel
    spacing)
- Report every match found, not just the one Prem flagged. Fix all matching
  instances in the same change — do not wait for each one to be independently
  noticed and reported back.

## 3. Verify geometry, not screenshots, for measurement questions
- Per the standing visual-verification guardrails: a spacing/gap question is
  answered by `getBoundingClientRect()` / computed-style checks FIRST — a
  screenshot is for confirming a human-taste question (does this look right),
  never for confirming a measurable fact (is this actually 24px). Default to
  geometry; screenshot only when the question is genuinely visual/aesthetic,
  not numeric.

## 4. Register the law
- Add the ratified value/relationship to node-vocabulary.md or the relevant
  theme doc as a named rule, same standing as any other principle — not left
  implicit in a fixed component.
- If a new token is needed to express it cleanly (rather than reusing an
  existing spacing primitive), propose it per the standard token-proposal path
  — don't invent a raw value even for a "just this once" case.

## Done report
The law stated in one sentence · every sibling instance found and fixed (list
them) · which were already compliant vs which needed the fix · where it was
registered.
