import { HistoryEntrySchema } from '../../contracts/props/history-item';

// Money screen's own activity feed (2026-09-14, direct feedback: "make up
// some previous payments data") — fiat mUSD account activity, distinct
// from PREVIEW_HISTORY's crypto/wallet-address rows: person-to-person
// sends carry an initials avatar, purchases carry a spending-category
// icon, and the Transak deposit is the account's own funding source.
// Explicitly simulated, fixed timestamps — no live balances or transfers.
export const MONEY_HISTORY = HistoryEntrySchema.array().parse([
  { id: 'money-01', accountId: 'money-main', occurredAt: '2026-09-14T09:12:00Z', kind: 'deposit',
    title: 'Deposited', detail: 'Transak', status: 'confirmed',
    avatar: { kind: 'category', category: 'other' }, displayAmount: '+1,000.00 mUSD' },
  { id: 'money-02', accountId: 'money-main', occurredAt: '2026-09-13T19:45:00Z', kind: 'transfer',
    title: 'To Bobby Mobbin', detail: 'Have fun', status: 'pending',
    avatar: { kind: 'initials', name: 'Bobby Mobbin' }, displayAmount: '−$2.00' },
  { id: 'money-03', accountId: 'money-main', occurredAt: '2026-09-13T13:58:00Z', kind: 'transfer',
    title: 'To Dane Twelly', detail: 'Have fun', status: 'pending',
    avatar: { kind: 'initials', name: 'Dane Twelly' }, displayAmount: '−$0.50' },
  { id: 'money-04', accountId: 'money-main', occurredAt: '2026-09-13T09:20:00Z', kind: 'purchase',
    title: 'Club Rainbow', detail: 'Singapore', status: 'confirmed',
    avatar: { kind: 'category', category: 'entertainment' }, displayAmount: '−$1.00' },
  { id: 'money-05', accountId: 'money-main', occurredAt: '2026-09-12T17:05:00Z', kind: 'purchase',
    title: 'NTUC FairPrice', detail: 'Groceries', status: 'confirmed',
    avatar: { kind: 'category', category: 'groceries' }, displayAmount: '−$46.20' },
  { id: 'money-06', accountId: 'money-main', occurredAt: '2026-09-12T08:30:00Z', kind: 'purchase',
    title: 'Singapore Airlines', detail: 'Travel', status: 'confirmed',
    avatar: { kind: 'category', category: 'travel' }, displayAmount: '−$312.40' },
  { id: 'money-07', accountId: 'money-main', occurredAt: '2026-09-11T14:15:00Z', kind: 'transfer',
    title: 'From Priya Nair', detail: 'Rent split', status: 'confirmed',
    avatar: { kind: 'initials', name: 'Priya Nair' }, direction: 'in', displayAmount: '+$425.00' },
  { id: 'money-08', accountId: 'money-main', occurredAt: '2026-09-10T20:00:00Z', kind: 'purchase',
    title: 'Zara', detail: 'Shopping', status: 'confirmed',
    avatar: { kind: 'category', category: 'shopping' }, displayAmount: '−$89.90' },
]);
