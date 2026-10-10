import { parseConfirmation } from './voiceConfirmation';

// Mortgage top-up (2026-10-09): the agent home's second scenario. All figures
// are authored demo values, like SEND_DEMO — no mortgage account exists in the
// universe. The Money figure mirrors moneySummary.ts's placeholder (shell
// layer, which the engine may not import).
export const TOP_UP_DEMO = {
  repaymentCents: 124000, accountCents: 105000, sendingMs: 3000,
  sources: { money: { label: 'Money balance', balanceCents: 347545 }, usdc: { label: 'USDC', balanceCents: 95000 } },
} as const;
export const shortfallCents = TOP_UP_DEMO.repaymentCents - TOP_UP_DEMO.accountCents;

export type TopUpSource = keyof typeof TOP_UP_DEMO.sources;
export type TopUpStage = 'checking' | 'options' | 'review' | 'editing' | 'sending' | 'sent' | 'cancelled';
export interface TopUpRequest { kind: 'mortgage-top-up' }
export interface TopUpState {
  stage: TopUpStage; step: number; dueAt: number; source: TopUpSource | null;
  amountCents: number; draftAmount: string; purpose: string; draftPurpose: string; error: string;
}
export type TopUpAction = { type: 'source'; value: TopUpSource; advance?: boolean }
  | { type: 'continue' | 'accept' | 'edit' | 'save' | 'cancel' }
  | { type: 'change'; field: 'amount' | 'purpose'; value: string };

const isSource = (value: string): value is TopUpSource => value in TOP_UP_DEMO.sources;
const dollars = (cents: number) => (cents / 100).toFixed(2);

// Speech engines write "top-up", "top up", "topup" and mishear "up" as "of",
// so any action word beside "mortgage" counts; "mortgage" alone (a question
// about it) does not.
export function parseTopUpRequest(text: string): TopUpRequest | null {
  return /\bmortgage\b/i.test(text) && /\b(top|topup|top-up|up|of|cover|fund|short|pay|repay|add|deposit|transfer|move|put)\b/i.test(text) ? { kind: 'mortgage-top-up' } : null;
}

export function createTopUpState(now: number, firstStepMs: number): TopUpState {
  return { stage: 'checking', step: 0, dueAt: now + firstStepMs, source: null, amountCents: shortfallCents,
    draftAmount: dollars(shortfallCents), purpose: 'Today’s repayment', draftPurpose: 'Today’s repayment', error: '' };
}

export function topUpDraftError(amount: string, source: TopUpSource | null): string {
  if (!/^\d+(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) return 'Enter a positive amount with up to two decimal places.';
  if (source && Math.round(Number(amount) * 100) > TOP_UP_DEMO.sources[source].balanceCents) return `Your ${TOP_UP_DEMO.sources[source].label} can’t cover that.`;
  return '';
}

export function applyTopUpAction(state: TopUpState, action: TopUpAction, now: number): TopUpState {
  if (state.stage === 'sent' || state.stage === 'cancelled') return state;
  if (action.type === 'cancel') return { ...state, stage: 'cancelled', dueAt: 0, error: '' };
  if (state.stage === 'options') {
    if (action.type === 'source' && isSource(action.value)) {
      const chosen = { ...state, source: action.value, error: '' };
      return action.advance ? { ...chosen, stage: 'review' } : chosen;
    }
    if (action.type === 'continue') return state.source ? { ...state, stage: 'review', error: '' }
      : { ...state, error: 'Choose where the top-up should come from before continuing.' };
    return state;
  }
  if (state.stage === 'review') {
    if (action.type === 'accept') return { ...state, stage: 'sending', dueAt: now + TOP_UP_DEMO.sendingMs };
    if (action.type === 'edit') return { ...state, stage: 'editing', draftAmount: dollars(state.amountCents), draftPurpose: state.purpose };
    return state;
  }
  if (state.stage === 'editing') {
    if (action.type === 'change') {
      const draftAmount = action.field === 'amount' ? action.value : state.draftAmount;
      return { ...state, draftAmount, draftPurpose: action.field === 'purpose' ? action.value : state.draftPurpose, error: topUpDraftError(draftAmount, state.source) };
    }
    if (action.type === 'save' && !topUpDraftError(state.draftAmount, state.source))
      return { ...state, stage: 'review', amountCents: Math.round(Number(state.draftAmount) * 100), purpose: state.draftPurpose, error: '' };
  }
  return state;
}

/** stepDurations: the checking trail's step lengths, in order. */
export function tickTopUp(state: TopUpState, now: number, stepDurations: readonly number[]): TopUpState {
  if (state.stage === 'sending') return now < state.dueAt ? state : { ...state, stage: 'sent', dueAt: 0 };
  if (state.stage !== 'checking' || now < state.dueAt) return state;
  const next = stepDurations[state.step + 1];
  return next === undefined ? { ...state, stage: 'options', dueAt: 0 } : { ...state, step: state.step + 1, dueAt: now + next };
}

export const isTopUpWaiting = (state: TopUpState) => state.stage === 'checking' || state.stage === 'sending';
export const isTopUpFinished = (state: TopUpState) => state.stage === 'sent' || state.stage === 'cancelled';

// Spoken answers: which source, or a yes/no on the review.
export function parseTopUpVoice(text: string, state: TopUpState): TopUpAction | null {
  if (state.stage === 'options') {
    const money = /\b(money|cash|main)\b/i.test(text);
    const usdc = /\b(usdc|stable(?:coin)?s?|crypto)\b/i.test(text);
    if (money !== usdc) return { type: 'source', value: money ? 'money' : 'usdc', advance: true };
    return null;
  }
  if (state.stage === 'review') {
    const answer = parseConfirmation(text);
    if (answer) return { type: answer === 'confirm' ? 'accept' : 'cancel' };
  }
  return null;
}
