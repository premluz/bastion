import { applyQuestionAction } from './sendMoneyQuestions';
// sendingMs: how long the simulated transfer processes before it lands.
export const SEND_DEMO = { defaultAmountCents: 5000, mainCents: 1800, secondaryUsdtCents: 2000, secondaryUsdcCents: 2400, feeCents: 8, sendingMs: 3000 } as const;
export const stableTotal = SEND_DEMO.mainCents + SEND_DEMO.secondaryUsdtCents + SEND_DEMO.secondaryUsdcCents;
export interface SendRequest { amountCents: number; purpose: string }
export type SendStage = 'checking' | 'options' | 'moving' | 'review' | 'editing' | 'funding' | 'confirming' | 'sending' | 'sent' | 'cancelled';
export type SendFunding = 'consolidate' | 'swap' | 'card' | 'other';
export type SendFollowUp = 'message' | 'balance';
export type SendInteractionMode = 'voice' | 'chat';
export interface SendState extends SendRequest {
  stage: SendStage; step: number; dueAt: number; balanceCents: number; funding: SendFunding | null;
  requestedAmountCents: number; preparationStarted: boolean; fundedBalanceCents: number | null;
  recipient: string | null; questionIndex: number;
  consolidated: boolean; draftAmount: string; draftPurpose: string; error: string;
  acknowledged: boolean;
  followUp: SendFollowUp | null;
}
export const dollars = (cents: number) => (cents / 100).toFixed(2);
const sendCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const displayDollars = (cents: number) => sendCurrency.format(cents / 100);
export function parseSendRequest(text: string): SendRequest | null {
  const sentence = text.trim().replace(/[.!?]+$/, '');
  if (/[!?]|\.(?!\d)/.test(sentence)) return null;
  if (/[-−]\s*\d+(?:\.\d+)?\s*dollars\b/i.test(sentence)) return null;
  const direct = sentence.match(/^send\s+\$?(\d+(?:\.\d{1,2})?)\s+to\s+daniel(?:\s+for\s+(.+))?$/i);
  if (!direct && (!/\bsend\b/i.test(sentence) || !/\bdollars\b/i.test(sentence))) return null;
  const amount = direct?.[1] ?? sentence.match(/\$\s*(\d+(?:\.\d+)?)/)?.[1]
    ?? sentence.match(/\b(\d+(?:\.\d+)?)\s+dollars\b/i)?.[1];
  if (amount && !/^\d+(?:\.\d{1,2})?$/.test(amount)) return null;
  const amountCents = amount ? Math.round(Number(amount) * 100) : SEND_DEMO.defaultAmountCents;
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) return null;
  return { amountCents, purpose: direct?.[2] ?? sentence.match(/\bfor\s+(.+)$/i)?.[1] ?? 'Coffee' };
}
export function createSendState(request: SendRequest, now: number, duration: number): SendState {
  return { ...request, requestedAmountCents: request.amountCents, preparationStarted: false, fundedBalanceCents: null, stage: 'checking', step: 0, dueAt: now + duration, balanceCents: SEND_DEMO.mainCents,
    funding: null, recipient: null, questionIndex: 0, consolidated: false, draftAmount: dollars(request.amountCents), draftPurpose: request.purpose, error: '', acknowledged: false, followUp: null };
}
export type SendAction = { type: 'choose'; funding: SendFunding; advance?: boolean } | { type: 'accept'; deferSending?: boolean }
  | { type: 'edit' | 'save' | 'cancel' | 'continue' | 'previous' | 'next' | 'skip' | 'done' | 'beginSending' | 'narrationFailed' }
  | { type: 'followUp'; value: SendFollowUp }
  | { type: 'recipient'; value: string; advance?: boolean }
  | { type: 'change'; field: 'amount' | 'purpose'; value: string };
export function draftError(amount: string, balance: number): string {
  if (!/^\d+(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) return 'Enter a positive amount with up to two decimal places.';
  if (Math.round(Number(amount) * 100) + SEND_DEMO.feeCents > balance) return 'Your main balance must cover the amount and the $0.08 fee.';
  return '';
}
export function applySendAction(state: SendState, action: SendAction, now: number, moveDuration: number): SendState {
  if (action.type === 'done' && state.stage === 'sent') return { ...state, acknowledged: true };
  if (action.type === 'followUp' && state.stage === 'sent') return { ...state, followUp: action.value };
  if (state.stage === 'sent' || state.stage === 'cancelled') return state;
  if (action.type === 'cancel') return { ...state, stage: 'cancelled', dueAt: 0, error: '' };
  if (action.type === 'beginSending' && state.stage === 'confirming') return { ...state, stage: 'sending', dueAt: now + SEND_DEMO.sendingMs };
  if (action.type === 'narrationFailed' && state.stage === 'confirming') return { ...state, stage: 'review' };
  if (state.stage === 'options') return applyQuestionAction(state, action, now, moveDuration);
  if (action.type === 'accept' && state.stage === 'funding') return { ...state, preparationStarted: true, stage: 'moving', step: 0, dueAt: now + moveDuration };
  if (action.type === 'accept' && state.stage === 'review' && state.recipient && state.amountCents + SEND_DEMO.feeCents <= state.balanceCents)
    return action.deferSending ? { ...state, stage: 'confirming', dueAt: 0 }
      : { ...state, stage: 'sending', dueAt: now + SEND_DEMO.sendingMs };
  if (action.type === 'edit' && state.stage === 'review') return { ...state, stage: 'editing', draftAmount: dollars(state.amountCents), draftPurpose: state.purpose };
  if (action.type === 'change' && state.stage === 'editing') {
    const amount = action.field === 'amount' ? action.value : state.draftAmount;
    return { ...state, draftAmount: amount, draftPurpose: action.field === 'purpose' ? action.value : state.draftPurpose,
      error: draftError(amount, state.balanceCents) };
  }
  if (action.type === 'save' && state.stage === 'editing' && !draftError(state.draftAmount, state.balanceCents))
    return { ...state, stage: 'review', amountCents: Math.round(Number(state.draftAmount) * 100), purpose: state.draftPurpose, error: '' };
  return state;
}
