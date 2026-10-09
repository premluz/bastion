import { expect, test, type Page } from '@playwright/test';

const STORY = '/iframe.html?id=shell-mobileframe--default&globals=theme:safe-one;astryxTheme:stone;astryxScheme:light';
const conversation = (page: Page) => page.getByRole('dialog', { name: 'Assistant conversation', exact: true });
const flow = (page: Page) => conversation(page).getByRole('region', { name: 'Send money conversation' });
const finishClip = (page: Page) => page.evaluate(() => document.dispatchEvent(new Event('voice-test-end')));
const say = (page: Page, text: string) => page.evaluate((spoken) => {
  document.dispatchEvent(new CustomEvent('voice-test-result', { detail: spoken }));
}, text);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class FakeRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult: ((event: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null = null;
      onerror = null;
      onend: (() => void) | null = null;
      private onVoice = (event: Event) => {
        if (!(event instanceof CustomEvent) || typeof event.detail !== 'string') return;
        this.onresult?.({ results: [{ isFinal: true, 0: { transcript: event.detail } }] });
      };
      start() {
        document.documentElement.setAttribute('data-recognition-active', 'true');
        document.addEventListener('voice-test-result', this.onVoice);
      }
      stop() { this.abort(); }
      abort() {
        document.removeEventListener('voice-test-result', this.onVoice);
        document.documentElement.setAttribute('data-recognition-active', 'false');
        this.onend?.();
      }
    }
    class FakeAudio extends EventTarget {
      constructor(readonly src: string) {
        super();
        // The app keeps one audio element for every clip (iOS unlock), so each
        // end signal finishes whichever clip that element is playing.
        document.addEventListener('voice-test-end', () => this.dispatchEvent(new Event('ended')));
      }
      play() {
        const clip = this.src.match(/how-can-i-help\.mp3|0[1-5]\.mp3|06[abc]\.mp3|07\.mp3/)?.[0];
        if (!clip) throw new Error(`Unexpected voice clip: ${this.src}`);
        const root = document.documentElement;
        root.setAttribute('data-audio-played', [root.getAttribute('data-audio-played'), clip].filter(Boolean).join(','));
        return Promise.resolve();
      }
      pause() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeRecognition });
    Object.defineProperty(window, 'Audio', { configurable: true, value: FakeAudio });
  });
  await page.goto(STORY);
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Start conversation mode', exact: true }).click();
  await finishClip(page);
});

async function reachFunding(page: Page, recipient: string) {
  await page.clock.install();
  await say(page, 'Send 50 dollars to Daniel for coffee');
  await expect(page.locator('html')).toHaveAttribute('data-audio-played', /01\.mp3$/);
  await page.clock.runFor(3000);
  await finishClip(page);
  await expect(page.locator('html')).toHaveAttribute('data-audio-played', /02\.mp3$/);
  await finishClip(page);
  await say(page, `I mean ${recipient}`);
  await expect(flow(page).getByRole('radio', { name: 'Consolidate your stable USD balances' })).toBeVisible();
  await expect(conversation(page).getByText(`I mean ${recipient}`, { exact: true })).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-audio-played', /03\.mp3$/);
  await finishClip(page);
}

for (const [recipient, funding, clip] of [
  ['Smith', 'Consolidate', '06a.mp3'],
  ['Jones', 'Swap', '06b.mp3'],
  ['Smith', 'Buy', '06c.mp3'],
] as const) {
  test(`${recipient} and ${funding} select by voice; ${clip} gates sending`, async ({ page }) => {
    await reachFunding(page, recipient);
    await say(page, funding);
    await expect(flow(page)).toHaveAttribute('data-send-stage', funding === 'Consolidate' ? 'moving' : 'funding');
    await expect(conversation(page).getByText(funding, { exact: true })).toHaveCount(0);
    await finishClip(page);
    await expect(page.locator('html')).toHaveAttribute('data-audio-played', /04\.mp3$/);
    await finishClip(page);
    if (funding !== 'Consolidate') await flow(page).getByRole('button', { name: 'Confirm', exact: true }).click();
    await page.clock.runFor(5000);
    await expect(flow(page)).toHaveAttribute('data-send-stage', 'review');
    await expect(page.locator('html')).toHaveAttribute('data-audio-played', /05\.mp3$/);
    await finishClip(page);
    await flow(page).getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(flow(page)).toHaveAttribute('data-send-stage', 'confirming');
    await expect(page.locator('html')).toHaveAttribute('data-audio-played', new RegExp(`${clip.replace('.', '\\.')}$`));
    await page.clock.runFor(10000);
    await expect(flow(page)).toHaveAttribute('data-send-stage', 'confirming');
    await finishClip(page);
    await expect(flow(page)).toHaveAttribute('data-send-stage', 'sending');
  });
}
