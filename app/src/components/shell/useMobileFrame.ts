import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatComposerInputHandle } from '@astryxdesign/core/Chat';
import type { TabDestination } from './TabBar';
import { parseBuyEthAmount } from '../../engine/buyEthScenes';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import type { HydratedScene } from '../../contracts/scene';

export type ShellPreviewMode = 'idle' | 'composer' | 'conversation';

export interface MobileFrameProps {
  initialPurchaseQuery?: string;
  initialAccountView?: import('./accountTypes').AccountInitialView;
  initialMode?: ShellPreviewMode;
  initialMessages?: readonly string[];
}

export interface TranscriptMessage {
  id: number;
  text: string;
  // Set once the keyword resolver settles (undefined while pending/no
  // match) — same manifest/keywordResolver ChatBar.tsx already uses on
  // desktop, called directly rather than through submitQuery/presentScene:
  // those orchestrate sessionStore/artifactStore, Merlin's desktop
  // artifact-stack overlay model that CLAUDE.md §3 says does not carry
  // over to a single-column mobile shell. Resolving directly and
  // rendering SceneRenderer inline (MobileFrame.tsx, same shape
  // BuyEthTranscript.tsx already established for the buy-flow's own
  // hand-built scenes) is the mobile-appropriate equivalent.
  scene?: HydratedScene;
}

// Storybook-local state, now with live scene resolution — the resolver
// call is real (same keywordResolver/manifest.json ChatBar.tsx uses), but
// there is still no page store, session/artifact store, or microphone
// access; those remain out of scope until Phase 4/6 (CLAUDE.md).
export function useMobileFrame({ initialMode = 'idle', initialMessages = [], initialPurchaseQuery = '' }: MobileFrameProps) {
  const [purchaseQuery, setPurchaseQuery] = useState(initialPurchaseQuery);
  const [mode, setMode] = useState<ShellPreviewMode>(initialMode);
  const [activeTab, setActiveTab] = useState<TabDestination>('home');
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<TranscriptMessage[]>(() => initialMessages.map((text, id) => ({ id, text })));
  const nextId = useRef(initialMessages.length);
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
    if (parseBuyEthAmount(text) !== null) setPurchaseQuery(text.trim());
    const trimmed = text.trim();
    const id = nextId.current++;
    setMessages((current) => [...current, { id, text: trimmed }]);
    setValue('');
    // Fire-and-attach: the message is already in the transcript by the time
    // this settles, same "honest non-match" contract submitQuery.ts
    // documents — a null result just leaves the message plain text, no
    // scene attached, never a crash or a stuck loading state.
    void resolver.resolve(trimmed).then((resolved) => {
      if (!resolved) return;
      setMessages((current) => current.map((message) => (message.id === id ? { ...message, scene: resolved.scene } : message)));
    });
  };
  const selectTab = (tab: TabDestination) => { setActiveTab(tab); setMode('idle'); };
  const openConversation = () => { submit(value); setMode('conversation'); };
  const toggleComposer = () => setMode((current) => current === 'idle' ? 'composer' : 'idle');
  const closeComposer = () => { setMode('idle'); assistantRef.current?.focus(); };
  return { mode, setMode, activeTab, value, setValue, messages, inputRef, submit, purchaseQuery, setPurchaseQuery,
    selectTab, openConversation, toggleComposer, assistantRef, closeComposer, conversationRef };
}
