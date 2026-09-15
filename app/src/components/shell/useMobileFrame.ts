import { parseSendRequest, type SendRequest } from '../../engine/sendMoneyState';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatComposerInputHandle } from '@astryxdesign/core/Chat';
import type { TabDestination } from './TabBar';
import { parseBuyEthAmount } from '../../engine/buyEthScenes';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { playTrail } from '../../engine/trailPlayer';
import { useTrailStore } from '../../engine/stores/trailStore';
import type { HydratedScene } from '../../contracts/scene';
import type { ThinkingStep } from '../../contracts/thinking';

export type ShellPreviewMode = 'idle' | 'composer' | 'conversation';

export interface MobileFrameProps {
  navigationVariant?: 'pill' | 'classic';
  initialPurchaseQuery?: string;
  initialAccountView?: import('./accountTypes').AccountInitialView;
  initialMode?: ShellPreviewMode;
  initialMessages?: readonly string[];
}

export interface TranscriptMessage {
  id: number;
  text: string;
  // Settled trail (2026-09-13): only present once playTrail's own
  // onComplete has fired for this message — mirrors Transcript.tsx's own
  // settled-vs-live split (a past turn's frozen turn.trail/
  // trailElapsedMs vs. the one turn currently in flight, read live from
  // useTrailStore). Bastion has no sessionStore turn to freeze this onto,
  // so it lives on the message itself instead.
  trail?: ThinkingStep[];
  trailElapsedMs?: number;
  // Set once the trail completes (undefined while pending/no match) —
  // same manifest/keywordResolver ChatBar.tsx already uses on desktop,
  // resolved directly rather than through submitQuery/presentScene: those
  // orchestrate sessionStore/artifactStore, Merlin's desktop artifact-
  // stack overlay model that CLAUDE.md §3 says does not carry over to a
  // single-column mobile shell. playTrail/useTrailStore themselves carry
  // no such coupling (a plain zustand store, pure-props ThinkingTrail) —
  // reused as-is, same sequencing presentScene.ts already establishes:
  // trail plays first, scene attaches only once it completes.
  scene?: HydratedScene;
  // Set when the query parses as a buy-ETH request (2026-09-13, direct
  // feedback: "inline — for all scenarios entering into composer just
  // runs the scenario in that view, unless the conversation icon is
  // clicked"). Lives on the message so the buy flow renders inside the
  // transcript like any other scenario result, rather than through the
  // whole-shell takeover this replaces — that early return unmounted the
  // entire shell, which is why pressing Enter looked like a jump to
  // conversation mode: the nav and composer were not hidden, they were
  // gone.
  buyAmount?: number;
  sendRequest?: SendRequest;
}

// Storybook-local state, now with live scene resolution and a real
// thinking-trail playback — the resolver and trail player calls are real
// (same keywordResolver/manifest.json/trailPlayer ChatBar.tsx and
// presentScene.ts already use on desktop), but there is still no page
// store, session/artifact store, or microphone access; those remain out
// of scope until Phase 4/6 (CLAUDE.md).
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
  const submit = (text: string) => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    const id = nextId.current++;
    // buyAmount rides on the message so the buy flow renders inline in the
    // transcript, exactly like a resolver-matched scene does below. The
    // resolver still runs for these too — "buy eth" simply matches no
    // manifest intent today, so it stays a plain message plus this flow.
    const buyAmount = parseBuyEthAmount(trimmed);
    const sendRequest = parseSendRequest(trimmed);
    setMessages((current) => [...current, { id, text: trimmed, ...(sendRequest ? { sendRequest } : {}), ...(buyAmount !== null ? { buyAmount } : {}) }]);
    setValue('');
    if (sendRequest) return;
    // Fire-and-attach: the message is already in the transcript by the time
    // this settles, same "honest non-match" contract submitQuery.ts
    // documents — a null result just leaves the message plain text, no
    // trail and no scene attached, never a crash or a stuck loading state.
    void resolver.resolve(trimmed).then((resolved) => {
      if (!resolved) return;
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
  const selectTab = (tab: TabDestination) => { setActiveTab(tab); setMode('idle'); };
  const openConversation = () => { submit(value); setMode('conversation'); };
  const toggleComposer = () => setMode((current) => current === 'idle' ? 'composer' : 'idle');
  const closeComposer = () => { setMode('idle'); assistantRef.current?.focus(); };
  // Home's "Money" card jumps straight to the assets tab, preset to Money
  // (2026-09-15) — a real navigation, not just a tab preselect, since
  // Money currently only opens from Home or the nav's own Wallet icon.
  const openMoney = () => { setActiveTab('assets'); setWalletTab('money'); setMode('idle'); };
  return { mode, setMode, activeTab, value, setValue, messages, liveTrailMessageId, inputRef, submit,
    selectTab, openConversation, toggleComposer, assistantRef, closeComposer, conversationRef,
    walletTab, setWalletTab, openMoney };
}
