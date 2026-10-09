import { expect, test, type Page } from '@playwright/test';

const STORY = '/iframe.html?id=shell-mobileframe--default&globals=theme:safe-one;astryxTheme:stone;astryxScheme:light';
const conversation = (page: Page) => page.getByRole('dialog', { name: 'Assistant conversation', exact: true });

function emitSpeech(page: Page, text: string, final: boolean) {
  return page.evaluate(({ transcript, isFinal }) => {
    document.dispatchEvent(new CustomEvent('voice-test-result', { detail: { text: transcript, final: isFinal } }));
  }, { transcript: text, isFinal: final });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 392, height: 792 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    class FakeRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult: ((event: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null = null;
      onerror = null;
      onend: (() => void) | null = null;
      private onVoice = (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        const detail: unknown = event.detail;
        if (!detail || typeof detail !== 'object' || !('text' in detail) || !('final' in detail)
          || typeof detail.text !== 'string' || typeof detail.final !== 'boolean') return;
        this.onresult?.({ results: [{ isFinal: detail.final, 0: { transcript: detail.text } }] });
      };
      private onEngineEnd = () => {
        document.removeEventListener('voice-test-result', this.onVoice);
        document.removeEventListener('voice-test-engine-end', this.onEngineEnd);
        document.documentElement.setAttribute('data-recognition-active', 'false');
        this.onend?.();
      };
      start() {
        if (!this.continuous || !this.interimResults) throw new Error('Expected continuous recognition with live interim text.');
        document.documentElement.setAttribute('data-recognition-active', 'true');
        document.addEventListener('voice-test-result', this.onVoice);
        document.addEventListener('voice-test-engine-end', this.onEngineEnd);
      }
      stop() { this.onEngineEnd(); }
      abort() { this.onEngineEnd(); }
    }
    class FakeAudio extends EventTarget {
      constructor(readonly src: string) {
        super();
        // The app keeps one audio element for every clip (iOS unlock), so each
        // end signal finishes whichever clip that element is playing.
        document.addEventListener('voice-test-end', () => this.dispatchEvent(new Event('ended')));
      }
      play() {
        const played = document.documentElement.getAttribute('data-audio-played');
        const clip = this.src.match(/how-can-i-help\.mp3|0[1-5]\.mp3|06[abc]\.mp3|07\.mp3/)?.[0];
        if (!clip) throw new Error(`Unexpected voice clip: ${this.src}`);
        if (clip === 'how-can-i-help.mp3') document.documentElement.setAttribute('data-welcome-played', 'true');
        else document.documentElement.setAttribute('data-audio-played', [played, clip].filter(Boolean).join(','));
        return Promise.resolve();
      }
      pause() { document.documentElement.setAttribute('data-audio-paused', 'true'); }
    }
    // Replies without a recorded clip are spoken by speech synthesis; the fake
    // records them and finishes at once, as headless Chromium has no voices.
    class FakeUtterance {
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      lang = '';
      voice: object | null = null;
      constructor(readonly text: string) {}
    }
    const synthesis = {
      getVoices: () => [], addEventListener() {}, removeEventListener() {}, cancel() {},
      speak(utterance: FakeUtterance) {
        if (!utterance.text) return;
        const root = document.documentElement;
        root.setAttribute('data-spoken', [root.getAttribute('data-spoken'), utterance.text].filter(Boolean).join('|'));
        queueMicrotask(() => { utterance.onstart?.(); utterance.onend?.(); });
      },
    };
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeRecognition });
    Object.defineProperty(window, 'Audio', { configurable: true, value: FakeAudio });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  });
  await page.goto(STORY);
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Start voice recognition', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-welcome-played', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-recognition-active', 'false');
  await page.evaluate(() => document.dispatchEvent(new Event('voice-test-end')));
  await expect(conversation(page).getByRole('button', { name: 'Stop voice recognition', exact: true })).toBeVisible();
});

test('two seconds of silence submits each turn, gives a useful fallback, and keeps listening', async ({ page }) => {
  await page.clock.install();
  const dialog = conversation(page);
  await emitSpeech(page, 'Tell me', false);
  await expect(dialog.getByRole('log')).toContainText('Tell me');
  await page.clock.runFor(1000);
  await emitSpeech(page, 'Tell me a joke', true);
  await page.clock.runFor(1500);
  expect(await dialog.getByText('I can’t help with that yet. Try saying, “Send 50 dollars to Daniel for coffee.”').count()).toBe(0);
  await emitSpeech(page, 'Tell me a joke', true);
  await page.clock.runFor(500);
  await expect(dialog.getByText('I can’t help with that yet. Try saying, “Send 50 dollars to Daniel for coffee.”')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-spoken', 'I can’t help with that yet. Try saying, “Send 50 dollars to Daniel for coffee.”');
  const bottomGap = await dialog.getByRole('log', { name: 'Conversation transcript' }).evaluate((element) => {
    const styles = getComputedStyle(element);
    return [styles.paddingBottom, styles.getPropertyValue('--space-32').trim()];
  });
  expect(bottomGap[0]).toBe(bottomGap[1]);
  await expect(dialog.getByRole('button', { name: 'Stop voice recognition', exact: true })).toBeVisible();
  await emitSpeech(page, 'Send 50 dollars to Daniel for coffee', true);
  await page.clock.runFor(2000);
  await expect(dialog.getByRole('region', { name: 'Send money conversation' })).toBeVisible();
  await expect(dialog.getByText('Tell me a joke', { exact: true })).toHaveCount(1);
  await expect(dialog.getByText('Send 50 dollars to Daniel for coffee', { exact: true })).toHaveCount(1);
  await emitSpeech(page, 'unfinished', false);
  await dialog.getByRole('button', { name: 'Close conversation', exact: true }).click();
  const composer = page.getByRole('dialog', { name: 'Assistant composer', exact: true });
  await expect(composer).toContainText('Tell me a joke');
  await expect(composer).not.toContainText('unfinished');
  await composer.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  await page.evaluate(() => document.dispatchEvent(new Event('voice-test-end')));
  await expect(conversation(page).getByRole('button', { name: 'Stop voice recognition', exact: true })).toBeVisible();
});

test('a finalized manifest phrase automatically runs its scene', async ({ page }) => {
  await page.clock.install();
  await emitSpeech(page, 'hottest crypto this week', true);
  const dialog = conversation(page);
  await expect(dialog.getByText('hottest crypto this week', { exact: true })).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Thinking trail — click to skip' }).click();
  await expect(dialog.getByText(/Zenith Protocol leads this week's crypto movement/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Stop voice recognition', exact: true })).toBeVisible();
});
for (const [phrase, label] of [['Buy Ethereum for $100', 'ETH purchase conversation'], ['Please send 50 dollars for coffee', 'Send money conversation']] as const) {
  test(`a finalized ${phrase} starts its scenario without waiting`, async ({ page }) => {
    await page.clock.install();
    await emitSpeech(page, phrase, false);
    await expect(conversation(page).getByLabel(label)).toHaveCount(0);
    await emitSpeech(page, phrase, true);
    await expect(conversation(page).getByLabel(label)).toBeVisible();
  });
}
test('narration pauses the mic without echoing speech and the orb can restore listening', async ({ page }) => {
  await page.clock.install();
  const dialog = conversation(page);
  const active = page.locator('html');
  await emitSpeech(page, 'Send 50 dollars to Daniel for coffee', true);
  await page.clock.runFor(2000);
  await expect(active).toHaveAttribute('data-audio-played', '01.mp3');
  await expect(active).toHaveAttribute('data-recognition-active', 'false');
  await expect(dialog.getByRole('button', { name: 'Microphone paused during voice response' })).toBeDisabled();
  const mutedIcon = dialog.getByRole('button', { name: 'Microphone paused during voice response' }).locator('[data-muted]');
  expect(await mutedIcon.evaluate((element) => getComputedStyle(element, '::after').borderTopStyle)).toBe('solid');
  await expect(dialog.getByRole('button', { name: 'Resume voice recognition' })).toBeDisabled();
  await emitSpeech(page, 'Narration leaked into microphone', true);
  await expect(dialog.getByText('Narration leaked into microphone', { exact: true })).toHaveCount(0);
  await page.evaluate(() => document.dispatchEvent(new Event('voice-test-end')));
  await expect(active).toHaveAttribute('data-recognition-active', 'true');
  await dialog.getByRole('button', { name: 'Stop voice recognition' }).click();
  await expect(active).toHaveAttribute('data-recognition-active', 'false');
  await dialog.getByRole('button', { name: 'Resume voice recognition' }).click();
  await expect(active).toHaveAttribute('data-recognition-active', 'true');
  await expect(dialog.getByRole('button', { name: 'Stop voice recognition' })).toBeVisible();
});

test('recognition restarts after an unexpected browser end without losing the current turn', async ({ page }) => {
  await page.clock.install();
  await emitSpeech(page, 'Send 50', true);
  await page.evaluate(() => document.dispatchEvent(new Event('voice-test-engine-end')));
  await emitSpeech(page, 'dollars to Daniel for coffee', true);
  await page.clock.runFor(2000);
  const dialog = conversation(page);
  await expect(dialog.getByText('Send 50 dollars to Daniel for coffee', { exact: true })).toHaveCount(1);
  await expect(dialog.getByRole('region', { name: 'Send money conversation' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Microphone paused during voice response', exact: true })).toBeVisible();
});

test('voice transfer narrates each milestone in order and stops when closed', async ({ page }) => {
  const flow = conversation(page).getByRole('region', { name: 'Send money conversation' });
  const played = page.locator('html');
  const finishClip = () => page.evaluate(() => document.dispatchEvent(new Event('voice-test-end')));
  await emitSpeech(page, 'Send 50 dollars to Daniel for coffee', true);
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3');
  await expect(flow.getByRole('radio', { name: 'Daniel Smith', exact: true })).toBeVisible();
  await expect(flow.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
  await finishClip();
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3,02.mp3');
  await expect(played).toHaveAttribute('data-recognition-active', 'false');
  await flow.locator('[data-approval-card="send-recipient"] .astryx-radio-list-item:has(input[value="daniel-smith"])').click();
  await expect(flow.getByRole('radio', { name: 'Consolidate your stable USD balances', exact: true })).toBeVisible();
  await expect(flow.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
  await finishClip();
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3,02.mp3,03.mp3');
  await expect(played).toHaveAttribute('data-recognition-active', 'false');
  await flow.getByRole('radio', { name: 'Consolidate your stable USD balances', exact: true }).click();
  await expect(flow).toHaveAttribute('data-send-stage', 'moving');
  await finishClip();
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3,02.mp3,03.mp3,04.mp3');
  await expect(played).toHaveAttribute('data-recognition-active', 'false');
  await expect(flow.locator('[data-payment-card="review"]')).toBeVisible();
  await finishClip();
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3,02.mp3,03.mp3,04.mp3,05.mp3');
  await expect(played).toHaveAttribute('data-recognition-active', 'false');
  await flow.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(flow).toHaveAttribute('data-send-stage', 'confirming');
  await finishClip();
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3,02.mp3,03.mp3,04.mp3,05.mp3,06a.mp3');
  await finishClip();
  await expect(flow).toHaveAttribute('data-send-stage', 'sending');
  // The in-progress clip (07) narrates the send; the mic waits for it.
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3,02.mp3,03.mp3,04.mp3,05.mp3,06a.mp3,07.mp3');
  await expect(played).toHaveAttribute('data-recognition-active', 'false');
  await finishClip();
  await expect(played).toHaveAttribute('data-recognition-active', 'true');
  await conversation(page).getByRole('button', { name: 'Close conversation', exact: true }).click();
  await expect(played).toHaveAttribute('data-recognition-active', 'false');
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  await expect(conversation(page)).toBeVisible();
  await expect(played).toHaveAttribute('data-welcome-played', 'true');
  await expect(played).toHaveAttribute('data-audio-played', '01.mp3,02.mp3,03.mp3,04.mp3,05.mp3,06a.mp3,07.mp3');
});
