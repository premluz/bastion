import type { SendAction, SendState } from './sendMoneyState';
import { parseConfirmation } from './voiceConfirmation';

const recipients = [
  { word: /\bsmith\b/i, value: 'daniel-smith' },
  { word: /\bjones\b/i, value: 'daniel-jones' },
] as const;
const funding = [
  { word: /\bconsolidat(?:e|ing|ion)\b/i, value: 'consolidate' },
  { word: /\bswap\b/i, value: 'swap' },
  { word: /\bbuy\b/i, value: 'card' },
] as const;

export function parseSendVoiceChoice(text: string, state: SendState): SendAction | null {
  // On the review card, yes / confirm / accept sends — deferred, as a voice
  // Confirm tap is, so the confirmation clip plays before the money moves.
  if (state.stage === 'review') {
    const answer = parseConfirmation(text);
    return answer === 'confirm' ? { type: 'accept', deferSending: true } : answer === 'cancel' ? { type: 'cancel' } : null;
  }
  if (state.stage !== 'options') return null;
  if (state.questionIndex === 0) {
    const matches = recipients.filter(({ word }) => word.test(text));
    return matches.length === 1 ? { type: 'recipient', value: matches[0]!.value, advance: true } : null;
  }
  const matches = funding.filter(({ word }) => word.test(text));
  return matches.length === 1 ? { type: 'choose', funding: matches[0]!.value, advance: true } : null;
}
