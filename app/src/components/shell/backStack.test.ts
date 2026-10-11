import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBackStack } from './backStack';

function setup() {
  let popListener: () => void = () => undefined;
  const deferred: (() => void)[] = [];
  const env = {
    pushState: vi.fn(), back: vi.fn(),
    onPopState: (listener: () => void) => { popListener = listener; return () => undefined; },
    defer: (task: () => void) => { deferred.push(task); },
  };
  return { env, stack: createBackStack(env), pop: () => popListener(), flush: () => { while (deferred.length) deferred.shift()?.(); } };
}

describe('backStack', () => {
  let t: ReturnType<typeof setup>;
  beforeEach(() => { t = setup(); });

  it('keeps a single history entry however many layers are open', () => {
    t.stack.push(() => undefined);
    t.stack.push(() => undefined);
    expect(t.env.pushState).toHaveBeenCalledTimes(1);
  });

  it('a back closes only the top layer and puts the entry back while layers remain', () => {
    const lower = vi.fn(); const upper = vi.fn();
    t.stack.push(lower); t.stack.push(upper);
    t.pop();
    expect(upper).toHaveBeenCalledOnce();
    expect(lower).not.toHaveBeenCalled();
    expect(t.env.pushState).toHaveBeenCalledTimes(2);
    t.pop();
    expect(lower).toHaveBeenCalledOnce();
    expect(t.env.pushState).toHaveBeenCalledTimes(2);   // nothing left to arm for
  });

  it('a layer that only steps back within itself stays and re-arms', () => {
    const sheet = vi.fn(() => true);
    t.stack.push(sheet);
    t.pop();
    expect(t.env.pushState).toHaveBeenCalledTimes(2);
    t.pop();
    expect(sheet).toHaveBeenCalledTimes(2);
  });

  it('closing the last layer in-app releases the entry once, and that pop is not a user back', () => {
    const handler = vi.fn();
    const id = t.stack.push(handler);
    t.stack.remove(id);
    expect(t.env.back).not.toHaveBeenCalled();
    t.flush();
    expect(t.env.back).toHaveBeenCalledOnce();
    t.pop();                                           // the pop our own back() caused
    expect(handler).not.toHaveBeenCalled();
  });

  it('a layer swapped within one tick (or remounted by React) costs no history at all', () => {
    const id = t.stack.push(() => undefined);
    t.stack.remove(id);
    t.stack.push(() => undefined);
    t.flush();
    expect(t.env.pushState).toHaveBeenCalledOnce();
    expect(t.env.back).not.toHaveBeenCalled();
  });

  it('a layer already closed by a back leaves nothing to release', () => {
    const id = t.stack.push(() => undefined);
    t.pop();
    t.stack.remove(id);
    t.flush();
    expect(t.env.back).not.toHaveBeenCalled();
  });

  it('ignores a back with no layers open (a stray forward/back at the root)', () => {
    expect(() => t.pop()).not.toThrow();
    expect(t.env.pushState).not.toHaveBeenCalled();
  });
});
