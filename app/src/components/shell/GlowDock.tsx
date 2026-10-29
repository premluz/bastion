import { useEffect, useLayoutEffect, type ReactNode, type Ref } from 'react';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { notifyPrototypeUnavailable } from './PrototypeNotice';
import { GlowLight, type GlowOrbStyle } from './GlowLight';
import { config } from '../../config';
import { AssistantLanding } from './AssistantLanding';
import { MobileFrameDock } from './MobileFrameDock';
import { MonolithNavigation } from './MonolithNavigation';
import { DockCube } from './DockCube';
import { useChatCubeAssembly } from './useChatCubeAssembly';
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
  /** The composer bar shown in place of the pill while open: a single line. */
  composer: ReactNode;
  /** Its voice buttons, in the row below it, on the right (back and chat history take the left). */
  composerActions: ReactNode;
  /** The conversation since the composer opened; shown once there is one. */
  thread: ReactNode;
  isWorking: boolean;
  threadRef?: Ref<HTMLDivElement>;
  /** A suggestion on the landing screen: shown as `text`, run as `prompt`. */
  onSuggestion: (text: string, prompt: string) => void;
  /** The light's look: the free plasma, or the plasma held in a glass circle. */
  orb?: GlowOrbStyle;
  /** The navigation's + slot, taken by something else (the attention home's orb and status). */
  trailing?: ReactNode;
  /** The agent's status line, floating above the trailing slot (the attention home's work queue). */
  status?: ReactNode;
  /** The Bastion monolith stands in for the plasma orb: it sits in the middle of the chat's bottom row. */
  landingMonolith?: boolean;
  /** Attention work can illuminate the resting monolith before chat opens. */
  monolithWorking?: boolean;
}

// The glow home's dock (2026-10-10, direct feedback with mocks): the navigation
// pill (four items) and a separate +, over a flat, low glow at the bottom edge.
// Swiping up — or the pill's assistant item — morphs the pill into the composer
// in place (and sliding the composer back down closes it again): the page stays as it is until the first question, then gives way to
// the thread (AgentHomePage recedes) while the composer stays at the bottom.
export function GlowDock({ state, onOpen, onClose, composer, composerActions, thread, isWorking, threadRef, onSuggestion, orb = 'plasma', trailing, status, landingMonolith = false, monolithWorking = false }: GlowDockProps) {
  const isOpen = state.mode === 'composer';
  const assembly = useChatCubeAssembly(state.messages.length, landingMonolith && config.agent.cubeAssembly);
  const swipe = useSwipeUp<HTMLDivElement>(() => {
    if (state.mode === 'idle') onOpen();
    else swipe.reset();
  }, () => false);
  // Inside the morph's update (flushSync), so the morph's old frame keeps the swipe's state.
  useLayoutEffect(() => { if (isOpen) swipe.reset(); }, [isOpen, swipe.reset]);
  // Sliding the composer down closes it: the reverse of sliding up (2026-10-12, direct
  // feedback). Its progress (`--glow-close`) lives on the root wrapper so the composer
  // and the glow both follow it; the close commits at the same distance the open does.
  const closeSwipe = useSwipeUp<HTMLDivElement>(onClose, () => false, { direction: 'down', property: '--glow-close' });
  useLayoutEffect(() => { if (!isOpen) closeSwipe.reset(); }, [isOpen, closeSwipe.reset]);
  // The pill's own assistant item opens through the same path as the swipe.
  const dockState = { ...state, toggleComposer: onOpen };
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
  return <div ref={closeSwipe.ref} className={styles.root}>
    {/* Box-less (display: contents): pointer events from the pill still bubble here,
        and the glow's custom properties still inherit, but the pill dock's own scrim
        keeps sizing itself to the whole screen. */}
    <div ref={swipe.ref} className={styles.swipe} data-composer-open={isOpen} data-assistant-mode={state.mode} data-orb-rise={config.landing.orbRises ? '' : undefined}
      data-monolith={landingMonolith ? '' : undefined} data-landing={config.landing.orbRises && isOpen && !isWorking ? '' : undefined} {...(isOpen ? {} : swipe.handlers)}>
      {isOpen && <div className={styles.shade} aria-hidden="true" />}
      <GlowLight isOpen={isOpen} orb={orb} />
      <AssistantLanding isOpen={isOpen} isAway={isWorking} onSuggestion={onSuggestion} />
      {/* Beside the dock, not inside it (2026-10-23): hanging out of the dock's box, its glass
          could not blur the page behind it. */}
      {status && !isOpen && <div className={styles.status}>{status}</div>}
      {landingMonolith
        ? <MonolithNavigation activeTab={state.activeTab} onNavigate={state.selectTab} onOpen={onOpen}
          isComposerOpen={isOpen} working={monolithWorking || isWorking} />
        : <MobileFrameDock state={dockState} variant="pill" destinationSet="glow" {...(trailing ? { trailing } : {})} />}
    </div>
    {isOpen && !isWorking && <button type="button" className={styles.dismiss} aria-label="Close assistant" onClick={onClose} />}
    {isOpen && <div className={styles.sheet}>
      {isWorking && <div ref={threadRef} className={styles.thread} role="log" aria-label="Assistant transcript" tabIndex={0} onClickCapture={assembly.onAction}>{thread}</div>}
      <div className={styles.composer} {...closeSwipe.handlers}>
        {composer}
        {/* Below the bar (2026-10-27, direct feedback): back and chat history on the left, the voice buttons on the right,
            and (2026-10-28) the cube in the middle, where the voice controls hold it too. */}
        <div className={styles.actions}>
          {landingMonolith && <span className={styles.cube} data-chat-cube="" aria-hidden="true" />}
          <div className={styles.nav}>
            <IconButton label="Back" tooltip="Back" icon={<Icon icon={ArrowLeftIcon} />} variant="ghost" onClick={onClose} data-dock-item="back" />
            <IconButton label="Chat history" icon={<Icon icon={ClockIcon} />} variant="ghost" onClick={notifyPrototypeUnavailable} data-dock-item="history" />
          </div>
          <div className={styles.voice}>{composerActions}</div>
        </div>
      </div>
    </div>}
    {landingMonolith && <DockCube mode={state.mode} working={isWorking} assembly={assembly} />}
  </div>;
}
