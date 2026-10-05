import { describe, expect, it } from 'vitest';
import { applySendAction, createSendState, parseSendRequest, SEND_DEMO, stableTotal } from './sendMoneyState';
import { tickSend, buildPaymentScene, buildSendOptions, sendSteps } from './sendMoneyScenes';
import { buildSendTransferScene } from './sendMoneyConversation';
import { PaymentCardPropsSchema } from '../contracts/props/payment-card';

function checking(amountCents = 5000) {
  let state = createSendState({ amountCents, purpose: 'Coffee' }, 0, 850);
  while (state.stage === 'checking') state = tickSend(state, state.dueAt);
  return state;
}
function answered(amountCents = 5000) {
  return applySendAction(checking(amountCents), { type: 'recipient', value: 'daniel-smith', advance: true }, 0, 850);
}
function settle(state: ReturnType<typeof checking>) {
  while (state.stage === 'moving' || state.stage === 'sending') state = tickSend(state, state.dueAt);
  return state;
}
function consolidated() {
  const state = applySendAction(answered(), { type: 'choose', funding: 'consolidate' }, 0, 850);
  return settle(applySendAction(state, { type: 'continue' }, 0, 850));
}
describe('send money simulation', () => {
  it('starts from send and dollars in one sentence, while preserving spoken amounts', () => {
    expect(parseSendRequest('Send $50 to Daniel for coffee')).toEqual({ amountCents: 5000, purpose: 'coffee' });
    expect(parseSendRequest('Please send 12.34 dollars to Daniel for Lunch.')).toEqual({ amountCents: 1234, purpose: 'Lunch' });
    expect(parseSendRequest('Send dollars')).toEqual({ amountCents: 5000, purpose: 'Coffee' });
    expect(parseSendRequest('Send 50 dollars to Alex')).toEqual({ amountCents: 5000, purpose: 'Coffee' });
    expect(parseSendRequest('Send $50 to Alex')).toBeNull();
    expect(parseSendRequest('Send $0 to Daniel')).toBeNull();
    expect(parseSendRequest('Send -50 dollars')).toBeNull();
    expect(parseSendRequest('Send 50.123 dollars')).toBeNull();
    expect(parseSendRequest('Send now. I have 50 dollars.')).toBeNull();
  });
  it('consolidation only moves internal funds; final Accept debits once including the fee', () => {
    const review = consolidated();
    expect(review.stage).toBe('review');
    expect(review.balanceCents).toBe(stableTotal);
    expect(review.consolidated).toBe(true);
    const sending = applySendAction(review, { type: 'accept' }, 0, 850);
    expect(sending.stage).toBe('sending');
    expect(sending.dueAt).toBe(SEND_DEMO.sendingMs);
    expect(sending.balanceCents).toBe(stableTotal);
    expect(tickSend(sending, SEND_DEMO.sendingMs - 1)).toEqual(sending);
    const sent = tickSend(sending, sending.dueAt);
    expect(sent.balanceCents).toBe(1192);
    expect(sent.stage).toBe('sent');
    expect(applySendAction(sent, { type: 'accept' }, 0, 850)).toEqual(sent);
    expect(applySendAction(sending, { type: 'followUp', value: 'balance' }, 0, 850)).toEqual(sending);
    expect(applySendAction(sent, { type: 'followUp', value: 'balance' }, 0, 850)).toMatchObject({ followUp: 'balance', balanceCents: 1192 });
    expect(PaymentCardPropsSchema.safeParse(buildPaymentScene(review).layout.props).success).toBe(true);
    expect(buildPaymentScene(review, 'inline').layout.props).toMatchObject({ presentation: 'inline', mode: 'review' });
    expect(buildPaymentScene(review, 'inline').layout.props).toMatchObject({ recipient: 'Daniel Smith' });
    expect(buildPaymentScene(sending, 'inline').layout.props).toMatchObject({ presentation: 'inline', mode: 'sending' });
    expect(buildPaymentScene(sent, 'inline').layout.props).toMatchObject({ presentation: 'inline', mode: 'sent' });
    expect(buildSendTransferScene(sent, 'inline').layout.children?.some((node) => node.id === 'send-outcome')).toBe(false);
  });
  it('voice confirmation holds the review until narration finishes', () => {
    const review = consolidated();
    const confirming = applySendAction(review, { type: 'accept', deferSending: true }, 100, 850);
    expect(confirming).toMatchObject({ stage: 'confirming', dueAt: 0, balanceCents: stableTotal });
    expect(tickSend(confirming, 10000)).toEqual(confirming);
    expect(applySendAction(confirming, { type: 'accept', deferSending: true }, 100, 850)).toEqual(confirming);
    expect(buildPaymentScene(confirming, 'inline').layout.props).toMatchObject({ mode: 'confirming' });
    const sending = applySendAction(confirming, { type: 'beginSending' }, 5000, 850);
    expect(sending).toMatchObject({ stage: 'sending', dueAt: 5000 + SEND_DEMO.sendingMs });
    expect(applySendAction(sending, { type: 'beginSending' }, 5000, 850)).toEqual(sending);
    expect(applySendAction(confirming, { type: 'narrationFailed' }, 5000, 850).stage).toBe('review');
  });
  it('cancel after consolidation leaves those funds in Main', () => {
    const cancelled = applySendAction(consolidated(), { type: 'cancel' }, 0, 850);
    expect(cancelled.stage).toBe('cancelled');
    expect(cancelled.balanceCents).toBe(stableTotal);
    expect(applySendAction(cancelled, { type: 'accept' }, 0, 850)).toEqual(cancelled);
  });
  it('edit must include the fee and requires another review before sending', () => {
    let state = applySendAction(consolidated(), { type: 'edit' }, 0, 850);
    state = applySendAction(state, { type: 'change', field: 'amount', value: '62.00' }, 0, 850);
    expect(state.error).toContain('$0.08');
    expect(applySendAction(state, { type: 'save' }, 0, 850).stage).toBe('editing');
    state = applySendAction(state, { type: 'change', field: 'amount', value: '45.00' }, 0, 850);
    state = applySendAction(state, { type: 'save' }, 0, 850);
    expect(state.stage).toBe('review');
    expect(state.balanceCents).toBe(6200);
    expect(state.amountCents).toBe(4500);
  });
  it('insufficient aggregate stables cannot consolidate; sufficient main funds skip options', () => {
    const tooMuch = checking(7000);
    expect(applySendAction(tooMuch, { type: 'choose', funding: 'consolidate' }, 0, 850)).toEqual(tooMuch);
    const small = answered(1000);
    expect(small.questionIndex).toBe(0);
    expect(settle(small).stage).toBe('review');
  });
  it('voice selection advances while chat preserves answers for arrow navigation', () => {
    const first = checking();
    expect(buildSendOptions(first, 'voice').props.navigationMode).toBe('hidden');
    expect(buildSendOptions(first, 'chat').props.navigationMode).toBe('numbered');
    expect(buildSendOptions(first).props.allowSkip).toBe(false);
    expect(buildSendOptions(first).props.options.map((option) => option.description)).toEqual(['Work', 'Coffee club']);
    const chosen = applySendAction(first, { type: 'recipient', value: 'daniel-jones' }, 0, 850);
    expect(chosen).toMatchObject({ stage: 'options', questionIndex: 0, recipient: 'daniel-jones' });
    const second = applySendAction(chosen, { type: 'next' }, 0, 850);
    expect(second).toMatchObject({ stage: 'options', questionIndex: 1, recipient: 'daniel-jones' });
    expect(applySendAction(second, { type: 'previous' }, 0, 850)).toMatchObject({ questionIndex: 0, recipient: 'daniel-jones' });
    expect(applySendAction(first, { type: 'recipient', value: 'daniel-jones', advance: true }, 0, 850).questionIndex).toBe(1);
    expect(buildSendOptions(second, 'voice').props.navigationMode).toBe('hidden');
  });
  it('voice funding selection acts immediately but chat waits for Continue', () => {
    const options = answered();
    expect(applySendAction(options, { type: 'choose', funding: 'consolidate' }, 0, 850)).toMatchObject({ stage: 'options', funding: 'consolidate' });
    expect(applySendAction(options, { type: 'choose', funding: 'consolidate', advance: true }, 0, 850)).toMatchObject({ stage: 'moving', funding: 'consolidate' });
  });
  it('asks for the requested amount and keeps custom funding unapproved', () => {
    const options = answered();
    const card = buildSendOptions(options);
    expect(card.props.prompt).toBe('Where should the $50 come from?');
    expect(card.props.options.map((option) => option.label)).toEqual([
      'Consolidate your stable USD balances', 'Swap some ETH → USDT then send',
      'Buy more USDT with your card', 'Something else',
    ]);
    expect(card.props.options.every((option) => !option.description)).toBe(true);
    expect(buildSendOptions(answered(2512)).props.prompt).toBe('Where should the $25.12 come from?');
    const other = applySendAction(options, { type: 'choose', funding: 'other' }, 0, 850);
    expect(other.error).toBe('Tell me what you’d like to use in the composer.');
    expect(applySendAction(other, { type: 'continue' }, 0, 850)).toMatchObject({ stage: 'options', questionIndex: 1 });
  });
  it('shows the requested preparation as resolved thinking steps', () => {
    expect(sendSteps(consolidated()).map((step) => [step.label, step.detail])).toEqual([
      ['Preparing the transfer now.', 'Confirmed.'],
      ['Consolidating your balances now.', 'Funds are ready.'],
      ['Finalizing transfer…', 'All set.'],
      ['Generating interface…', 'Transfer ready for your review.'],
    ]);
  });
  it.each(['swap', 'card'] as const)('%s needs funding acceptance and separate transfer acceptance', (funding) => {
    let state = applySendAction(answered(), { type: 'choose', funding }, 0, 850);
    state = applySendAction(state, { type: 'continue' }, 0, 850);
    expect(state.stage).toBe('funding');
    expect(state.balanceCents).toBe(SEND_DEMO.mainCents);
    state = applySendAction(state, { type: 'accept' }, 0, 850);
    expect(sendSteps(state)[0]?.label).not.toContain('Moving USDC');
    state = settle(state);
    expect(state.stage).toBe('review');
    expect(state.balanceCents).toBe(5008);
  });
  it('cancelling while sending debits nothing; done only acknowledges a landed transfer', () => {
    const sending = applySendAction(consolidated(), { type: 'accept' }, 0, 850);
    const cancelled = applySendAction(sending, { type: 'cancel' }, 0, 850);
    expect(cancelled.stage).toBe('cancelled');
    expect(cancelled.balanceCents).toBe(stableTotal);
    expect(applySendAction(sending, { type: 'done' }, 0, 850)).toEqual(sending);
    const sent = settle(sending);
    expect(sent.acknowledged).toBe(false);
    expect(applySendAction(sent, { type: 'done' }, 0, 850).acknowledged).toBe(true);
  });
});
