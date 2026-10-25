import type { HydratedScene } from '../contracts/scene';

export type AttentionKind = 'due' | 'request' | 'review';

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  eyebrow: string;
  title: string;
  detail: string;
  /** The resolution question the full view asks, and its choices (label only). */
  question: string;
  options: { value: string; label: string }[];
  /** What the assistant reports while it carries out the chosen resolution. */
  task: string;
}

export type AgentTaskStatus = 'working' | 'needs-input';

export interface AgentTask {
  id: string;
  label: string;
  status: AgentTaskStatus;
}

// The attention home's queue (2026-10-23, direct feedback with a mock): what needs the
// user, most pressing first. Simulated, like every balance in this prototype.
export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: 'mortgage', kind: 'due', eyebrow: 'Due today', title: 'Your mortgage account is short for today’s repayment.',
    detail: '$240 needed for today’s repayment.', question: 'How would you like to cover this?', task: 'Topping up mortgage account',
    options: [{ value: 'money', label: 'Transfer from Money' }, { value: 'investments', label: 'Transfer from investments' },
      { value: 'external', label: 'Use external account' }] },
  { id: 'paul', kind: 'request', eyebrow: 'Payment request', title: 'Paul requested $50 for coffee.', detail: 'Sent today · via P2P',
    question: 'How would you like to respond?', task: 'Paying Paul $50',
    options: [{ value: 'money', label: 'Pay from Money' }, { value: 'usdt', label: 'Pay from USDT' }, { value: 'decline', label: 'Decline' }] },
];

// What the assistant noticed (2026-10-23, direct feedback): the attention home's Pulse,
// below the queue — observations, not tasks; each one opens a conversation about it.
export const PULSE_ITEMS = [
  { id: 'portfolio-gain', text: 'Your portfolio gained 4.2% this week.' },
  { id: 'subscriptions', text: 'Your spending on subscriptions increased this month.' },
  { id: 'idle-cash', text: 'You could earn more from your idle cash.' },
] as const;

// The full view's choices are the app's own selectable question (approval-card), so they
// arrive through the renderer like every other node; the sheet owns the Confirm action.
export function buildResolutionScene(item: AttentionItem, selected: string): HydratedScene {
  return { id: `attention-${item.id}`, title: item.title, intents: [], thinking: [], data: {},
    layout: { id: `attention-${item.id}-question`, type: 'approval-card', props: {
      questionId: `attention-${item.id}`, prompt: item.question, options: item.options, selected,
      navigationMode: 'hidden', allowSkip: false } } };
}
