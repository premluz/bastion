import { useCallback, useEffect, useRef, useState } from 'react';
import { ATTENTION_ITEMS, type AgentTask, type AttentionItem } from '../../engine/attentionQueue';
import { config } from '../../config';

/** The end of the queue: "You're caught up" holds, then sinks away, then the section is gone. */
export type CaughtUpPhase = 'none' | 'showing' | 'leaving' | 'gone';

export interface AttentionQueue {
  items: AttentionItem[];
  /** Items handed to the assistant and still being worked on: they stay in the queue until done. */
  processing: string[];
  /** The item whose full view is open, if any. */
  openItem: AttentionItem | null;
  tasks: AgentTask[];
  caughtUp: CaughtUpPhase;
  open: (id: string) => void;
  close: () => void;
  /** Hands the open item to the assistant with the chosen resolution; its card stays, processing, until done. */
  confirm: (choice: string) => void;
  /** The caught-up card's exit has played: the section closes for good. */
  finishCaughtUp: () => void;
  /** Resolved elsewhere (its scenario, in the assistant): the item leaves the queue. Idempotent. */
  resolve: (id: string) => void;
}

// The attention home's state (2026-10-23): resolving an item adds it to the assistant's work,
// which completes after a while and leaves (so the status line exists only while something is
// running). Its card stays in view meanwhile, processing, and leaves the queue only when the
// work is done (2026-10-27, direct feedback) — only then does the next card come forward. The
// last item done shows "You're caught up" for a moment before the section closes. Browsing the
// cards changes nothing here.
export function useAttentionQueue(): AttentionQueue {
  const [items, setItems] = useState(ATTENTION_ITEMS);
  const [processing, setProcessing] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [caughtUp, setCaughtUp] = useState<CaughtUpPhase>('none');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const later = (run: () => void, ms: number) => { timers.current.push(window.setTimeout(run, ms)); };
  const openItem = items.find((item) => item.id === openId) ?? null;
  const confirm = useCallback((choice: string) => {
    if (!openItem || !choice) return;
    const itemId = openItem.id;
    const taskId = `${itemId}-${choice}`;
    setProcessing((current) => [...current, itemId]);
    setTasks((current) => [{ id: taskId, label: openItem.task, status: 'working' }, ...current]);
    setOpenId(null);
    later(() => {
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setProcessing((current) => current.filter((id) => id !== itemId));
      setItems((current) => current.filter((item) => item.id !== itemId));
    }, config.attention.taskCompletesAfterMs);
  }, [openItem]);
  const isEmpty = items.length === 0;
  useEffect(() => {
    if (!isEmpty) return;
    setCaughtUp('showing');
    const timer = window.setTimeout(() => setCaughtUp('leaving'), config.attention.caughtUpHoldMs);
    return () => window.clearTimeout(timer);
  }, [isEmpty]);
  const open = useCallback((id: string) => { if (!processing.includes(id)) setOpenId(id); }, [processing]);
  return { items, processing, openItem, tasks, caughtUp, open, close: useCallback(() => setOpenId(null), []), confirm,
    finishCaughtUp: useCallback(() => setCaughtUp('gone'), []),
    resolve: useCallback((id: string) => setItems((current) => (current.some((item) => item.id === id) ? current.filter((item) => item.id !== id) : current)), []) };
}
