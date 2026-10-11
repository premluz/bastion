import { useState } from 'react';
import type { useMobileFrame } from './useMobileFrame';

// The glow home's assistant (2026-10-10, direct feedback): the composer opens in
// place over the home, which stays as it is until the first question; from then
// on the home's contents give way and the thread takes their place, as on the
// agent home. The thread shows only what was asked since the composer opened.
export function useGlowHome(state: ReturnType<typeof useMobileFrame>) {
  const [threadStart, setThreadStart] = useState(0);
  const isOpen = state.mode === 'composer';
  const open = () => {
    if (state.mode !== 'idle') return;
    setThreadStart(state.messages.length);
    state.toggleComposer();
  };
  // A suggestion is the user's first question: it opens the composer on it.
  const ask = (text: string, prompt: string) => {
    if (state.mode !== 'idle') return;
    setThreadStart(state.messages.length);
    state.submit(text, undefined, prompt);
    state.toggleComposer();
  };
  return { isOpen, open, ask, close: state.closeComposer, threadStart, isWorking: isOpen && state.messages.length > threadStart };
}
