import { useState } from 'react';
import { morphDock } from './dockMorph';
import type { useMobileFrame } from './useMobileFrame';
import type { useVoiceNarration } from './useVoiceNarration';
import type { useSpeechRecognition } from './useSpeechRecognition';

// The agent home's assistant (2026-10-09, direct feedback): no conversation
// screen. Waking (orb tap) starts voice mode in place over the home; the home
// gives way only once there is something to work on — a spoken command or a
// tapped suggestion — and the thread takes its place from that message on.
export function useAgentHome(state: ReturnType<typeof useMobileFrame>, speech: ReturnType<typeof useSpeechRecognition>,
  voicePlayback: ReturnType<typeof useVoiceNarration>) {
  const [threadStart, setThreadStart] = useState(0);
  const isAwake = state.mode === 'conversation';
  const begin = () => {
    setThreadStart(state.messages.length);
    morphDock(() => state.setMode('conversation'));
    speech.start();
  };
  const wake = () => {
    begin();
    voicePlayback.playWelcome();
  };
  // The tap is the user's turn: it is sent as if said, and narrated as such.
  const ask = (text: string, prompt: string) => {
    voicePlayback.prime();
    begin();
    state.submit(text, 'voice', prompt);
  };
  const sleep = () => {
    morphDock(() => state.setMode('idle'));
    state.assistantRef.current?.focus();
  };
  const caption = speech.error || voicePlayback.error || speech.text
    || (speech.isListening ? 'Listening…' : speech.isSuspended ? '' : 'Microphone is off');
  return {
    isAwake, isWorking: isAwake && state.messages.length > threadStart, threadStart, wake, ask, sleep, caption,
    activity: speech.isListening ? 'listening' as const : 'thinking' as const,
  };
}
