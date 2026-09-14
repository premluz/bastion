import { useEffect, useRef } from 'react';

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
export function useAutoScrollBottom() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scrollToBottom = () => el.scrollTo({ top: el.scrollHeight });
    scrollToBottom();
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return ref;
}
