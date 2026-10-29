import { describe, expect, it } from 'vitest';
import { createChatCubeAssembly } from './useChatCubeAssembly';

describe('chat cube assembly clock', () => {
  it('rests assembled until an activity, then completes a replay', () => {
    const clock = createChatCubeAssembly(() => 2, false);
    clock.onFrame(1);
    expect(clock.progress()).toBe(1);
    clock.replay();
    expect(clock.progress()).toBe(0);
    clock.onFrame(1);
    expect(clock.progress()).toBe(0.5);
    clock.onFrame(1);
    expect(clock.progress()).toBe(1);
    clock.replay();
    expect(clock.progress()).toBe(0);
  });

  it('queues further activity without jumping the current cycle', () => {
    const clock = createChatCubeAssembly(() => 1, false);
    clock.replay();
    clock.onFrame(0.5);
    clock.replay();
    clock.replay();
    expect(clock.progress()).toBe(0.5);
    clock.onFrame(0.5);
    expect(clock.progress()).toBe(1);
    clock.onFrame(0.5);
    expect(clock.progress()).toBe(0.5);
    clock.onFrame(0.5);
    clock.onFrame(0.5);
    expect(clock.progress()).toBe(0.5);
    clock.onFrame(1);
    clock.onFrame(1);
    expect(clock.progress()).toBe(1);
  });

  it('keeps reduced-motion users assembled on every activity', () => {
    const clock = createChatCubeAssembly(() => 1, true);
    clock.replay();
    clock.onFrame(0.5);
    clock.replay();
    expect(clock.progress()).toBe(1);
  });

  it.each([0, -1, Number.NaN])('rejects invalid duration %s', (duration) => {
    expect(() => createChatCubeAssembly(() => duration, false).replay()).toThrow('positive duration');
  });
});
