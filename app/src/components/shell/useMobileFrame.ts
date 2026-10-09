import { parseSendRequest, type SendRequest } from '../../engine/sendMoneyState';
import { parseTopUpRequest, type TopUpRequest } from '../../engine/mortgageTopUpState';
import type { AgendaItemId } from '../../engine/agentAgenda';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TranscriptMessage } from './transcriptMessage';
import type { ChatComposerInputHandle } from '@astryxdesign/core/Chat';
import type { TabDestination } from './TabBar';
import { parseBuyEthAmount } from '../../engine/buyEthScenes';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { playTrail } from '../../engine/trailPlayer';
import { useTrailStore } from '../../engine/stores/trailStore';
import type { HydratedScene } from '../../contracts/scene';
import { morphDock } from './dockMorph';
import type { ThinkingStep } from '../../contracts/thinking';

export type ShellPreviewMode = 'idle' | 'composer' | 'conversation';

export interface MobileFrameProps {
  navigationVariant?: 'pill' | 'classic';
  /** 'agent': assistant suggestions on Home and a persistent orb dock that wakes in place. */
  homeVariant?: 'assets' | 'agent';
  sendPresentation?: 'inline' | 'overlay';
  initialPurchaseQuery?: string;
  initialAccountView?: import('./accountTypes').AccountInitialView;
  initialMode?: ShellPreviewMode;
  initialMessages?: readonly string[];
}


const VOICE_UNAVAILABLE_REPLY = 'I can’t help with that yet. Try saying, “Send 50 dollars to Daniel for coffee.”';

// Storybook-local state, now with live scene resolution and a real
// thinking-trail playback — the resolver and trail player calls are real
// (same keywordResolver/manifest.json/trailPlayer ChatBar.tsx and
// presentScene.ts already use on desktop), but there is still no page
// store or session/artifact store; those remain out of scope until Phase 4/6
// (CLAUDE.md). Final voice utterances use the same submission path as typed input.
export type { TranscriptMessage } from './transcriptMessage';
export function useMobileFrame({ initialMode = 'idle', initialMessages = [], initialPurchaseQuery = '' }: MobileFrameProps) {
  const [mode, setMode] = useState<ShellPreviewMode>(initialMode);
  const [activeTab, setActiveTab] = useState<TabDestination>('home');
  // MoneyPage is its own page, not a sheet overlay (2026-09-14, direct
  // feedback: "treat it like a page not sheet"), reached two ways
  // (2026-09-15, direct feedback: "this is essentially Portfolio item in
  // the nav (Wallet)") — the "assets" tab destination directly, or Home's
  // "Money" BalanceCategoryCard, which also presets the Money/Crypto tab
  // to Money specifically. walletTab lives here rather than as local
  // state inside MoneyPage so Home's shortcut can drive it from outside.
  const [walletTab, setWalletTab] = useState<'money' | 'crypto'>('money');
  // Card Details screen (2026-09-16): lifted to the shell, not local state
  // inside MoneyPage, for the same reason walletTab is — CardDetailPage
  // needs to mount as its own full-screen overlay sibling of .chrome
  // (MobileFrame.tsx's own level), not nested inside MoneyPage's own
  // scrolling body. sourceRect is the front card's real on-screen rect at
  // the moment of tap (CardDeck's own onCardOpen), captured once per open
  // so CardDetailPage's shared-element transform has a real FROM position
  // to animate out of, without re-measuring a card that's about to be
  // covered by the very overlay animating over it.
  const [selectedCard, setSelectedCard] = useState<{ id: string; sourceRect: DOMRect } | null>(null);
  const openCard = (id: string, sourceRect: DOMRect) => setSelectedCard({ id, sourceRect });
  const closeCard = () => setSelectedCard(null);
  const [value, setValue] = useState('');
  // initialPurchaseQuery seeds a real transcript message rather than a
  // separate purchaseQuery state (2026-09-13): the buy flow now renders
  // inline like any other scenario, so a story asking to open on it is
  // just a story that starts with that message already submitted.
  const [messages, setMessages] = useState<TranscriptMessage[]>(() => {
    const seeded: TranscriptMessage[] = initialMessages.map((text, id) => {
      const sendRequest = parseSendRequest(text);
      return { id, text, ...(sendRequest ? { sendRequest } : {}) };
    });
    const buyAmount = initialPurchaseQuery ? parseBuyEthAmount(initialPurchaseQuery) : null;
    if (initialPurchaseQuery && buyAmount !== null) {
      seeded.push({ id: seeded.length, text: initialPurchaseQuery.trim(), buyAmount });
    }
    return seeded;
  });
  // Which message is currently playing its trail live (null = none) —
  // MobileFrame reads useTrailStore directly for this one message only,
  // the same "one turn in flight" model useTrailStore's own single-slot
  // shape already assumes (playTrail's generation counter supersedes
  // whatever's in flight on a second query, same as desktop).
  const [liveTrailMessageId, setLiveTrailMessageId] = useState<number | null>(null);
  // Seeded from the real message count, not initialMessages.length — the
  // buy-query seed above can push one more, and counting the array itself
  // keeps ids unique whether or not it did.
  const nextId = useRef(messages.length);
  const resolver = useMemo(() => createKeywordResolver(), []);
  const recognizesVoiceScenario = async (text: string) => parseSendRequest(text) !== null || parseTopUpRequest(text) !== null
    || parseBuyEthAmount(text) !== null || (await resolver.resolve(text)) !== null;
  const inputRef = useRef<ChatComposerInputHandle>(null);
  const assistantRef = useRef<HTMLButtonElement>(null);
  const conversationRef = useRef<HTMLButtonElement>(null);
  const previousMode = useRef<ShellPreviewMode>('idle');
  useEffect(() => {
    // Inert can clear focus before Dialog captures its opener; preserve it explicitly.
    if (mode === 'composer') {
      if (previousMode.current === 'conversation') conversationRef.current?.focus();
      else inputRef.current?.focus();
    }
    previousMode.current = mode;
  }, [mode]);
  // `intent`: what the turn asks for when it differs from what was said — a
  // "yes" to an agenda offer runs that offer's prompt.
  const submit = (text: string, source?: 'voice', intent = text) => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    const id = nextId.current++;
    // buyAmount rides on the message so the buy flow renders inline in the
    // transcript, exactly like a resolver-matched scene does below. The
    // resolver still runs for these too — "buy eth" simply matches no
    // manifest intent today, so it stays a plain message plus this flow.
    const buyAmount = parseBuyEthAmount(intent);
    const sendRequest = parseSendRequest(intent);
    const topUpRequest = sendRequest ? null : parseTopUpRequest(intent);
    setMessages((current) => [...current, { id, text: trimmed, ...(sendRequest ? { sendRequest } : {}), ...(topUpRequest ? { topUpRequest } : {}),
      ...(buyAmount !== null ? { buyAmount } : {}), ...(source ? { source } : {}) }]);
    setValue('');
    if (sendRequest || topUpRequest) return;
    // Fire-and-attach: the message is already in the transcript by the time
    // this settles, same "honest non-match" contract submitQuery.ts
    // documents — a null result just leaves the message plain text, no
    // trail and no scene attached, never a crash or a stuck loading state.
    void resolver.resolve(intent.trim()).then((resolved) => {
      if (!resolved) {
        if (source === 'voice' && buyAmount === null) setMessages((current) => current.map((message) =>
          message.id === id ? { ...message, voiceFeedback: VOICE_UNAVAILABLE_REPLY } : message));
        return;
      }
      setLiveTrailMessageId(id);
      playTrail(resolved.scene.thinking, () => {
        // playTrail's own finishNow() calls useTrailStore.getState().finish()
        // before invoking this callback, so elapsedMs is already the real
        // settled duration here — same read presentScene.ts does at this
        // exact point, not a fresh Date.now() timestamp.
        const trailElapsedMs = useTrailStore.getState().elapsedMs;
        setLiveTrailMessageId((current) => (current === id ? null : current));
        setMessages((current) => current.map((message) => (message.id === id
          ? { ...message, scene: resolved.scene, trail: resolved.scene.thinking, trailElapsedMs }
          : message)));
      });
    });
  };
  const say = (text: string, agendaOffer?: AgendaItemId) => {
    const id = nextId.current++;
    setMessages((current) => [...current, { id, text, role: 'assistant', ...(agendaOffer ? { agendaOffer } : {}) }]);
  };
  const decline = (text: string, declinedOffer: AgendaItemId) => {
    const id = nextId.current++;
    setMessages((current) => [...current, { id, text: text.trim(), source: 'voice', declinedOffer }]);
  };
  const selectTab = (tab: TabDestination) => { setActiveTab(tab); setMode('idle'); };
  const openConversation = () => morphDock(() => { submit(value); setMode('conversation'); }, ['to-orb']);
  const closeConversation = () => morphDock(() => setMode('composer'), ['from-orb']);
  const toggleComposer = () => morphDock(() => setMode((current) => current === 'idle' ? 'composer' : 'idle'));
  const closeComposer = () => { morphDock(() => setMode('idle')); assistantRef.current?.focus(); };
  // Home's "Money" card jumps straight to the assets tab, preset to Money
  // (2026-09-15) — a real navigation, not just a tab preselect, since
  // Money currently only opens from Home or the nav's own Wallet icon.
  const openMoney = () => { setActiveTab('assets'); setWalletTab('money'); setMode('idle'); };
  const openInvestments = () => { setActiveTab('assets'); setWalletTab('crypto'); setMode('idle'); };
  return { mode, setMode, activeTab, value, setValue, messages, liveTrailMessageId, inputRef, submit, recognizesVoiceScenario,
    say, decline, selectTab, openConversation, closeConversation, toggleComposer, assistantRef, closeComposer, conversationRef,
    walletTab, setWalletTab, openMoney, openInvestments, selectedCard, openCard, closeCard };
}
