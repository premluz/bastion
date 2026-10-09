import { useCallback, useRef } from 'react';

// Keeps a scrollable transcript pinned to its latest content (2026-09-14,
// direct feedback: a settled scene/question card rendered below the fold
// with no auto-scroll, so the user had to find it manually instead of it
// "always being fully scrolled so the user sees latest content revealed").
// justify-content: flex-end only fixes the *initial* resting position —
// it never reacts to the container growing taller once mounted, which is
// exactly when a new message/card arrives.
//
// Watches the container's own children (its content, not its box —
// .composerTranscript is position:absolute/inset:0, so its own border-box
// never resizes; only what's inside it grows) via MutationObserver,
// scrolling on every childList/subtree change rather than trying to time
// one measurement against `dep` (2026-09-14, live-reproduced: scrollHeight
// read even one rAF after `dep` changed still equalled clientHeight — the
// new content's layout was not yet committed at that point; MutationObserver
// instead fires once the DOM mutation it is reacting to has already
// landed, so scrollHeight is always current by the time it runs).
//
// A callback ref, not a mount-time effect (2026-10-09): the agent home's
// thread mounts only once there is a command, long after this hook first ran,
// so an effect reading ref.current on mount never saw it. The observer now
// attaches whenever an element arrives and detaches when it leaves.
export function useAutoScrollBottom() {
  const observer = useRef<MutationObserver | null>(null);
  return useCallback((element: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!element) return;
    const scrollToBottom = () => element.scrollTo({ top: element.scrollHeight });
    scrollToBottom();
    observer.current = new MutationObserver(scrollToBottom);
    observer.current.observe(element, { childList: true, subtree: true, characterData: true });
  }, []);
}
