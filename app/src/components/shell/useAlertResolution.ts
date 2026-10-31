import { useEffect } from 'react';
import type { TopUpState } from '../../engine/mortgageTopUpState';
import type { TranscriptMessage } from './transcriptMessage';

// An alert opened into the assistant (2026-10-31) is done when its scenario is: once the top-up it started has been sent,
// the alert leaves the home's queue (and the next card, or "You're caught up", comes forward as usual).
export function useAlertResolution(messages: readonly TranscriptMessage[], topUps: Readonly<Record<number, TopUpState>>, resolve: (id: string) => void) {
  useEffect(() => {
    for (const message of messages) if (message.alert && topUps[message.id]?.stage === 'sent') resolve(message.alert.id);
  }, [messages, topUps, resolve]);
}
