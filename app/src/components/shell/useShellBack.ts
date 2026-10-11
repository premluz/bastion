import { useBackLayer } from './useBackLayer';
import type { useMobileFrame } from './useMobileFrame';

// The shell's back-able layers, in the order a user opens them: leaving Home,
// a card's detail, then the assistant over whatever is showing. Swiping back
// closes the topmost (2026-10-10).
export function useShellBack(state: ReturnType<typeof useMobileFrame>, sleepAgent: () => void, isAgentHome: boolean) {
  useBackLayer(state.activeTab !== 'home', () => state.selectTab('home'));
  useBackLayer(state.selectedCard !== null, state.closeCard);
  useBackLayer(state.mode !== 'idle', () => {
    if (state.mode === 'conversation' && isAgentHome) sleepAgent();
    else if (state.mode === 'conversation') { state.closeConversation(); return true; }   // lands in the composer
    else state.closeComposer();
  });
}
