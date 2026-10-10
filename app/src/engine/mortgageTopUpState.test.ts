import { describe, expect, it } from 'vitest';
import { applyTopUpAction, createTopUpState, parseTopUpRequest, parseTopUpVoice, shortfallCents, tickTopUp, TOP_UP_DEMO } from './mortgageTopUpState';

const steps = [850, 850, 850];
const atOptions = () => {
  let state = createTopUpState(0, steps[0]!);
  for (let now = 850; state.stage === 'checking'; now += 850) state = tickTopUp(state, now, steps);
  return state;
};

describe('mortgage top-up', () => {
  it('recognises top-up requests about the mortgage only', () => {
    expect(parseTopUpRequest('Top up the mortgage account, it’s short for today’s repayment.')).toEqual({ kind: 'mortgage-top-up' });
    expect(parseTopUpRequest('cover my mortgage')).not.toBeNull();
    expect(parseTopUpRequest('top up my card')).toBeNull();
    expect(parseTopUpRequest('what is a mortgage')).toBeNull();
    // what speech engines actually write
    expect(parseTopUpRequest('top of the mortgage account')).not.toBeNull();
    expect(parseTopUpRequest('Topup mortgage')).not.toBeNull();
    expect(parseTopUpRequest('add money to my mortgage')).not.toBeNull();
  });

  it('walks the checking trail step by step, then asks for a source', () => {
    let state = createTopUpState(0, 850);
    expect(tickTopUp(state, 849, steps)).toBe(state);
    state = tickTopUp(state, 850, steps);
    expect(state).toMatchObject({ stage: 'checking', step: 1, dueAt: 1700 });
    expect(atOptions()).toMatchObject({ stage: 'options', amountCents: shortfallCents });
  });

  it('needs a source before review; a spoken source advances straight to it', () => {
    expect(applyTopUpAction(atOptions(), { type: 'continue' }, 0).error).toMatch(/Choose/);
    const voice = parseTopUpVoice('from my money balance please', atOptions());
    expect(voice).toEqual({ type: 'source', value: 'money', advance: true });
    expect(applyTopUpAction(atOptions(), voice!, 0)).toMatchObject({ stage: 'review', source: 'money' });
    expect(parseTopUpVoice('money or usdc', atOptions())).toBeNull();
  });

  it('accepts, sends for the demo duration and lands', () => {
    const review = applyTopUpAction(atOptions(), { type: 'source', value: 'usdc', advance: true }, 0);
    expect(parseTopUpVoice('yes go ahead', review)).toEqual({ type: 'accept' });
    expect(parseTopUpVoice('no, cancel that', review)).toEqual({ type: 'cancel' });
    const sending = applyTopUpAction(review, { type: 'accept' }, 1000);
    expect(sending).toMatchObject({ stage: 'sending', dueAt: 1000 + TOP_UP_DEMO.sendingMs });
    expect(tickTopUp(sending, 1000 + TOP_UP_DEMO.sendingMs, steps).stage).toBe('sent');
  });

  it('edits the amount within what the source holds', () => {
    const editing = applyTopUpAction(applyTopUpAction(atOptions(), { type: 'source', value: 'usdc', advance: true }, 0), { type: 'edit' }, 0);
    const tooMuch = applyTopUpAction(editing, { type: 'change', field: 'amount', value: '2000' }, 0);
    expect(tooMuch.error).toMatch(/USDC/);
    expect(applyTopUpAction(tooMuch, { type: 'save' }, 0).stage).toBe('editing');
    const fine = applyTopUpAction(editing, { type: 'change', field: 'amount', value: '200' }, 0);
    expect(applyTopUpAction(fine, { type: 'save' }, 0)).toMatchObject({ stage: 'review', amountCents: 20000 });
  });

  it('ignores everything once finished', () => {
    const cancelled = applyTopUpAction(atOptions(), { type: 'cancel' }, 0);
    expect(applyTopUpAction(cancelled, { type: 'source', value: 'money' }, 0)).toBe(cancelled);
  });
});
