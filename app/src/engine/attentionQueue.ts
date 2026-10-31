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
  /** Resolved in the assistant rather than the sheet (2026-10-31): the card expands into the chat and the scenario starts
   *  there. Items without one keep the sheet of choices. */
  scenario?: 'mortgage-top-up';
  /** The one thing to do about it, on the card's second line (2026-10-31, direct feedback). */
  action?: string;
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
  { id: 'mortgage', kind: 'due', eyebrow: 'Due today', title: 'Mortgage due today: $190 short', action: 'Top up →',
    detail: '$190 needed for today’s repayment.', question: 'How would you like to cover this?', task: 'Topping up mortgage account', scenario: 'mortgage-top-up',
    options: [{ value: 'money', label: 'Transfer from Money' }, { value: 'investments', label: 'Transfer from investments' },
      { value: 'external', label: 'Use external account' }] },
  { id: 'paul', kind: 'request', eyebrow: 'Payment request', title: 'Paul requested $50 for coffee.', detail: 'Sent today · via P2P',
    question: 'How would you like to respond?', task: 'Paying Paul $50',
    options: [{ value: 'money', label: 'Pay from Money' }, { value: 'usdt', label: 'Pay from USDT' }, { value: 'decline', label: 'Decline' }] },
];

// What the assistant noticed (2026-10-23, direct feedback): the attention home's Pulse,
// below the queue — observations, not tasks; each one opens a conversation about it.
// Each is a finding with its sum (2026-10-31, direct feedback, from the copy: all amounts placeholders) and the one thing
// to do about it, on a second line.
export const PULSE_ITEMS = [
  { id: 'portfolio-gain', text: 'Portfolio up $228 (4.2%) this week', action: 'See what moved' },
  { id: 'subscriptions', text: 'Subscriptions up $35 this month', action: 'Review 3 new charges' },
  { id: 'idle-cash', text: '$1,200 idle cash could earn ~$6/month', action: 'Move to Savings' },
] as const;

// The full view's choices are the app's own selectable question (approval-card), so they
// arrive through the renderer like every other node; the sheet owns the Confirm action. Its prompt
// is the sheet's description (2026-10-26, direct feedback: no nesting), so the card draws only the choices.
export function buildResolutionScene(item: AttentionItem, selected: string): HydratedScene {
  return { id: `attention-${item.id}`, title: item.title, intents: [], thinking: [], data: {},
    layout: { id: `attention-${item.id}-question`, type: 'approval-card', props: {
      questionId: `attention-${item.id}`, prompt: item.question, options: item.options, selected,
      navigationMode: 'hidden', allowSkip: false, chrome: 'bare' } } };
}
