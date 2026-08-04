import { test, expect } from '@playwright/test';

// Phase 18 gate substitute (Prem's ruling, 2026-07-26): the real 4th-pane
// collapse scenario is architecturally impossible today — the transcript
// and artifact panes never coexist under pageStore's own navigation law
// (see STATE.md). This forces usePaneFitCollapse's own decision path
// synthetically via PaneFitCollapseHarness (two fake panes in a
// deliberately too-narrow row), so the mechanism is verified correct even
// though nothing in the live app calls it into a real 2-candidate choice
// yet. Re-verify live the first time a real trigger scenario exists
// (Phase 17's entity-preview, if built).
test('usePaneFitCollapse collapses the least-recently-active pane on overflow, and restore re-collapses cleanly if it still does not fit', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=shell-panefitcollapseharness--default');
  await page.waitForSelector('#storybook-root');

  // Pane A touched first (least recently active) → collapses first;
  // Pane B stays open.
  await expect(page.getByText('Pane B')).toBeVisible();
  await expect(page.getByText('Pane A')).not.toBeVisible();
  const restoreA = page.getByRole('button', { name: 'Restore pane-a' });
  await expect(restoreA).toBeVisible();

  // Restore: the row (300px) still can't fit both panes (200+200+16) —
  // must re-collapse cleanly, not stay stuck open and not leave both the
  // chip and the panel mounted at once (the exact oscillation/stuck-
  // animation bug this order fixed).
  await restoreA.click();
  await page.waitForTimeout(500);
  await expect(page.getByRole('button', { name: 'Restore pane-a' })).toBeVisible();
  await expect(page.getByText('Pane A')).not.toBeVisible();
  await expect(page.getByText('Pane B')).toBeVisible();

  // No duplicate/stuck DOM: exactly one restore chip, exactly one visible
  // pane label.
  await expect(page.getByRole('button', { name: /^Restore/ })).toHaveCount(1);
  await expect(page.getByText(/^Pane [AB]$/)).toHaveCount(1);
});
