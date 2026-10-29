import requestJson from '../../scenes/payment-request.scene.json';
import { HydratedSceneSchema, type SceneNode } from '../contracts/scene';
import type { PaymentCardProps } from '../contracts/props/payment-card';
import { PAYMENT_REQUEST_DEMO, type PaymentRequestState } from './paymentRequestState';

export const paymentRequestScene = HydratedSceneSchema.parse(requestJson);
export const paymentRequestStepDurations = paymentRequestScene.thinking.map((step) => step.durationMs);

function authored(id: string): SceneNode {
  const node = paymentRequestScene.layout.children?.find((child) => child.id === id);
  if (!node) throw new Error(`Payment-request scene is missing ${id}`);
  return node;
}

function findings(state: PaymentRequestState): SceneNode {
  const node = authored('request-findings');
  const done = state.stage !== 'checking';
  return { ...node, props: { ...node.props, steps: paymentRequestScene.thinking, activeIndex: done ? paymentRequestScene.thinking.length - 1 : state.step, isComplete: done } };
}

export function buildPaymentRequestScene(state: PaymentRequestState, presentation: PaymentCardProps['presentation']) {
  const children: SceneNode[] = [findings(state)];
  if (state.stage !== 'checking') {
    const payment = authored('request-payment');
    children.push(authored('request-message'), { ...payment, props: { ...payment.props, presentation, mode: state.stage } });
  }
  if (state.stage === 'sent') children.push(authored('request-outcome'));
  if (state.stage === 'cancelled') children.push({ id: 'request-cancelled', type: 'text-block', props: { text: 'Payment cancelled. Nothing was sent.' } });
  return { ...paymentRequestScene, layout: { ...paymentRequestScene.layout, children } };
}

// What the assistant says at each stage (spoken by browser speech synthesis until recorded clips exist).
export function paymentRequestNarration(state: PaymentRequestState): { key: string; text: string } | null {
  const { sender, company, invoice } = PAYMENT_REQUEST_DEMO;
  switch (state.stage) {
    case 'checking': return { key: 'checking', text: 'Let me look at Priya’s request.' };
    case 'review': return { key: 'review', text: `${sender} at ${company} is asking for $240 for invoice ${invoice}. It matches what you approved. Shall I pay it?` };
    case 'sending': return { key: 'sending', text: 'Paying it now.' };
    case 'sent': return { key: 'sent', text: 'Done. It’s on its way to Priya, and I’ve saved the receipt.' };
    case 'cancelled': return { key: 'cancelled', text: 'Okay, I haven’t paid it.' };
  }
}
