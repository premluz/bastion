import { useCallback, useEffect, useRef, useState } from 'react';
import type { SendAction, SendState } from '../../engine/sendMoneyState';
import type { TranscriptMessage } from './useMobileFrame';
import type { useSpeechRecognition } from './useSpeechRecognition';
import welcomeClip from '../../../scenes/how-can-i-help.mp3?url';
import promptClip from '../../../scenes/send-paul/01.mp3?url';
import recipientClip from '../../../scenes/send-paul/02.mp3?url';
import fundingClip from '../../../scenes/send-paul/03.mp3?url';
import answeredClip from '../../../scenes/send-paul/04.mp3?url';
import confirmationClip from '../../../scenes/send-paul/05.mp3?url';
import consolidateClip from '../../../scenes/send-paul/06a.mp3?url';
import swapClip from '../../../scenes/send-paul/06b.mp3?url';
import buyClip from '../../../scenes/send-paul/06c.mp3?url';

const clips = {
  welcome: welcomeClip,
  prompt: promptClip,
  recipient: recipientClip,
  funding: fundingClip,
  answered: answeredClip,
  confirmation: confirmationClip,
  consolidate: consolidateClip,
  swap: swapClip,
  buy: buyClip,
} as const;

type Cue = keyof typeof clips;
const isTransferCue = (cue: Cue) => cue === 'consolidate' || cue === 'swap' || cue === 'buy';

function cueFor(state: SendState): Cue | null {
  switch (state.stage) {
    case 'checking': return 'prompt';
    case 'options': return state.questionIndex === 0 ? 'recipient' : 'funding';
    case 'moving':
    case 'funding': return 'answered';
    case 'review':
    case 'editing': return 'confirmation';
    case 'confirming': return state.funding === 'swap' ? 'swap' : state.funding === 'card' ? 'buy' : 'consolidate';
    case 'sending':
    case 'sent': return null;
    case 'cancelled': return null;
  }
}

type SpeechPlaybackControl = Pick<ReturnType<typeof useSpeechRecognition>, 'pauseForPlayback' | 'resumeAfterPlayback'>;

export function useSendVoicePlayback(isVoiceMode: boolean, messages: readonly TranscriptMessage[], flows: Record<number, SendState>, speech: SpeechPlaybackControl, dispatch: (id: number, action: SendAction) => void) {
  const [error, setError] = useState('');
  // True while a voice clip is audibly playing — drives the orb's talking
  // pulse (2026-10-06).
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(speech);
  speechRef.current = speech;
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  const suspendedRef = useRef(false);
  const activeId = useRef<number | null>(null);
  const closedId = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Cue[]>([]);
  const playedRef = useRef(new Set<Cue>());

  const stop = useCallback((resume = false) => {
    const audio = audioRef.current;
    audioRef.current = null;
    audio?.pause();
    setIsSpeaking(false);
    queueRef.current = [];
    playedRef.current.clear();
    activeId.current = null;
    if (suspendedRef.current) {
      suspendedRef.current = false;
      if (resume) speechRef.current.resumeAfterPlayback();
    }
  }, []);

  const playNext = useCallback(function playNext() {
    if (audioRef.current) return;
    const cue = queueRef.current.shift();
    if (!cue) {
      setIsSpeaking(false);
      if (suspendedRef.current) {
        suspendedRef.current = false;
        speechRef.current.resumeAfterPlayback();
      }
      return;
    }
    const audio = new Audio(clips[cue]);
    audioRef.current = audio;
    setError('');
    if (!suspendedRef.current) {
      suspendedRef.current = true;
      speechRef.current.pauseForPlayback();
    }
    audio.addEventListener('playing', () => { if (audioRef.current === audio) setIsSpeaking(true); });
    audio.addEventListener('ended', () => {
      if (audioRef.current !== audio) return;
      audioRef.current = null;
      if (isTransferCue(cue) && activeId.current !== null) dispatchRef.current(activeId.current, { type: 'beginSending' });
      playNext();
    }, { once: true });
    const failPlayback = (cause: unknown) => {
      if (audioRef.current !== audio) return;
      audioRef.current = null;
      setIsSpeaking(false);
      queueRef.current = [];
      playedRef.current.delete(cue);
      suspendedRef.current = false;
      speechRef.current.resumeAfterPlayback();
      if (isTransferCue(cue) && activeId.current !== null) dispatchRef.current(activeId.current, { type: 'narrationFailed' });
      console.error(`Send voice narration failed at ${cue}`, cause);
      setError(`Couldn't play the ${cue} voice response. Check your browser's audio permissions.`);
    };
    audio.addEventListener('error', () => failPlayback(audio.error ?? new Error('Audio playback error')), { once: true });
    void audio.play().catch(failPlayback);
  }, []);

  const playWelcome = useCallback(() => {
    setError('');
    queueRef.current.push('welcome');
    playNext();
  }, [playNext]);

  useEffect(() => {
    const message = [...messages].reverse().find((item) => item.sendRequest
      && (item.source === 'voice' || flows[item.id]?.stage === 'confirming'));
    if (!isVoiceMode) {
      if (activeId.current !== null) closedId.current = activeId.current;
      stop();
      return;
    }
    if (!message) return;
    const state = flows[message.id];
    if (!state || (closedId.current === message.id && state.stage !== 'confirming')) return;
    if (activeId.current !== message.id) {
      if (activeId.current !== null) stop();
      activeId.current = message.id;
      playedRef.current.clear();
    }
    const cue = cueFor(state);
    if (!cue) { closedId.current = message.id; stop(true); return; }
    if (playedRef.current.has(cue)) return;
    playedRef.current.add(cue);
    queueRef.current.push(cue);
    playNext();
  }, [isVoiceMode, messages, flows, playNext, stop]);

  useEffect(() => stop, [stop]);
  return { error, playWelcome, isSpeaking };
}
