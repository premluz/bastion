import { useCallback, useEffect, useRef, useState } from 'react';
import type { useSpeechRecognition } from './useSpeechRecognition';
import welcomeClip from '../../../scenes/how-can-i-help.mp3?url';
import { pickNarrationVoice } from './narrationVoice';

// One line the assistant says: a recorded clip, or text for the browser's
// speech synthesis when no clip exists yet (2026-10-09, Prem: "browser TTS
// now"). Callbacks let a scenario react to its own narration.
export interface NarrationLine {
  key: string;
  clip?: string;
  text?: string;
  onPlaying?: (durationMs: number) => void;
  onEnd?: () => void;
  onFail?: () => void;
}
/** A line the thread wants said, keyed by the message it belongs to. */
export interface NarrationTarget { id: number; line: NarrationLine | null }
interface Queued { key: string; line: NarrationLine }

type SpeechPlaybackControl = Pick<ReturnType<typeof useSpeechRecognition>, 'pauseForPlayback' | 'resumeAfterPlayback'>;
const canSynthesize = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

// The assistant's voice for every scenario. Lines play one at a time, never
// twice, with the microphone paused while it speaks.
//
// ONE long-lived audio element (2026-10-09, reported on iPhone Chrome): iOS
// only lets an element play once a tap has started it, and most lines start
// from the speech engine's callback, not a tap. The tap that opens voice mode
// (welcome clip, or prime()) unlocks it — and speech synthesis with it.
export function useVoiceNarration(isVoiceMode: boolean, targets: readonly NarrationTarget[], speech: SpeechPlaybackControl) {
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(speech);
  speechRef.current = speech;
  const suspendedRef = useRef(false);
  const elementRef = useRef<HTMLAudioElement | null>(null);
  const currentRef = useRef<Queued | null>(null);
  const queueRef = useRef<Queued[]>([]);
  const playedRef = useRef(new Set<string>());
  // Speech synthesis is touched only once a tap or a line needs it: Chromium
  // initialises it synchronously, which held up the first render by ~0.8s
  // when this ran on mount (measured, 2026-10-09). Chrome fills the voice list
  // asynchronously, so the voice is picked again when it changes.
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const synthesisRef = useRef<(() => void) | null>(null);
  const startSynthesis = () => {
    if (synthesisRef.current || !canSynthesize()) return;
    const choose = () => { voiceRef.current = pickNarrationVoice(window.speechSynthesis.getVoices(), navigator.language || 'en-US'); };
    choose();
    window.speechSynthesis.addEventListener('voiceschanged', choose);
    synthesisRef.current = () => window.speechSynthesis.removeEventListener('voiceschanged', choose);
  };
  useEffect(() => () => synthesisRef.current?.(), []);

  const releaseMicrophone = () => {
    if (!suspendedRef.current) return;
    suspendedRef.current = false;
    speechRef.current.resumeAfterPlayback();
  };
  const finish = (item: Queued) => {
    if (currentRef.current !== item) return;
    currentRef.current = null;
    item.line.onEnd?.();
    playNext();
  };
  const fail = (item: Queued, cause: unknown) => {
    if (currentRef.current !== item) return;
    currentRef.current = null;
    queueRef.current = [];
    playedRef.current.delete(item.key);
    setIsSpeaking(false);
    releaseMicrophone();
    item.line.onFail?.();
    console.error(`Voice narration failed at ${item.key}`, cause);
    setError(`Couldn't play the ${item.line.key} voice response. Check your browser's audio permissions.`);
  };

  const getElement = () => {
    if (elementRef.current) return elementRef.current;
    const element = new Audio();
    elementRef.current = element;
    element.addEventListener('playing', () => {
      const item = currentRef.current;
      if (!item) return;
      setIsSpeaking(true);
      if (Number.isFinite(element.duration)) item.line.onPlaying?.(element.duration * 1000);
    });
    element.addEventListener('ended', () => { if (currentRef.current) actions.current.finish(currentRef.current); });
    element.addEventListener('error', () => { if (currentRef.current) actions.current.fail(currentRef.current, element.error ?? new Error('Audio playback error')); });
    return element;
  };

  const speak = (item: Queued, text: string) => {
    if (!canSynthesize()) { fail(item, new Error('Speech synthesis is unavailable in this browser.')); return; }
    startSynthesis();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceRef.current?.lang ?? (navigator.language || 'en-US');
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.onstart = () => { if (currentRef.current === item) setIsSpeaking(true); };
    utterance.onend = () => finish(item);
    utterance.onerror = (event) => {
      // stop() cancels synthesis on purpose; that is not a failure.
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      fail(item, new Error(`Speech synthesis error: ${event.error}`));
    };
    window.speechSynthesis.speak(utterance);
  };

  function playNext() {
    if (currentRef.current) return;
    const item = queueRef.current.shift();
    if (!item) { setIsSpeaking(false); releaseMicrophone(); return; }
    currentRef.current = item;
    setError('');
    if (!suspendedRef.current) { suspendedRef.current = true; speechRef.current.pauseForPlayback(); }
    if (item.line.clip) {
      const audio = getElement();
      audio.src = item.line.clip;
      audio.muted = false;
      void audio.play().catch((cause: unknown) => fail(item, cause));
    } else speak(item, item.line.text ?? '');
  }
  // Audio listeners and the stable callbacks below outlive this render; they
  // reach the current helpers through this ref.
  // Inside a tap: an empty utterance unlocks speech synthesis on iOS.
  const unlockSynthesis = () => {
    if (!canSynthesize()) return;
    startSynthesis();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  };
  const actions = useRef({ finish, fail, playNext, getElement, unlockSynthesis });
  actions.current = { finish, fail, playNext, getElement, unlockSynthesis };

  const stop = useCallback(() => {
    // Only a playing line is paused: pausing an idle element would abort a
    // prime() still unlocking it inside the user's tap.
    if (currentRef.current) elementRef.current?.pause();
    currentRef.current = null;
    queueRef.current = [];
    if (synthesisRef.current) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    suspendedRef.current = false;
  }, []);

  // Inside a tap: unlocks the audio element (a muted play) and speech
  // synthesis (an empty utterance) so later lines may play on iOS.
  const prime = useCallback(() => {
    actions.current.unlockSynthesis();
    const audio = actions.current.getElement();
    if (currentRef.current) return;
    audio.muted = true;
    audio.src = welcomeClip;
    audio.play().then(() => {
      if (!currentRef.current) audio.pause();
      audio.muted = false;
    }, (cause: unknown) => {
      audio.muted = false;
      // A real line taking the element over mid-prime aborts this play(); expected.
      if (currentRef.current) return;
      console.error('Priming voice playback failed', cause);
    });
  }, []);

  const playWelcome = useCallback(() => {
    actions.current.unlockSynthesis();
    queueRef.current.push({ key: 'welcome', line: { key: 'welcome', clip: welcomeClip } });
    actions.current.playNext();
  }, []);

  // Line objects are rebuilt every render; their keys are their identity.
  const pending = targets.flatMap(({ id, line }) => line ? [{ key: `${id}:${line.key}`, line }] : []);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const keys = pending.map((item) => item.key).join('|');
  useEffect(() => {
    if (!isVoiceMode) { stop(); return; }
    const fresh = pendingRef.current.filter((item) => !playedRef.current.has(item.key));
    if (!fresh.length) return;
    for (const item of fresh) { playedRef.current.add(item.key); queueRef.current.push(item); }
    actions.current.playNext();
  }, [isVoiceMode, keys, stop]);

  useEffect(() => stop, [stop]);
  return { error, playWelcome, prime, isSpeaking };
}
