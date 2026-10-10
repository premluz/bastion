import { describe, expect, it } from 'vitest';
import { createSendState } from './sendMoneyState';
import { parseSendVoiceChoice } from './sendMoneyVoiceChoice';

const recipient = { ...createSendState({ amountCents: 5000, purpose: 'Coffee' }, 0, 850), stage: 'options' as const };
const funding = { ...recipient, questionIndex: 1 };

describe('send voice choices', () => {
  it('selects either contact from distinct natural replies', () => {
    expect(parseSendVoiceChoice('I mean Daniel Smith', recipient)).toEqual({ type: 'recipient', value: 'daniel-smith', advance: true });
    expect(parseSendVoiceChoice('The Jones from coffee club', recipient)).toEqual({ type: 'recipient', value: 'daniel-jones', advance: true });
    expect(parseSendVoiceChoice('Smith or Jones?', recipient)).toBeNull();
    expect(parseSendVoiceChoice('Smithsonian', recipient)).toBeNull();
  });
  it('selects each funding route but rejects ambiguous phrases', () => {
    expect(parseSendVoiceChoice('Consolidate my balances', funding)).toEqual({ type: 'choose', funding: 'consolidate', advance: true });
    expect(parseSendVoiceChoice('Please swap the ETH', funding)).toEqual({ type: 'choose', funding: 'swap', advance: true });
    expect(parseSendVoiceChoice('Buy using my card', funding)).toEqual({ type: 'choose', funding: 'card', advance: true });
    expect(parseSendVoiceChoice('Should I swap or buy?', funding)).toBeNull();
    expect(parseSendVoiceChoice('Buyout', funding)).toBeNull();
    expect(parseSendVoiceChoice('Smith', funding)).toBeNull();
  });
  it('does not select after the questions finish', () => {
    expect(parseSendVoiceChoice('Smith', { ...recipient, stage: 'review' })).toBeNull();
  });
  it('confirms or cancels the review card by voice, like the mortgage top-up', () => {
    const review = { ...recipient, stage: 'review' as const };
    for (const said of ['Yes', 'Confirm', 'Confirmed.', 'accept it', 'Accepted', 'yeah go ahead'])
      expect(parseSendVoiceChoice(said, review)).toEqual({ type: 'accept', deferSending: true });
    expect(parseSendVoiceChoice('No, cancel', review)).toEqual({ type: 'cancel' });
    expect(parseSendVoiceChoice('yes, no', review)).toBeNull();
    expect(parseSendVoiceChoice('yes', { ...recipient, stage: 'editing' })).toBeNull();
  });
});
