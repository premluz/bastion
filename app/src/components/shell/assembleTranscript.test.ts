import { describe, expect, it } from 'vitest';
import { assembleTranscript } from './assembleTranscript';

const interim = (transcript: string) => ({ transcript, isFinal: false });
const final = (transcript: string) => ({ transcript, isFinal: true });

describe('assembleTranscript', () => {
  it('Android: every revised hypothesis arrives as its own non-final entry', () => {
    expect(assembleTranscript([
      interim('send'), interim('send $50%'), interim('send $50'), interim('send %50'), interim('send %50 to'), interim('send $50 to daniel'),
    ])).toBe('send $50 to daniel');
  });

  it('Android: cumulative restatements marked final collapse to the longest', () => {
    expect(assembleTranscript([
      final('send'), final('send $50'), final('send $50 to'), final('send $50 to daniel'),
    ])).toBe('send $50 to daniel');
  });

  it('desktop: finalized sentences are kept and the live interim is appended', () => {
    expect(assembleTranscript([final('send fifty dollars to daniel'), interim('for coffee')]))
      .toBe('send fifty dollars to daniel for coffee');
  });

  it('desktop: distinct finals are not merged', () => {
    expect(assembleTranscript([final('yes'), final('send it now')])).toBe('yes send it now');
  });

  it('handles an empty result list and blank entries', () => {
    expect(assembleTranscript([])).toBe('');
    expect(assembleTranscript([interim('  '), interim('hello')])).toBe('hello');
  });
});
