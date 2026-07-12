---
name: safe-refactor
description: Restructuring existing code without changing behavior. Trigger on "refactor", "clean up", "extract", "split this file", "rename", "reorganize", "simplify this code".
---

# Safe refactor — procedure

Guardrails apply. Refactor only on explicit request — never bundled into a feature task.

## 1. Scope contract (before touching code)
- List: files in scope · the transformation type · behavior and public API that must not change. Post this; it is the contract for the diff.

## 2. Baseline
- Run existing build/tests/lint; record green. Red baseline → stop, report — never refactor on red.
- No test coverage on the target → write a minimal characterization test first, or state explicitly that the refactor is unverified and name the risk.

## 3. Transform
- One transformation type per pass: rename OR extract OR move OR inline OR split — never mixed. Multiple needed → sequential passes, baseline re-run between each.
- Zero behavior change, zero API change, zero "while I'm here" fixes. Bugs discovered → report, don't fix in this pass.
- Preserve formatting of untouched lines; no reordering for taste.

## 4. Verify
- Re-run baseline; must match. Review own diff: every hunk traceable to the declared transformation — an untraceable hunk gets reverted.

## Done report
Transformation · files touched · baseline before/after · hunks reverted (if any) · bugs found-not-fixed.
