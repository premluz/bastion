import { SendingScreenMount, isSendingScreenOpen } from './SendingScreenMount';
import { TouchIndicators } from './TouchIndicators';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { AccountExperience } from './AccountExperience';
import { TextInput } from '@astryxdesign/core/TextInput';
import { AssetsHomePage } from './AssetsHomePage';
import { AgentHomePage } from './AgentHomePage';
import { AgentDock } from './AgentDock';
import { useAgentHome } from './useAgentHome';
import { MoneyPage } from './MoneyPage';
import { CardDetailPage } from './CardDetailPage';
import { WALLET_CARDS } from './cardData';
import { ConversationModeOverlay } from './ConversationModeOverlay';
import { ComposerModeOverlay } from './ComposerModeOverlay';
import { MobileFrameComposer } from './MobileFrameComposer';
import { MobileFrameDock } from './MobileFrameDock';
import { useExploreNavigation } from './useExploreNavigation';
import { useMobileFrame, type MobileFrameProps } from './useMobileFrame';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import { useAutoScrollBottom } from './useAutoScrollBottom';
import { useTranscriptNodes } from './useTranscriptNodes';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useVoiceNarration } from './useVoiceNarration';
import { useScenarioThread } from './useScenarioThread';
import { useAgentAgenda } from './useAgentAgenda';
import { useAssistantSounds } from './useAssistantSounds';
import { PrototypeNoticeProvider } from './PrototypeNotice';
import styles from './MobileFrame.module.css';

// Bastion's mobile app shell — the counterpart to Merlin's Frame.tsx, and
// the single story entry point (Shell/MobileFrame) through which every page
// is reached by navigating the TabBar, exactly as Merlin's pages are reached
// inside Shell/Frame rather than as standalone page stories. Navigation state
// is local (useMobileFrame) until ScreenStack/pageStore lands in Phase 3.
export function MobileFrame(props: MobileFrameProps) {
  const state = useMobileFrame(props);
  const thread = useScenarioThread(state);
  const { send } = thread;
  // A final utterance answers whatever is waiting on the user, else it is a new request.
  const speech = useSpeechRecognition(state.mode === 'conversation', (text) => {
    const answer = thread.routeVoice(text);
    if (answer) answer();
    else state.submit(text, 'voice');
  }, async (text) => Boolean(thread.routeVoice(text)) || state.recognizesVoiceScenario(text));
  const voicePlayback = useVoiceNarration(state.mode === 'conversation', thread.narrationTargets, speech);
  const agent = useAgentHome(state, speech, voicePlayback);
  const isAgentHome = props.homeVariant === 'agent';
  useAgentAgenda(state, thread.isFinished, isAgentHome && agent.isAwake, agent.threadStart);
  const startConversationVoice = () => {
    state.openConversation();
    speech.start();
    voicePlayback.playWelcome();
  };
  const explore = useExploreNavigation();
  useAssistantSounds(state.mode, speech.isListening, speech.isSuspended);
  const sendPresentation = props.sendPresentation ?? 'inline';
  const sendingOpen = sendPresentation === 'overlay' && isSendingScreenOpen(send.flows);
  const transcript = useTranscriptNodes(state, thread, sendPresentation);
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
  // Agent home (2026-10-09): voice mode runs in place inside the shell, so
  // neither assistant overlay opens and the page stays live under the dock.
  const chromeInert = !isAgentHome && state.mode !== 'idle';
  const selectedCardData = state.selectedCard && WALLET_CARDS.find((candidate) => candidate.id === state.selectedCard!.id);
  // Pinned to the latest content (2026-09-14, direct feedback: a settled
  // question card rendered below the fold with no way to see it besides
  // scrolling manually). justify-content: flex-end only sets the initial
  // resting position — it never reacts to the container growing taller
  // once mounted, which is exactly when a card/message lands.
  const composerScrollRef = useAutoScrollBottom();
  const conversationScrollRef = useAutoScrollBottom();
  return (
    <PrototypeNoticeProvider>
    <div className={styles.stage}>
      <div className={styles.phone} data-testid="mobile-shell" data-mode={state.mode} data-home={props.homeVariant ?? 'assets'}>
        <AccountExperience initialView={props.initialAccountView ?? 'closed'}>{(openAccounts) => (
        <div className={styles.chrome} inert={chromeInert} aria-hidden={chromeInert}>
          <header className={styles.header} aria-label="Asset search">
            <Button label="Open account menu" variant="ghost" icon={<Avatar name="Preview user" size="medium" />} isIconOnly onClick={openAccounts} />
            {/* Agent home moves Explore into the dock's menu; the spacer keeps the avatar its own size. */}
            {isAgentHome ? <span aria-hidden="true" />
              : <TextInput label="Search assets" isLabelHidden startIcon="search" value="" placeholder="Search assets" isDisabled />}
          </header>
          {/* Independent overlay elements, not .header/.dock pseudo-elements
              (2026-09-14, direct feedback: header painted under its own
              shadow, and the bottom shadow sat at the dock's own edge
              instead of the page's true bottom) — see MobileFrame.module.css
              for the full reasoning. Sit in .chrome directly, between the
              page and the header/dock's own z-index. */}
          <div className={styles.topFade} aria-hidden="true" />
          {isHome ? (
            <main key="home" className={styles.page} aria-label="Home" tabIndex={0}>
              {isAgentHome ? <AgentHomePage onSelectMoney={state.openMoney} onSelectInvestments={state.openInvestments}
                onSuggestion={agent.ask} isReceding={agent.isWorking} />
                : <AssetsHomePage onSelectMoney={state.openMoney} onSelectInvestments={state.openInvestments} />}
            </main>
          ) : state.activeTab === 'assets' ? (
            <main key="assets" className={styles.page} aria-label="Wallet" tabIndex={0}>
              <MoneyPage tab={state.walletTab} onTabChange={state.setWalletTab} onCardOpen={state.openCard} />
            </main>
          ) : state.activeTab === 'markets' ? (
            <main key="markets" className={styles.page} aria-label="Explore" tabIndex={0} onClick={explore.onClick} data-scene-page>
              <SceneRenderer scene={explore.scene} />
            </main>
          ) : (
            <main className={styles.content} aria-label="Preview transcript" tabIndex={0}>{transcript}</main>
          )}
          <div className={styles.bottomFade} aria-hidden="true" />
          {isAgentHome ? <AgentDock isAwake={agent.isAwake} activeTab={state.activeTab} onWake={agent.wake} onSleep={agent.sleep}
            onNavigate={state.selectTab} thread={transcript.slice(agent.threadStart)} isWorking={agent.isWorking} caption={agent.caption}
            activity={agent.activity} speaking={voicePlayback.isSpeaking} threadRef={conversationScrollRef} orbRef={state.assistantRef} />
            : <MobileFrameDock state={state} variant={props.navigationVariant ?? 'pill'} />}
          {selectedCardData && <CardDetailPage card={selectedCardData} sourceRect={state.selectedCard!.sourceRect} onClose={state.closeCard} />}
          </div> )}</AccountExperience></div>
      <ComposerModeOverlay isOpen={state.mode === 'composer'} onClose={state.closeComposer} scrollRef={composerScrollRef} isReceded={sendingOpen}
        composer={<MobileFrameComposer state={state} onVoiceStart={startConversationVoice} voiceSupported={speech.supported} />}>
        {transcript}
      </ComposerModeOverlay>
      <ConversationModeOverlay isOpen={state.mode === 'conversation' && !isAgentHome} onClose={state.closeConversation} sharedOrb={props.navigationVariant === 'classic'}
        scrollRef={conversationScrollRef} isReceded={sendingOpen} speech={speech} audioError={voicePlayback.error}
        assistantSpeaking={voicePlayback.isSpeaking}>
        {transcript}
      </ConversationModeOverlay>
      {sendPresentation === 'overlay' && <SendingScreenMount flows={send.flows} dispatch={send.dispatch} />}
      <TouchIndicators />
    </div>
    </PrototypeNoticeProvider>
  );
}
