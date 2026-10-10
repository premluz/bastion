import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { speakText, unlockSpeech } from './speakText';

class FakeUtterance {
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  lang = '';
  voice: unknown = null;
  volume = 1;
  constructor(readonly text: string) {}
}

const spoken: FakeUtterance[] = [];
const cancel = vi.fn();
const callbacks = () => ({ voice: null, lang: 'en-US', onStart: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });

beforeEach(() => {
  vi.useFakeTimers();
  spoken.length = 0;
  cancel.mockClear();
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  vi.stubGlobal('speechSynthesis', { speak: (utterance: FakeUtterance) => spoken.push(utterance), cancel });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('speakText', () => {
  it('reports start and end of a normal utterance', () => {
    const options = callbacks();
    speakText('Hello', options);
    spoken[0]!.onstart?.();
    spoken[0]!.onend?.();
    expect(options.onStart).toHaveBeenCalledOnce();
    expect(options.onEnd).toHaveBeenCalledOnce();
    expect(options.onError).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(options.onEnd).toHaveBeenCalledOnce();
  });

  it('fails loudly when speech never starts, instead of holding the queue forever', () => {
    const options = callbacks();
    speakText('Hello', options);
    vi.advanceTimersByTime(3999);
    expect(options.onError).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(options.onError).toHaveBeenCalledOnce();
    expect(options.onError.mock.calls[0]![0].message).toMatch(/did not start/);
    expect(cancel).toHaveBeenCalled();
  });

  it('treats a started utterance whose end never arrives as finished', () => {
    const options = callbacks();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    speakText('Hi', options);
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(10_000 + 2 * 120);
    expect(options.onEnd).toHaveBeenCalledOnce();
    expect(options.onError).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('surfaces an engine error but ignores the cancel it caused itself', () => {
    const failing = callbacks();
    speakText('Hi', failing);
    spoken[0]!.onerror?.({ error: 'synthesis-failed' });
    expect(failing.onError).toHaveBeenCalledOnce();

    const cancelled = callbacks();
    const stop = speakText('Hi', cancelled);
    stop();
    spoken[1]!.onerror?.({ error: 'canceled' });
    vi.advanceTimersByTime(60_000);
    expect(cancelled.onError).not.toHaveBeenCalled();
    expect(cancelled.onEnd).not.toHaveBeenCalled();
  });

  it('applies the chosen voice and its language', () => {
    const options = { ...callbacks(), voice: { lang: 'en-GB' } as SpeechSynthesisVoice };
    speakText('Hi', options);
    expect(spoken[0]!.lang).toBe('en-GB');
    expect(spoken[0]!.voice).toBe(options.voice);
  });
});

describe('unlockSpeech', () => {
  it('speaks a silent one-space utterance', () => {
    unlockSpeech();
    expect(spoken[0]).toMatchObject({ text: ' ', volume: 0 });
  });
});
