import { describe, expect, it } from 'vitest';
import { PaymentCardPropsSchema } from '../contracts/props/payment-card';
import { buildTopUpScene } from './mortgageTopUpScenes';
import { applyTopUpAction, createTopUpState, type TopUpSource } from './mortgageTopUpState';

function confirmation(source: TopUpSource) {
  const review = applyTopUpAction(createTopUpState(0, 0, true), { type: 'source', value: source, advance: true }, 0);
  const node = buildTopUpScene(review, 'inline', true).layout.children?.find((child) => child.id === 'top-up-payment');
  return PaymentCardPropsSchema.parse(node?.props);
}

describe('mortgage top-up confirmation', () => {
  it('is a move between two of the user’s own accounts: icons, the amount, no captions, rows or network fee', () => {
    const props = confirmation('money');
    expect(props.from).toEqual({ name: 'Money', icon: 'wallet' });
    expect(props.to).toEqual({ name: 'Mortgage', icon: 'house' });
    expect(props.amount).toBe('190.00');
    expect(props.details).toEqual([]);
  });
  it('from USDC, the conversion line carries the fee', () => {
    const props = confirmation('usdc');
    expect(props.from).toEqual({ name: 'USDC', icon: 'coin' });
    expect(props.details).toEqual([{ label: 'Conversion', value: '190 USDC → $190.00 · no fee' }]);
  });
});
