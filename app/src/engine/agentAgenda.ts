// The agent home's recommended actions (2026-10-09, direct feedback: the user
// enters voice mode and goes over them with the agent, one after another).
// Authored prompts, not derived data. An item with `prompt` runs a scenario;
// the rest are said as written and get the assistant's honest "not yet".
export const AGENT_SUGGESTIONS = [
  { id: 'mortgage', text: 'Top up the mortgage account, it’s short for today’s repayment.', prompt: 'Top up the mortgage account',
    handover: 'your mortgage account is $190 short for today’s repayment. Shall we top it up?' },
  { id: 'positions', text: 'Review stale positions — the market has rebounded.' },
  { id: 'payment-request', text: 'Review Daniel’s $50 payment request.', prompt: 'Send $50 to Daniel for coffee',
    handover: 'Daniel asked you for $50 for coffee. Shall we send it?' },
  { id: 'portfolio', text: 'View portfolio details — it’s up this week.' },
] as const;

export type AgendaItem = Extract<(typeof AGENT_SUGGESTIONS)[number], { prompt: string }>;
export type AgendaItemId = AgendaItem['id'];
const isAgendaItem = (item: (typeof AGENT_SUGGESTIONS)[number]): item is AgendaItem => 'prompt' in item;
export const AGENDA: readonly AgendaItem[] = AGENT_SUGGESTIONS.filter(isAgendaItem);
export const ALL_DONE_LINE = 'That’s everything on your list for now, Prem.';

/** The first recommended action not yet run or declined, in list order. */
export function nextAgendaItem(handled: ReadonlySet<string>): AgendaItem | null {
  return AGENDA.find((item) => !handled.has(item.id)) ?? null;
}

/** Handovers read as a list: "First, …" then "Next, …". `handover` is written to follow the comma. */
export function handoverLine(item: AgendaItem, isFirst: boolean) {
  return `${isFirst ? 'First' : 'Next'}, ${item.handover}`;
}

export type OfferAnswer = 'yes' | 'no';
export function parseOfferAnswer(text: string): OfferAnswer | null {
  const no = /\b(no|nope|skip|later|not now|next one|don’t|don't)\b/i.test(text);
  const yes = /\b(yes|yeah|yep|sure|ok(?:ay)?|go ahead|do it|let’s|let's|please)\b/i.test(text);
  if (no === yes) return null;
  return yes ? 'yes' : 'no';
}
