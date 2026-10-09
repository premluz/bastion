import { expect, test } from '@playwright/test';

const STORY = '/iframe.html?id=shell-mobileframe--composer-open&globals=theme:safe-one';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class FakeRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult = null;
      onerror = null;
      onend: (() => void) | null = null;
      start() { document.documentElement.setAttribute('data-recognition-active', 'true'); }
      stop() { document.documentElement.setAttribute('data-recognition-active', 'false'); this.onend?.(); }
      abort() { document.documentElement.setAttribute('data-recognition-active', 'false'); this.onend?.(); }
    }
    class FakeAudio extends EventTarget {
      constructor(readonly src: string) {
        super();
        // The app keeps one audio element for every clip (iOS unlock), so each
        // end signal finishes whichever clip that element is playing.
        document.addEventListener('voice-audio-end', () => this.dispatchEvent(new Event('ended')));
      }
      play() {
        const played = document.documentElement.getAttribute('data-audio-played');
        const clip = this.src.match(/how-can-i-help\.mp3|0[1-5]\.mp3|06[abc]\.mp3|07\.mp3/)?.[0];
        if (!clip) throw new Error(`Unexpected voice clip: ${this.src}`);
        document.documentElement.setAttribute('data-audio-played', [played, clip].filter(Boolean).join(','));
        return Promise.resolve();
      }
      pause() { document.documentElement.setAttribute('data-audio-paused', 'true'); }
    }
    class FakeAudioContext {
      currentTime = 0;
      state = 'running';
      destination = {};
      resume() { return Promise.resolve(); }
      createGain() {
        return {
          gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect: (node: object) => node,
        };
      }
      createOscillator() {
        let firstFrequency = 0;
        return {
          type: 'sine',
          frequency: {
            setValueAtTime(value: number) { firstFrequency = value; },
            exponentialRampToValueAtTime() {},
          },
          connect: (node: object) => node,
          start() {
            const root = document.documentElement;
            const previous = root.getAttribute('data-sound-frequencies');
            root.setAttribute('data-sound-frequencies', [previous, firstFrequency].filter(Boolean).join(','));
          },
          stop() {},
        };
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeRecognition });
    Object.defineProperty(window, 'Audio', { configurable: true, value: FakeAudio });
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
  });
  await page.goto(STORY);
});

test('opening voice plays the welcome, then subtle tap and listening-state cues', async ({ page }) => {
  const start = page.getByRole('button', { name: 'Start conversation mode', exact: true });
  expect(await start.evaluate((element) => element.closest('[aria-label="Assistant composer"]')?.getAttribute('aria-label'))).toBe('Assistant composer');
  await start.click();
  const dialog = page.getByRole('dialog', { name: 'Assistant conversation', exact: true });
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-audio-played', 'how-can-i-help.mp3');
  await expect(root).toHaveAttribute('data-recognition-active', 'false');
  await expect(root).toHaveAttribute('data-sound-frequencies', /920,460/);
  await expect(dialog.getByRole('button', { name: 'Microphone paused during voice response' })).toBeDisabled();
  await page.evaluate(() => document.dispatchEvent(new Event('voice-audio-end')));
  await expect(root).toHaveAttribute('data-recognition-active', 'true');
  await expect(root).toHaveAttribute('data-sound-frequencies', /520,780/);
  await dialog.getByRole('button', { name: 'Stop voice recognition' }).click();
  await expect(root).toHaveAttribute('data-recognition-active', 'false');
  await expect(root).toHaveAttribute('data-sound-frequencies', /610,915/);
  await dialog.getByRole('button', { name: 'Resume voice recognition' }).click();
  await expect(root).toHaveAttribute('data-recognition-active', 'true');
});

test('a chat transfer switched to voice waits for its confirmation clip without prior narration', async ({ page }) => {
  await page.clock.install();
  const input = page.getByRole('textbox', { name: 'Message input', exact: true });
  await input.fill('Send $50 to Daniel for coffee');
  await page.getByRole('dialog', { name: 'Assistant composer' }).getByRole('button', { name: 'Send', exact: true }).click();
  const chatFlow = page.getByRole('dialog', { name: 'Assistant composer' }).getByRole('region', { name: 'Send money conversation' });
  await page.clock.runFor(3000);
  await chatFlow.locator('[data-approval-card="send-recipient"] .astryx-radio-list-item:has(input[value="daniel-smith"])').click();
  await chatFlow.getByRole('button', { name: 'Continue', exact: true }).click();
  await chatFlow.getByRole('radio', { name: 'Consolidate your stable USD balances', exact: true }).click();
  await chatFlow.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.clock.runFor(5000);
  await expect(chatFlow).toHaveAttribute('data-send-stage', 'review');
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  const voiceFlow = page.getByRole('dialog', { name: 'Assistant conversation' }).getByRole('region', { name: 'Send money conversation' });
  await expect(voiceFlow).toBeVisible();
  await page.evaluate(() => document.dispatchEvent(new Event('voice-audio-end')));
  await expect(page.locator('html')).toHaveAttribute('data-audio-played', 'how-can-i-help.mp3');
  await voiceFlow.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(voiceFlow).toHaveAttribute('data-send-stage', 'confirming');
  await expect(page.locator('html')).toHaveAttribute('data-audio-played', 'how-can-i-help.mp3,06a.mp3');
  await page.evaluate(() => document.dispatchEvent(new Event('voice-audio-end')));
  await expect(voiceFlow).toHaveAttribute('data-send-stage', 'sending');
});
