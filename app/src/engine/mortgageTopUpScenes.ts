import topUpJson from '../../scenes/mortgage-top-up.scene.json';
import { HydratedSceneSchema, type SceneNode } from '../contracts/scene';
import type { PaymentCardProps } from '../contracts/props/payment-card';
import { TOP_UP_DEMO, type TopUpState } from './mortgageTopUpState';

export const topUpScene = HydratedSceneSchema.parse(topUpJson);
export const topUpStepDurations = topUpScene.thinking.map((step) => step.durationMs);

function authored(id: string): SceneNode {
  const node = topUpScene.layout.children?.find((child) => child.id === id);
  if (!node) throw new Error(`Top-up scene is missing ${id}`);
  return node;
}

const dollars = (cents: number) => (cents / 100).toFixed(2);
const usd = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function findings(state: TopUpState): SceneNode {
  const node = authored('top-up-findings');
  const done = state.stage !== 'checking';
  return { ...node, props: { ...node.props, steps: topUpScene.thinking, activeIndex: done ? topUpScene.thinking.length - 1 : state.step, isComplete: done } };
}

function payment(state: TopUpState, presentation: PaymentCardProps['presentation']): SceneNode {
  const node = authored('top-up-payment');
  const source = TOP_UP_DEMO.sources[state.source ?? 'money'];
  return { ...node, props: { ...node.props, presentation, mode: state.stage, error: state.error,
    amount: state.stage === 'editing' ? state.draftAmount : dollars(state.amountCents),
    purpose: state.stage === 'editing' ? state.draftPurpose : state.purpose,
    from: source.label, balance: usd(source.balanceCents) } };
}

export function buildTopUpScene(state: TopUpState, presentation: PaymentCardProps['presentation'], voice: boolean) {
  const children: SceneNode[] = [findings(state)];
  if (state.stage !== 'checking') {
    children.push(authored('top-up-message'));
    const question = authored('top-up-source');
    children.push({ ...question, props: { ...question.props, selected: state.source ?? '', isDisabled: state.stage !== 'options',
      navigationMode: voice ? 'hidden' : 'continue-only' } });
    if (state.stage === 'options' && state.error) children.push({ id: 'top-up-error', type: 'text-block', props: { text: state.error } });
  }
  if (state.stage !== 'checking' && state.stage !== 'options') children.push(authored('top-up-acknowledgement'), payment(state, presentation));
  if (state.stage === 'sent') children.push(authored('top-up-outcome'));
  if (state.stage === 'cancelled') children.push({ id: 'top-up-cancelled', type: 'text-block', props: { text: 'Top-up cancelled. Nothing was moved.' } });
  return { ...topUpScene, layout: { ...topUpScene.layout, children } };
}

// What the assistant says at each stage (spoken by browser speech synthesis
// until recorded clips exist).
export function topUpNarration(state: TopUpState): { key: string; text: string } | null {
  const amount = `$${(state.amountCents / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const source = TOP_UP_DEMO.sources[state.source ?? 'money'].label;
  switch (state.stage) {
    case 'checking': return { key: 'checking', text: 'Let me check your mortgage account.' };
    case 'options': return { key: 'options', text: 'It’s $190 short for today’s $1,240 repayment. Should I take it from your Money balance, or from USDC?' };
    case 'review': return { key: `review-${state.amountCents}-${state.source ?? ''}`, text: `Here’s the top-up: ${amount} from your ${source} into your mortgage account. Shall I go ahead?` };
    case 'editing': return null;
    case 'sending': return { key: 'sending', text: 'Topping it up now.' };
    case 'sent': return { key: 'sent', text: 'Done. Your mortgage account now covers today’s repayment.' };
    case 'cancelled': return { key: 'cancelled', text: 'Okay, I’ve left your mortgage account as it is.' };
  }
}
