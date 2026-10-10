// Speaking text with the browser's speech synthesis, hardened for devices
// where it silently does nothing (2026-10-09, reported: the reply showed but
// nothing was said). Synthesis offers no promise — only start/end events —
// so a utterance that never starts, or never ends, would hold the assistant's
// whole queue and the microphone forever. Two watchdogs turn those into an
// error and a normal end.
const START_TIMEOUT_MS = 4000;
const END_BASE_MS = 10_000;
const END_PER_CHAR_MS = 120;

export const canSpeak = () => typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined';

// Chrome can collect an utterance before its `end` event fires, so each
// in-flight one is held here until it settles.
const inFlight = new Set<SpeechSynthesisUtterance>();

// Inside a tap: iOS only lets synthesis speak later, from non-tap callbacks,
// once a tap has spoken something. A single space at zero volume is silent
// but counts; an empty string is ignored by some engines.
export function unlockSpeech() {
  if (!canSpeak()) return;
  const unlock = new SpeechSynthesisUtterance(' ');
  unlock.volume = 0;
  speechSynthesis.speak(unlock);
}

export interface SpeakOptions {
  voice: SpeechSynthesisVoice | null;
  lang: string;
  onStart: () => void;
  onEnd: () => void;
  onError: (cause: Error) => void;
}

/** Starts speaking; the returned function cancels it without calling any callback. */
export function speakText(text: string, options: SpeakOptions): () => void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.voice?.lang ?? options.lang;
  if (options.voice) utterance.voice = options.voice;
  let settled = false;
  let started = false;
  let startTimer: ReturnType<typeof setTimeout> | undefined;
  let endTimer: ReturnType<typeof setTimeout> | undefined;
  const settle = () => {
    settled = true;
    clearTimeout(startTimer);
    clearTimeout(endTimer);
    inFlight.delete(utterance);
  };
  utterance.onstart = () => {
    if (settled) return;
    started = true;
    clearTimeout(startTimer);
    endTimer = setTimeout(() => {
      if (settled) return;
      settle();
      speechSynthesis.cancel();
      console.warn('Speech synthesis never reported the end of an utterance; treating it as finished.');
      options.onEnd();
    }, END_BASE_MS + text.length * END_PER_CHAR_MS);
    options.onStart();
  };
  utterance.onend = () => { if (settled) return; settle(); options.onEnd(); };
  utterance.onerror = (event) => {
    // Our own cancel() surfaces as interrupted/canceled; that is not a failure.
    if (settled || event.error === 'interrupted' || event.error === 'canceled') return;
    settle();
    options.onError(new Error(`Speech synthesis error: ${event.error}`));
  };
  startTimer = setTimeout(() => {
    if (settled || started) return;
    settle();
    speechSynthesis.cancel();
    options.onError(new Error(`Speech synthesis did not start within ${START_TIMEOUT_MS} ms.`));
  }, START_TIMEOUT_MS);
  inFlight.add(utterance);
  speechSynthesis.speak(utterance);
  return () => {
    if (settled) return;
    settle();
    speechSynthesis.cancel();
  };
}
