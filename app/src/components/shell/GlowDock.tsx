import { useEffect, useLayoutEffect, type ReactNode, type Ref } from 'react';
import { GlowLight } from './GlowLight';
import { MobileFrameDock } from './MobileFrameDock';
import type { useMobileFrame } from './useMobileFrame';
import { useSwipeUp } from './useSwipeUp';
import '../../theme/agent-dock.css';
import '../../theme/glow-dock.css';
import styles from './GlowDock.module.css';

export interface GlowDockProps {
  state: ReturnType<typeof useMobileFrame>;
  /** Opens the composer in place (records where its thread starts). */
  onOpen: () => void;
  onClose: () => void;
  /** The composer bar shown in place of the pill while open. */
  composer: ReactNode;
  /** The conversation since the composer opened; shown once there is one. */
  thread: ReactNode;
  isWorking: boolean;
  threadRef?: Ref<HTMLDivElement>;
}

// The glow home's dock (2026-10-10, direct feedback with mocks): the navigation
// pill (four items) and a separate +, over a flat, low glow at the bottom edge.
// Swiping up — or the pill's assistant item — morphs the pill into the composer
// in place: the page stays as it is until the first question, then gives way to
// the thread (AgentHomePage recedes) while the composer stays at the bottom.
export function GlowDock({ state, onOpen, onClose, composer, thread, isWorking, threadRef }: GlowDockProps) {
  const isOpen = state.mode === 'composer';
  const swipe = useSwipeUp<HTMLDivElement>(() => {
    if (state.mode === 'idle') onOpen();
    else swipe.reset();
  }, () => false);
  // Inside the morph's update (flushSync), so the morph's old frame keeps the swipe's state.
  useLayoutEffect(() => { if (isOpen) swipe.reset(); }, [isOpen, swipe.reset]);
  // The pill's own assistant item opens through the same path as the swipe.
  const dockState = { ...state, toggleComposer: onOpen };
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
  return <>
    {/* Box-less (display: contents): pointer events from the pill still bubble here,
        and the glow's custom properties still inherit, but the pill dock's own scrim
        keeps sizing itself to the whole screen. */}
    <div ref={swipe.ref} className={styles.swipe} data-composer-open={isOpen} {...(isOpen ? {} : swipe.handlers)}>
      {isOpen && <div className={styles.shade} aria-hidden="true" />}
      <GlowLight isOpen={isOpen} />
      <MobileFrameDock state={dockState} variant="pill" />
    </div>
    {isOpen && !isWorking && <button type="button" className={styles.dismiss} aria-label="Close assistant" onClick={onClose} />}
    {isOpen && <div className={styles.sheet}>
      {isWorking && <div ref={threadRef} className={styles.thread} role="log" aria-label="Assistant transcript" tabIndex={0}>{thread}</div>}
      <div className={styles.composer}>{composer}</div>
    </div>}
  </>;
}
