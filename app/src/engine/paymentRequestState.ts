import { parseConfirmation } from './voiceConfirmation';

// Review a payment request (2026-10-28, direct request): the agent home's second recommended action, now a
// request from a company rather than from Daniel — Priya Nair at Lumen Studio, asking for the last invoice of a
// brand refresh. The sender is known, so there is nothing to choose: check it, confirm it, done. All figures are
// authored demo values, like SEND_DEMO and TOP_UP_DEMO. (Sending to Daniel, with its "which Daniel?", is still
// there for anyone who types it.)
export const PAYMENT_REQUEST_DEMO = {
  sender: 'Priya Nair', company: 'Lumen Studio', invoice: 'INV-2041',
  amountCents: 24000, sendingMs: 3000, balanceCents: 347545,
} as const;

export type PaymentRequestStage = 'checking' | 'review' | 'sending' | 'sent' | 'cancelled';
export interface PaymentRequest { kind: 'payment-request' }
export interface PaymentRequestState { stage: PaymentRequestStage; step: number; dueAt: number }
export type PaymentRequestAction = { type: 'accept' | 'cancel' };

// The sender, or the company, beside a word for the request: "Review Priya's payment request", "pay the Lumen
// invoice". The name alone (a question about her) does not count.
export function parsePaymentRequest(text: string): PaymentRequest | null {
  return /\b(priya|lumen)\b/i.test(text) && /\b(request|invoice|payment|pay|bill|review)\b/i.test(text) ? { kind: 'payment-request' } : null;
}

export function createPaymentRequestState(now: number, firstStepMs: number): PaymentRequestState {
  return { stage: 'checking', step: 0, dueAt: now + firstStepMs };
}

export function applyPaymentRequestAction(state: PaymentRequestState, action: PaymentRequestAction, now: number): PaymentRequestState {
  if (state.stage !== 'review') return state;
  if (action.type === 'cancel') return { ...state, stage: 'cancelled', dueAt: 0 };
  return { ...state, stage: 'sending', dueAt: now + PAYMENT_REQUEST_DEMO.sendingMs };
}

/** stepDurations: the checking trail's step lengths, in order. */
export function tickPaymentRequest(state: PaymentRequestState, now: number, stepDurations: readonly number[]): PaymentRequestState {
  if (state.stage === 'sending') return now < state.dueAt ? state : { ...state, stage: 'sent', dueAt: 0 };
  if (state.stage !== 'checking' || now < state.dueAt) return state;
  const next = stepDurations[state.step + 1];
  return next === undefined ? { ...state, stage: 'review', dueAt: 0 } : { ...state, step: state.step + 1, dueAt: now + next };
}

export const isPaymentRequestWaiting = (state: PaymentRequestState) => state.stage === 'checking' || state.stage === 'sending';
export const isPaymentRequestFinished = (state: PaymentRequestState) => state.stage === 'sent' || state.stage === 'cancelled';

// A spoken yes or no on the review.
export function parsePaymentRequestVoice(text: string, state: PaymentRequestState): PaymentRequestAction | null {
  if (state.stage !== 'review') return null;
  const answer = parseConfirmation(text);
  return answer ? { type: answer === 'confirm' ? 'accept' : 'cancel' } : null;
}
