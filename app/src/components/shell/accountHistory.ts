import type { HistoryEntry } from '../../contracts/props/history-item';

export const HISTORY_FILTERS = ['all', 'deposit', 'trade', 'transfer', 'purchase'] as const;
export type HistoryFilter = (typeof HISTORY_FILTERS)[number];
export const HISTORY_FILTER_LABELS: Record<HistoryFilter, string> = {
  all: 'All', deposit: 'Deposits', trade: 'Trades', transfer: 'Transfers', purchase: 'Purchases',
};

export function isHistoryFilter(value: string): value is HistoryFilter {
  return HISTORY_FILTERS.some((filter) => filter === value);
}

export function groupAccountHistory(entries: readonly HistoryEntry[], filter: HistoryFilter) {
  const groups = new Map<string, HistoryEntry[]>();
  const sorted = [...entries].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  for (const entry of sorted) {
    if (filter !== 'all' && entry.kind !== filter) continue;
    const day = entry.occurredAt.slice(0, 10);
    const group = groups.get(day) ?? [];
    group.push(entry);
    groups.set(day, group);
  }
  return [...groups].map(([day, items]) => ({ day, items, label: new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${day}T12:00:00Z`)) }));
}

export function formatHistoryAmount(entry: HistoryEntry) {
  if (entry.amount === undefined || !entry.symbol) return '';
  const sign = entry.direction === 'out' ? '−' : '+';
  return `${sign}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(entry.amount)} ${entry.symbol}`;
}
