import { useEffect, useRef, useState } from 'react';
import type { ChatComposerInputHandle } from '@astryxdesign/core/Chat';
import type { TabDestination } from './TabBar';

export type ShellPreviewMode = 'idle' | 'composer' | 'conversation';

export interface MobileShellPreviewProps {
  initialMode?: ShellPreviewMode;
  initialMessages?: readonly string[];
}

// Storybook-local state only. No page store, scene resolver, or microphone access.
export function useMobileShellPreview({ initialMode = 'idle', initialMessages = [] }: MobileShellPreviewProps) {
  const [mode, setMode] = useState<ShellPreviewMode>(initialMode);
  const [activeTab, setActiveTab] = useState<TabDestination>('home');
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState(() => initialMessages.map((text, id) => ({ id, text })));
  const nextId = useRef(initialMessages.length);
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
    const message = { id: nextId.current++, text: text.trim() };
    setMessages((current) => [...current, message]);
    setValue('');
  };
  const selectTab = (tab: TabDestination) => { setActiveTab(tab); setMode('idle'); };
  const openConversation = () => { submit(value); setMode('conversation'); };
  const toggleComposer = () => setMode((current) => current === 'idle' ? 'composer' : 'idle');
  const closeComposer = () => { setMode('idle'); assistantRef.current?.focus(); };
  return { mode, setMode, activeTab, value, setValue, messages, inputRef, submit,
    selectTab, openConversation, toggleComposer, assistantRef, closeComposer, conversationRef };
}
