import { useSendMoneyFlows } from '../../engine/useSendMoneyFlows';
import { SendMoneyTranscript } from './SendMoneyTranscript';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { AccountExperience } from './AccountExperience';
import { BuyEthTranscriptView } from './BuyEthTranscript';
import { useBuyEthFlow } from '../../engine/useBuyEthFlow';
import { ChatMessage, ChatMessageBubble } from '@astryxdesign/core/Chat';
import { TextInput } from '@astryxdesign/core/TextInput';
import { AssetsHomePage } from './AssetsHomePage';
import { MoneyPage } from './MoneyPage';
import { CardDetailPage } from './CardDetailPage';
import { WALLET_CARDS } from './cardData';
import { ConversationModeOverlay } from './ConversationModeOverlay';
import { MobileFrameDock } from './MobileFrameDock';
import { useExploreNavigation } from './useExploreNavigation';
import { useMobileFrame, type MobileFrameProps } from './useMobileFrame';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import { ThinkingTrail } from '../trail/ThinkingTrail';
import { useTrailStore } from '../../engine/stores/trailStore';
import { useAutoScrollBottom } from './useAutoScrollBottom';
import styles from './MobileFrame.module.css';

// Bastion's mobile app shell — the counterpart to Merlin's Frame.tsx, and
// the single story entry point (Shell/MobileFrame) through which every page
// is reached by navigating the TabBar, exactly as Merlin's pages are reached
// inside Shell/Frame rather than as standalone page stories. Navigation state
// is local (useMobileFrame) until ScreenStack/pageStore lands in Phase 3.
export function MobileFrame(props: MobileFrameProps) {
  const state = useMobileFrame(props);
  const explore = useExploreNavigation();
  const send = useSendMoneyFlows(state.messages);
  // Live trail state (2026-09-13) — subscribed via the hook, not
  // getState(), so this component re-renders as playTrail advances
  // activeIndex/elapsedMs. Read unconditionally (cheap, a handful of
  // primitives) and applied only to the one message useMobileFrame marks
  // as liveTrailMessageId — the same "one turn in flight" model
  // useTrailStore's own single-slot shape assumes on desktop.
  const liveSteps = useTrailStore((trail) => trail.steps);
  const liveActiveIndex = useTrailStore((trail) => trail.activeIndex);
  const liveIsComplete = useTrailStore((trail) => trail.isComplete);
  const liveElapsedMs = useTrailStore((trail) => trail.elapsedMs);
  const liveSkip = useTrailStore((trail) => trail.skip);
  // One flow for the whole shell, not one per rendered transcript
  // (2026-09-13): the same transcript array mounts in both the composer
  // surface and the conversation overlay, so a flow owned inside the
  // transcript ran twice, with two independent timer sets. Hooks cannot
  // run per-item inside the map below, so this keys off the most recent
  // buy message — the only one whose flow is actually in play.
  const latestBuyAmount = [...state.messages].reverse().find((message) => message.buyAmount != null)?.buyAmount ?? 0;
  const buyFlow = useBuyEthFlow(latestBuyAmount);
  // Resolved scenes render right after their own message and its thinking
  // trail (2026-09-13) — same shape BuyEthTranscript.tsx already
  // established for the buy-flow's own hand-built scenes (<ChatMessage>
  // for the query, content beneath it for the result), and the same
  // trail-before-scene sequencing presentScene.ts already establishes on
  // desktop: the trail plays first, the scene attaches once it settles.
  // A message with neither a live trail nor a settled one (still
  // resolving, or the resolver found no match) renders as plain text.
  const transcript = state.messages.map(({ id, text, scene, trail, trailElapsedMs, buyAmount }) => {
    const isLive = state.liveTrailMessageId === id;
    return (
      <div key={id}>
        <ChatMessage sender="user"><ChatMessageBubble>{text}</ChatMessageBubble></ChatMessage>
        {isLive && (
          <ThinkingTrail steps={liveSteps} activeIndex={liveActiveIndex} isComplete={liveIsComplete}
            elapsedMs={liveElapsedMs} skip={liveSkip} />
        )}
        {!isLive && trail && (
          <ThinkingTrail steps={trail} activeIndex={trail.length - 1} isComplete elapsedMs={trailElapsedMs ?? 0} skip={null} />
        )}
        {scene && <SceneRenderer scene={scene} />}
        {send.flows[id] && <SendMoneyTranscript state={send.flows[id]} dispatch={(action) => send.dispatch(id, action)} />}
        {/* Buy flow renders inline, as one more result under its own
            message (2026-09-13, direct feedback: "inline — for all
            scenarios entering into composer just runs the scenario in
            that view, unless the conversation icon is clicked"). This
            replaces a whole-shell early return that unmounted the entire
            frame, which is why Enter looked like it jumped to
            conversation mode: the nav and composer were not hidden, the
            shell itself was gone. hideQuery suppresses BuyEthTranscript's
            own user bubble — the loop above already drew one for this
            same message. */}
        {buyAmount != null && <BuyEthTranscriptView query={text} amount={buyAmount} hideQuery flow={buyFlow} />}
      </div>
    );
  });
  // Home tab (2026-09-12, revised 2026-09-13): renders AssetsHomePage below
  // the SAME shared avatar/search header every other tab uses, rather than
  // a second copy of it — direct feedback clarified the fixed region is
  // just avatar+search, with "All mainnets"/balance/action row scrolling
  // away with the rest of the content, same as any other tab's body. The
  // prior version had AssetsHomePage bring its own duplicate identity row
  // pinned above ITS OWN copy of the balance/actions, which fixed the
  // wrong boundary. .header's own ::after fade (below) already does
  // exactly the soft-scroll-under effect asked for — reused here, not
  // rebuilt a second time inside AssetsHomePage.
  //
  // Depends on the tab alone, never the mode: gating this on mode too
  // unmounted the page the instant the assistant opened, so the recede
  // had nothing left to animate and the content vanished outright
  // instead of scaling and blurring back.
  const isHome = state.activeTab === 'home';
  const selectedCardData = state.selectedCard && WALLET_CARDS.find((candidate) => candidate.id === state.selectedCard!.id);
  // Pinned to the latest content (2026-09-14, direct feedback: a settled
  // question card rendered below the fold with no way to see it besides
  // scrolling manually). justify-content: flex-end only sets the initial
  // resting position — it never reacts to the container growing taller
  // once mounted, which is exactly when a card/message lands.
  const composerScrollRef = useAutoScrollBottom();
  const conversationScrollRef = useAutoScrollBottom();
  return (
    <div className={styles.stage}>
      <div className={styles.phone} data-testid="mobile-shell" data-mode={state.mode}>
        <AccountExperience initialView={props.initialAccountView ?? 'closed'}>{(openAccounts) => (
        <div className={styles.chrome} inert={state.mode === 'conversation'} aria-hidden={state.mode === 'conversation'}>
          <header className={styles.header} aria-label="Asset search">
            <Button label="Open account menu" variant="ghost" onClick={openAccounts}><Avatar name="Preview user" size="small" /></Button>
            <TextInput label="Search assets" isLabelHidden startIcon="search" value="" placeholder="Search assets" isDisabled />
          </header>
          {/* Independent overlay elements, not .header/.dock pseudo-elements
              (2026-09-14, direct feedback: header painted under its own
              shadow, and the bottom shadow sat at the dock's own edge
              instead of the page's true bottom) — see MobileFrame.module.css
              for the full reasoning. Sit in .chrome directly, between the
              page and the header/dock's own z-index. */}
          <div className={styles.topFade} aria-hidden="true" />
          {isHome ? (
            <main className={styles.page} aria-label="Home" tabIndex={0}>
              <AssetsHomePage onSelectMoney={state.openMoney} />
            </main>
          ) : state.activeTab === 'assets' ? (
            <main className={styles.page} aria-label="Wallet" tabIndex={0}>
              <MoneyPage tab={state.walletTab} onTabChange={state.setWalletTab} onCardOpen={state.openCard} />
            </main>
          ) : state.activeTab === 'markets' ? (
            <main className={styles.page} aria-label="Explore" tabIndex={0} onClick={explore.onClick}>
              <SceneRenderer scene={explore.scene} />
            </main>
          ) : (
            <main className={styles.content} aria-label="Preview transcript" tabIndex={0}>{transcript}</main>
          )}
          {/* Composer-mode transcript (2026-09-13): the same messages the
              conversation overlay renders, shown over the fully receded
              page so typing in the composer has somewhere to land — until
              now a submitted message only appeared after entering voice
              mode. Its own foreground layer, not .content: that element IS
              one of the receded background layers, so putting the
              transcript there would blur and fade the very thing this is
              meant to surface. */}
          <div ref={composerScrollRef} className={styles.composerTranscript} role="log" aria-label="Assistant transcript"
            inert={state.mode !== 'composer'} aria-hidden={state.mode !== 'composer'}>
            {transcript}
          </div>
          <div className={styles.bottomFade} aria-hidden="true" />
          <MobileFrameDock state={state} variant={props.navigationVariant ?? 'pill'} />
          {selectedCardData && <CardDetailPage card={selectedCardData} sourceRect={state.selectedCard!.sourceRect} onClose={state.closeCard} />}
          </div> )}</AccountExperience></div>
      <ConversationModeOverlay isOpen={state.mode === 'conversation'} onClose={() => state.setMode('composer')} onCloseAll={state.closeComposer}
        sharedOrb={props.navigationVariant === 'classic'} scrollRef={conversationScrollRef}>
        {transcript}
      </ConversationModeOverlay>
    </div>
  );
}
