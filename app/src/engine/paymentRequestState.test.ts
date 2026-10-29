import { describe, expect, it } from 'vitest';
import { applyPaymentRequestAction, createPaymentRequestState, isPaymentRequestFinished, isPaymentRequestWaiting, parsePaymentRequest,
  parsePaymentRequestVoice, PAYMENT_REQUEST_DEMO, tickPaymentRequest } from './paymentRequestState';

const durations = [850, 850, 850];
const atReview = () => {
  let state = createPaymentRequestState(0, durations[0]!);
  for (let step = 0; step < durations.length; step += 1) state = tickPaymentRequest(state, state.dueAt, durations);
  return state;
};

describe('payment request', () => {
  it('recognises the sender or the company beside a word for the request', () => {
    expect(parsePaymentRequest('Review Priya’s payment request')).toEqual({ kind: 'payment-request' });
    expect(parsePaymentRequest('Review Priya’s $240 payment request.')).not.toBeNull();
    expect(parsePaymentRequest('pay the Lumen invoice')).not.toBeNull();
    expect(parsePaymentRequest('who is Priya')).toBeNull();
    expect(parsePaymentRequest('Send $50 to Daniel for coffee')).toBeNull();
    expect(parsePaymentRequest('Review Daniel’s $50 payment request')).toBeNull();
  });

  it('checks, then waits on the review with nothing to choose', () => {
    let state = createPaymentRequestState(0, durations[0]!);
    expect(state).toMatchObject({ stage: 'checking', step: 0 });
    expect(isPaymentRequestWaiting(state)).toBe(true);
    state = tickPaymentRequest(state, 100, durations);
    expect(state.step).toBe(0);
    expect(atReview()).toMatchObject({ stage: 'review', dueAt: 0 });
    expect(isPaymentRequestWaiting(atReview())).toBe(false);
  });

  it('confirming pays it and ends in success', () => {
    const sending = applyPaymentRequestAction(atReview(), { type: 'accept' }, 10_000);
    expect(sending).toMatchObject({ stage: 'sending', dueAt: 10_000 + PAYMENT_REQUEST_DEMO.sendingMs });
    expect(tickPaymentRequest(sending, 10_001, durations).stage).toBe('sending');
    const sent = tickPaymentRequest(sending, sending.dueAt, durations);
    expect(sent.stage).toBe('sent');
    expect(isPaymentRequestFinished(sent)).toBe(true);
  });

  it('cancelling ends it, and actions outside the review do nothing', () => {
    expect(applyPaymentRequestAction(atReview(), { type: 'cancel' }, 0).stage).toBe('cancelled');
    const checking = createPaymentRequestState(0, durations[0]!);
    expect(applyPaymentRequestAction(checking, { type: 'accept' }, 0)).toBe(checking);
  });

  it('hears a yes or a no on the review only', () => {
    expect(parsePaymentRequestVoice('yes, pay it', atReview())).toEqual({ type: 'accept' });
    expect(parsePaymentRequestVoice('no, cancel', atReview())).toEqual({ type: 'cancel' });
    expect(parsePaymentRequestVoice('hmm', atReview())).toBeNull();
    expect(parsePaymentRequestVoice('yes', createPaymentRequestState(0, 850))).toBeNull();
  });
});
