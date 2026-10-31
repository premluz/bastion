import { useEffect, useState } from 'react';
import { areScenarioNodesLoaded, preloadScenarioNodes } from '../../registry/registry';
import type { TranscriptMessage, useMobileFrame } from './useMobileFrame';
import { trackScenarioPush } from './scenarioPush';

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
  // A suggestion is the user's first question: from the home it opens the composer on
  // it; from the landing screen (composer already open) it is simply asked.
  const ask = (text: string, prompt: string) => {
    if (state.mode === 'composer') { state.submit(text, undefined, prompt); return; }
    if (state.mode !== 'idle') return;
    setThreadStart(state.messages.length);
    state.submit(text, undefined, prompt);
    state.toggleComposer();
  };
  // A home alert opens its own scenario (2026-10-31, direct feedback, after Shopify's card-into-page): the card the user tapped
  // travels into the conversation it starts while the rest of the home recedes. It carries the shared name into the
  // transition and loses it inside the update, where the turn's opening takes it (theme/scenario-expand.css); the home's
  // own copy stays hidden (data-expanded) until the assistant closes, so the card is never in two places.
  useEffect(() => {
    if (state.mode === 'idle') document.querySelectorAll('[data-attention-item][data-expanded]').forEach((card) => card.removeAttribute('data-expanded'));
  }, [state.mode]);
  const expand = (alert: NonNullable<TranscriptMessage['alert']>) => {
    if (state.mode !== 'idle') return;
    // Tapped before the preload on the home finished: wait for it, so the scene is whole in the transition's last frame.
    if (!areScenarioNodesLoaded()) {
      preloadScenarioNodes().then(() => expand(alert), (error: unknown) => console.error('Preloading the scenario nodes failed.', error));
      return;
    }
    const card = document.querySelector(`[data-attention-item="${CSS.escape(alert.id)}"]`);
    card?.setAttribute('data-expanding', '');
    setThreadStart(state.messages.length);
    const transition = state.toggleComposer(() => { card?.removeAttribute('data-expanding'); card?.setAttribute('data-expanded', ''); state.submitAlert(alert); }, ['scenario-expand']);
    if (card) trackScenarioPush(card, transition);
  };
  return { isOpen, open, ask, expand, close: state.closeComposer, threadStart, isWorking: isOpen && state.messages.length > threadStart };
}
