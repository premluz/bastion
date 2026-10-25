import { useCallback, useEffect, useRef, useState } from 'react';
import { ATTENTION_ITEMS, type AgentTask, type AttentionItem } from '../../engine/attentionQueue';
import { config } from '../../config';

/** The end of the queue: "You're caught up" holds, then sinks away, then the section is gone. */
export type CaughtUpPhase = 'none' | 'showing' | 'leaving' | 'gone';

export interface AttentionQueue {
  items: AttentionItem[];
  /** The item whose full view is open, if any. */
  openItem: AttentionItem | null;
  tasks: AgentTask[];
  caughtUp: CaughtUpPhase;
  open: (id: string) => void;
  close: () => void;
  /** Hands the open item to the assistant with the chosen resolution; the next card comes forward. */
  confirm: (choice: string) => void;
  /** The caught-up card's exit has played: the section closes for good. */
  finishCaughtUp: () => void;
}

// The attention home's state (2026-10-23): resolving an item removes it from the queue and
// adds it to the assistant's work, which completes after a while and leaves (so the status
// line exists only while something is running). Resolving the last item shows "You're caught
// up" for a moment before the section closes. Browsing the cards changes nothing here.
export function useAttentionQueue(): AttentionQueue {
  const [items, setItems] = useState(ATTENTION_ITEMS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [caughtUp, setCaughtUp] = useState<CaughtUpPhase>('none');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const later = (run: () => void, ms: number) => { timers.current.push(window.setTimeout(run, ms)); };
  const openItem = items.find((item) => item.id === openId) ?? null;
  const confirm = useCallback((choice: string) => {
    if (!openItem || !choice) return;
    const taskId = `${openItem.id}-${choice}`;
    const remaining = items.filter((item) => item.id !== openItem.id);
    setItems(remaining);
    setTasks((current) => [{ id: taskId, label: openItem.task, status: 'working' }, ...current]);
    setOpenId(null);
    later(() => setTasks((current) => current.filter((task) => task.id !== taskId)), config.attention.taskCompletesAfterMs);
    if (remaining.length === 0) {
      setCaughtUp('showing');
      later(() => setCaughtUp('leaving'), config.attention.caughtUpHoldMs);
    }
  }, [openItem, items]);
  return { items, openItem, tasks, caughtUp, open: setOpenId, close: useCallback(() => setOpenId(null), []), confirm,
    finishCaughtUp: useCallback(() => setCaughtUp('gone'), []) };
}
