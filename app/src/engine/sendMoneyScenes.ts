import optionsJson from '../../scenes/send-paul-options.scene.json';
import reviewJson from '../../scenes/send-paul-review.scene.json';
import { HydratedSceneSchema } from '../contracts/scene';
import type { PaymentCardProps } from '../contracts/props/payment-card';
import { displayDollars, dollars, SEND_DEMO, stableTotal, type SendState, type SendInteractionMode } from './sendMoneyState';
import { fundingQuestion, recipientQuestion, recipientName, needsFunding } from './sendMoneyQuestions';

export const sendOptions = HydratedSceneSchema.parse(optionsJson);
export const sendReview = HydratedSceneSchema.parse(reviewJson);
export function sendSteps(state: SendState, phase = state.stage) {
  if (phase === 'checking') return sendOptions.thinking.map((step) => step.id === 'balances' ? { ...step,
    detail: needsFunding(state) ? `You don’t have $${dollars(state.requestedAmountCents)} in any single account.` : `Your main balance covers $${dollars(state.requestedAmountCents)} and the fee.` } : step);
  return sendReview.thinking.filter((step) => step.id !== 'funds' || state.funding).map((step) => {
    if (step.id !== 'funds' || state.funding === 'consolidate') return step;
    if (state.funding !== 'swap' && state.funding !== 'card') return step;
    return { ...step, label: state.funding === 'swap' ? 'Swapping ETH into USDT…' : 'Adding USDT from your card…' };
  });
}
export function tickSend(state: SendState, now: number): SendState {
  if (state.stage === 'sending') return now < state.dueAt ? state
    : { ...state, stage: 'sent', dueAt: 0, balanceCents: state.balanceCents - state.amountCents - SEND_DEMO.feeCents };
  if (!['checking', 'moving'].includes(state.stage) || now < state.dueAt) return state;
  const steps = sendSteps(state);
  const moved = state.stage === 'moving' && steps[state.step]?.id === 'funds';
  const updated = { ...state, fundedBalanceCents: moved ? state.funding === 'consolidate' ? stableTotal : state.amountCents + SEND_DEMO.feeCents : state.fundedBalanceCents, balanceCents: moved ? state.funding === 'consolidate' ? stableTotal : state.amountCents + SEND_DEMO.feeCents : state.balanceCents,
    consolidated: state.consolidated || (moved && state.funding === 'consolidate') };
  if (state.step + 1 < steps.length) return { ...updated, step: state.step + 1, dueAt: now + steps[state.step + 1]!.durationMs };
  return { ...updated, dueAt: 0, stage: state.stage === 'checking' ? 'options' : 'review' };
}
export function buildSendOptions(state: SendState, interactionMode: SendInteractionMode = 'chat') {
  const recipient = state.questionIndex === 0;
  const props = recipient ? recipientQuestion : fundingQuestion;
  const selected = recipient ? state.recipient : state.funding;
  const amount = displayDollars(state.requestedAmountCents);
  return { id: recipient ? 'send-recipient' : 'send-options', type: 'approval-card', props: { ...props,
    prompt: recipient ? props.prompt : `Where should the ${amount} come from?`,
    questionCount: needsFunding(state) ? 2 : 1, selected: selected ?? '',
    navigationMode: interactionMode === 'voice' ? 'hidden' : 'numbered',
    options: props.options.map((option) => ({ ...option, isDisabled: option.value === 'consolidate' && state.amountCents + SEND_DEMO.feeCents > stableTotal })) } };
}
export function buildPaymentScene(state: SendState, presentation: PaymentCardProps['presentation'] = 'overlay') {
  const funding = state.stage === 'funding';
  const name = recipientName(state);
  const amount = funding ? dollars(state.amountCents + SEND_DEMO.feeCents - state.balanceCents)
    : state.stage === 'editing' ? state.draftAmount : dollars(state.amountCents);
  const title = funding ? state.funding === 'swap' ? 'Swap ETH to USDT' : 'Buy USDT with your card'
    : state.stage === 'cancelled' ? 'Transfer cancelled' : `Transfer to ${name}`;
  const payment = sendReview.layout.children?.find((node) => node.id === 'payment');
  if (!payment) throw new Error('Send review scene is missing its payment card');
  return { ...sendReview, layout: { ...payment, props: { ...payment.props,
    title, amount, recipient: funding ? 'Main balance' : name, mode: state.stage,
    presentation: funding ? 'overlay' : presentation,
    purpose: funding ? 'Fund your transfer' : state.stage === 'editing' ? state.draftPurpose : state.purpose,
    from: funding ? state.funding === 'swap' ? 'ETH balance' : 'Visa •• 4242'
      : state.consolidated ? 'Main USDT (after consolidation)' : 'Main USDT',
    fee: funding ? 'No fees' : '$0.08', balance: `$${dollars(state.balanceCents)}`, error: state.error,
    note: funding ? `Simulated funding. Confirming this does not send money to ${name}.`
      : state.consolidated ? '' : 'Simulated transfer.',
  } } };
}
