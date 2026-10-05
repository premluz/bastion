import { HistoryEntrySchema } from '../../contracts/props/history-item';
import type { PreviewAccount } from './accountTypes';

export const PREVIEW_ACCOUNTS: PreviewAccount[] = [
  { id: 'account-1', name: 'Account 1', initials: 'A1', kind: 'Multi-chain', notifications: true },
  { id: 'account-2', name: 'Long-term', initials: 'LT', kind: 'Watch-only', notifications: false },
];

// Explicitly simulated, fixed timestamps: no live prices, transactions, or credentials.
export const PREVIEW_HISTORY = HistoryEntrySchema.array().parse([
  { id: 'tx-01', accountId: 'account-1', occurredAt: '2026-09-12T15:42:00Z', kind: 'transfer',
    title: 'Sent', detail: 'To 0x7c0e…afd3', network: 'Ethereum', status: 'confirmed',
    assetId: 'eth', symbol: 'ETH', amount: 0.014, direction: 'out' },
  { id: 'tx-02', accountId: 'account-1', occurredAt: '2026-09-12T14:10:00Z', kind: 'interaction',
    title: 'App interaction', detail: 'Jupiter', network: 'Solana', status: 'confirmed' },
  { id: 'tx-03', accountId: 'account-1', occurredAt: '2026-09-12T13:35:00Z', kind: 'trade',
    title: 'Swapped', detail: 'USDC → SOL', network: 'Solana', status: 'confirmed',
    assetId: 'usdc', symbol: 'USDC', amount: 250, direction: 'out' },
  { id: 'tx-04', accountId: 'account-1', occurredAt: '2026-09-12T11:20:00Z', kind: 'transfer',
    title: 'Sent', detail: 'To 0x7c0e…afd3', network: 'Ethereum', status: 'pending',
    assetId: 'usdc', symbol: 'USDC', amount: 381.74678, direction: 'out' },
  { id: 'tx-05', accountId: 'account-1', occurredAt: '2026-09-12T09:05:00Z', kind: 'deposit',
    title: 'Received', detail: 'From 0x8d12…b920', network: 'Ethereum', status: 'confirmed',
    assetId: 'eth', symbol: 'ETH', amount: 0.25, direction: 'in' },
  { id: 'tx-06', accountId: 'account-1', occurredAt: '2026-09-11T18:30:00Z', kind: 'purchase',
    title: 'Bought', detail: 'Card purchase', network: 'Solana', status: 'confirmed',
    assetId: 'sol', symbol: 'SOL', amount: 2.5, direction: 'in' },
  { id: 'tx-07', accountId: 'account-1', occurredAt: '2026-09-11T16:12:00Z', kind: 'transfer',
    title: 'Send failed', detail: 'To 0x21ea…9f84', network: 'Ethereum', status: 'failed',
    assetId: 'usdc', symbol: 'USDC', amount: 50, direction: 'out' },
  { id: 'tx-08', accountId: 'account-1', occurredAt: '2026-09-11T10:15:00Z', kind: 'interaction',
    title: 'App interaction', detail: 'Uniswap', network: 'Ethereum', status: 'confirmed' },
  { id: 'tx-09', accountId: 'account-2', occurredAt: '2026-09-10T08:00:00Z', kind: 'deposit',
    title: 'Received', detail: 'From 0x10b3…a290', network: 'Ethereum', status: 'confirmed',
    assetId: 'usdt', symbol: 'USDT', amount: 1000, direction: 'in' },
]);
