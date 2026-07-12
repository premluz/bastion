import { test, expect, type Page } from '@playwright/test';

// CLAUDE.md Phase 5 gate + the recorded Phase 2 consequence: the
// two-utterance sequence must be tested explicitly — base discovery
// intents and refine intents separable by the resolver, refine loading
// the refine scene with its filter-summary — plus an honest "no scene
// matched" state for unresolved input, never a crash.
const THEMES = ['default', 'ops-dark', 'glass'] as const;

async function ask(page: Page, query: string, settleMs: number) {
  const input = page.getByRole('textbox', { name: 'Message input' });
  await input.fill(query);
  await input.press('Enter');
  await page.waitForTimeout(settleMs);
}

// Phase 8B WO-2: the shell opens on LandingState (no transcript, no
// panel) until the first turn; from there it's the transcript + artifact
// panel layout. The scene no longer assembles immediately — it waits for
// the trail to finish (sum of the fixture's own durationMs values) plus
// the usual exit/enter assembly, then the panel auto-opens. Waits below
// are each trail's real total under glass's slowest pacing (90ms stagger,
// 320ms enter), not a guess: asset-discovery trail 7300ms + 14-node
// assembly ~1490ms ≈ 8.8s; asset-discovery-refine trail 6050ms + exit
// 200ms + 11-node assembly ~1220ms ≈ 7.5s; unresolved has no trail, only
// a 200ms exit.
for (const theme of THEMES) {
  test(`shell — two-utterance sequence + unresolved query — ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=shell-frame--default&globals=theme:${theme}`);
    await page.waitForSelector('#storybook-root');

    // Landing state, no turns yet.
    await expect(page.getByRole('heading', { name: 'Where should we start?' })).toBeVisible();
    await expect(page).toHaveScreenshot(`shell-landing-${theme}.png`, { fullPage: true });

    await ask(page, 'show me tokenized assets yielding above 6%', 9200);
    await expect(page.getByText('show me tokenized assets yielding above 6%').first()).toBeVisible();
    await expect(page.getByText('Candidates above 6%')).toBeVisible();
    await expect(page).toHaveScreenshot(`shell-base-query-${theme}.png`, { fullPage: true });

    // Refine utterance must resolve to the different refine scene, not
    // re-match the base one — the Phase 2 consequence this gate records.
    await ask(page, 'only eu regulated minimum 50 million', 7800);
    await expect(page.getByText('only eu regulated minimum 50 million').first()).toBeVisible();
    await expect(page.getByText('Refined candidates')).toBeVisible();
    await expect(page).toHaveScreenshot(`shell-refine-query-${theme}.png`, { fullPage: true });

    await ask(page, 'what is the weather like today', 600);
    await expect(page.getByText('No scene matched')).toBeVisible();
    // An unresolved turn changes nothing about which artifact is open —
    // the refine scene's panel stays exactly as it was (verified as a
    // real fix during this gate: the old single-slot architecture nulled
    // the active scene here, which would have desynced Canvas from a
    // still-open panel; see STATE.md).
    await expect(page.getByText('Refined candidates')).toBeVisible();
    await expect(page).toHaveScreenshot(`shell-unresolved-query-${theme}.png`, { fullPage: true });
  });
}
