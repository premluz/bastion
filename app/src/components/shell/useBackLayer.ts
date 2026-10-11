import { useEffect, useRef } from 'react';
import { createBackStack, type BackHandler } from './backStack';

// One stack for the whole page, wired to the browser's own history. Created on
// first use so importing this file costs nothing where there is no window.
let stack: ReturnType<typeof createBackStack> | null = null;
function getStack() {
  stack ??= createBackStack({
    pushState: () => window.history.pushState({ bastionBack: true }, ''),
    back: () => window.history.back(),
    onPopState: (listener) => {
      window.addEventListener('popstate', listener);
      return () => window.removeEventListener('popstate', listener);
    },
    defer: (task) => { setTimeout(task, 0); },
  });
  return stack;
}

// While `isActive`, this screen is a layer the system back gesture closes:
// `onBack` is called when the user swipes back (return true if it only stepped
// back within itself and is still open). Closing it any other way is fine —
// the history entry follows.
export function useBackLayer(isActive: boolean, onBack: BackHandler) {
  const handler = useRef(onBack);
  handler.current = onBack;
  useEffect(() => {
    if (!isActive) return;
    const backStack = getStack();
    const id = backStack.push(() => handler.current());
    return () => backStack.remove(id);
  }, [isActive]);
}
