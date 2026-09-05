import { useEffect, useRef, type ReactNode } from 'react';
import { useSceneStore } from '../../engine/stores/sceneStore';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useTrailStore } from '../../engine/stores/trailStore';
import viewport from './ChatViewport.module.css';
import styles from './ScrollAnchor.module.css';

// Read by useScrollIntoViewOnGrow (below) to find its own scroll ancestor
// via closest() — a plain string, not the CSS module's own hashed class,
// so a consumer far down the tree (Transcript.tsx, several component
// layers below ScrollAnchor) can locate it without a prop/context thread
// purely for this one narrow purpose.
export const SCROLL_ANCHOR_ATTR = 'data-scroll-anchor';

// Astryx's ChatLayout was tried first (rule 5) — it's the real primitive
// for "composer fixed bottom, content auto-scrolls" — but its auto-scroll
// assumes a message-array model and didn't anchor correctly against our
// static, conditionally-empty children (verified via DOM inspection, not
// guessed: content was reproducibly rendered above the visible viewport,
// its own "scroll to bottom" affordance didn't correct it). ChatComposer
// (the actual input widget) works exactly as documented and is kept.
// The anchor-to-bottom behavior below is a plain, fully-understood flex +
// scrollTop effect — small enough to own outright rather than fight an
// opaque internal we can't verify further without Astryx's own source.
//
// Bug fixed: pinning short content to the bottom via `justify-content:
// flex-end` on the scrolling container is a known flexbox+overflow trap —
// once content overflows, the start of it becomes unreachable by
// scrolling (scrollHeight is correct, but the browser clamps scrollTop
// short of showing it). `margin-top: auto` on the content child achieves
// the same "pin short content to the bottom" result without that trap.
//
// Extracted from Frame.tsx (over the 200-line file budget) during the
// panel-layout restructure order — unchanged otherwise. Inline style
// props moved to ScrollAnchor.module.css (2026-08-22, CLAUDE.md rule 4 —
// "positioning and layout belong in stylesheets, not JSX" — a structural
// ban, not a token-purity check; this file's values were already all
// token references, which doesn't exempt it).
export function ScrollAnchor({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const activeScene = useSceneStore((state) => state.activeScene);
  // Scoped to the active thread's own turn count (Investigation threading
  // order) — the global count would also change when a background alert
  // adds a turn to an unrelated thread, triggering an unnecessary scroll
  // on a transcript that didn't actually change.
  const activeThreadTurnCount = useSessionStore(
    (state) => state.turns.filter((turn) => turn.threadId === state.activeThreadId).length,
  );
  const trailActiveIndex = useTrailStore((state) => state.activeIndex);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeScene, activeThreadTurnCount, trailActiveIndex]);

  return (
    <div ref={ref} className={styles.scroll} data-scroll-anchor="true">
      <div className={styles.inner}>
        <div className={viewport.viewport}>{children}</div>
      </div>
    </div>
  );
}

// Re-scrolls the nearest ScrollAnchor ancestor to the bottom once a
// specific element finishes growing — for content whose final size is
// reached asynchronously, after every one of ScrollAnchor's own state
// triggers (activeScene/turn-count/trailActiveIndex) has already fired.
// asset-card-grid is the first real case (2026-08-30 bug: "generated UI
// [cards] doesn't scroll itself, user needs to scroll themselves") — it's
// lazy-loaded (registry.ts, React.lazy + Suspense fallback={null}), so
// settleTurn writes turn.inlineScene synchronously but the chunk resolves
// and the cards actually mount well after that state commit; by the time
// they do, trailActiveIndex has already stopped changing and nothing else
// re-triggers a scroll. Deliberately scoped to ONE caller-provided
// element (Transcript.tsx passes a ref to the specific inline-scene
// wrapper), NOT the whole .inner container — an app-wide observer on
// .inner was tried first and found to race the trail's own staggered
// assembly (14 nodes each resizing .inner as they reveal), producing a
// visibly different captured frame in shell.spec.ts's own fixed-wait
// screenshots (3/5 themes, reproduced in isolation, not parallel-load
// contention). Guarded by "was already at the bottom before this
// resize" so it never fights a user who scrolled up to reread earlier
// content, mirroring the same assumption ScrollAnchor's own state-driven
// effect above already makes.
export function useScrollIntoViewOnGrow(growRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const growEl = growRef.current;
    const scrollEl = growEl?.closest(`[${SCROLL_ANCHOR_ATTR}]`) as HTMLElement | null;
    if (!growEl || !scrollEl) return;
    // First callback is this element's OWN arrival, always followed —
    // same "always scroll on new content" behavior every other trigger in
    // this file already has. Guarding it like every LATER resize would
    // capture whatever the container's scroll position already was before
    // this element existed (measured live: still mid-catch-up from the
    // trail's own preceding text-line growth, scrollTop genuinely behind
    // scrollHeight at the instant this component mounts) and then never
    // correct it, since nothing else re-triggers once wasAtBottom latches
    // false. Only resizes AFTER this element's own first paint respect a
    // user's own upward scroll.
    let isFirstCallback = true;
    let wasAtBottom = true;
    const observer = new ResizeObserver(() => {
      if (wasAtBottom) scrollEl.scrollTop = scrollEl.scrollHeight;
      wasAtBottom = isFirstCallback ? true : scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 4;
      isFirstCallback = false;
    });
    observer.observe(growEl);
    return () => observer.disconnect();
  }, [growRef]);
}
