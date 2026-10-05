import type { SceneNode } from '../contracts/scene';
import { sendOptions, sendReview, sendSteps, buildSendOptions, buildPaymentScene } from './sendMoneyScenes';
import type { SendState, SendInteractionMode } from './sendMoneyState';
import type { PaymentCardProps } from '../contracts/props/payment-card';
import { recipientName } from './sendMoneyQuestions';

function authored(scene: typeof sendOptions, id: string): SceneNode {
  const node = scene.layout.children?.find((child) => child.id === id);
  if (!node) throw new Error(`Send scene ${scene.id} is missing ${id}`);
  return node;
}
function findings(state: SendState, phase: 'checking' | 'moving'): SceneNode {
  const scene = phase === 'checking' ? sendOptions : sendReview;
  const node = authored(scene, phase === 'checking' ? 'check-findings' : 'transfer-findings');
  const steps = sendSteps(state, phase);
  const complete = state.stage !== phase;
  return { ...node, props: { ...node.props, steps, activeIndex: complete ? steps.length - 1 : state.step, isComplete: complete } };
}
export function buildSendQuestionScene(state: SendState, interactionMode: SendInteractionMode) {
  const children = [findings(state, 'checking')];
  if (state.stage === 'options') {
    const text = 'Understood, checking your contacts and available balances.\n\nI found two Daniels: Daniel Smith or Daniel Jones.';
    children.push({ ...authored(sendOptions, 'send-message'), props: { text } }, buildSendOptions(state, interactionMode));
    if (state.error) children.push({ id: 'question-error', type: 'text-block', props: { text: state.error } });
  }
  return { ...sendOptions, layout: { ...sendOptions.layout, children } };
}
export function buildSendTransferScene(state: SendState, presentation: PaymentCardProps['presentation']) {
  const children = [authored(sendReview, 'send-acknowledgement')];
  if (state.preparationStarted) children.push(findings(state, 'moving'));
  if (state.stage !== 'moving') children.push(buildPaymentScene(state, presentation).layout);
  if (state.stage === 'cancelled') {
    const text = state.consolidated ? 'Transfer cancelled. Consolidated funds remain in Main.' : `Transfer cancelled. No money sent to ${recipientName(state)}.`;
    children.push({ id: 'send-outcome', type: 'text-block', props: { text } });
  }
  return { ...sendReview, layout: { ...sendReview.layout, children } };
}
