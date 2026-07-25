import { useEffect, useRef, type ReactNode } from 'react';
import { useSceneStore } from '../../engine/stores/sceneStore';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useTrailStore } from '../../engine/stores/trailStore';
import viewport from './ChatViewport.module.css';

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
// panel-layout restructure order — unchanged otherwise.
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
    <div
      ref={ref}
      style={{
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'grid', gap: 'var(--space-24)', padding: 'var(--space-24)', marginTop: 'auto' }}>
        <div className={viewport.viewport}>{children}</div>
      </div>
    </div>
  );
}
