import { describe, expect, it } from 'vitest';
import { AGENDA, handoverLine, nextAgendaItem, parseOfferAnswer } from './agentAgenda';
import { parseSendRequest } from './sendMoneyState';
import { parseTopUpRequest } from './mortgageTopUpState';

describe('agent agenda', () => {
  it('only lists actions that run a scenario, in list order, and each prompt starts its scenario', () => {
    expect(AGENDA.map((item) => item.id)).toEqual(['mortgage', 'payment-request']);
    expect(parseTopUpRequest(AGENDA[0]!.prompt)).not.toBeNull();
    expect(parseSendRequest(AGENDA[1]!.prompt)).not.toBeNull();
  });

  it('offers the first action not yet handled', () => {
    expect(nextAgendaItem(new Set())?.id).toBe('mortgage');
    expect(nextAgendaItem(new Set(['mortgage']))?.id).toBe('payment-request');
    expect(nextAgendaItem(new Set(['mortgage', 'payment-request']))).toBeNull();
  });

  it('phrases handovers as a list', () => {
    expect(handoverLine(AGENDA[0]!, false)).toBe('Next, your mortgage account is $190 short for today’s repayment. Shall we top it up?');
    expect(handoverLine(AGENDA[1]!, true)).toBe('First, Daniel asked you for $50 for coffee. Shall we send it?');
  });

  it('reads yes and no answers, and refuses mixed ones', () => {
    expect(parseOfferAnswer('yes please')).toBe('yes');
    expect(parseOfferAnswer('sure, go ahead')).toBe('yes');
    expect(parseOfferAnswer('not now, skip it')).toBe('no');
    expect(parseOfferAnswer('yes no')).toBeNull();
    expect(parseOfferAnswer('what time is it')).toBeNull();
  });
});
