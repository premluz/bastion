import { useState } from 'react';
import type { HistoryEntry } from '../../contracts/props/history-item';
import { ACCOUNT_METHODS, type AccountInitialView, type AccountMethod, type AccountScreen, type PreviewAccount } from './accountTypes';
import { PREVIEW_ACCOUNTS } from './accountPreviewData';

export function useAccountPreview(initial: AccountInitialView) {
  const [menuOpen, setMenuOpen] = useState(initial !== 'closed');
  const [sheetOpen, setSheetOpen] = useState(initial !== 'closed' && initial !== 'menu');
  const [screen, setScreen] = useState<AccountScreen>(initial === 'closed' || initial === 'menu' ? 'accounts' : initial);
  const [accounts, setAccounts] = useState<PreviewAccount[]>(() => PREVIEW_ACCOUNTS.map((item) => ({ ...item })));
  const [selected, select] = useState('account-1');
  const [method, setMethod] = useState<AccountMethod>('create');
  const [entry, setEntry] = useState<HistoryEntry>();
  const account = accounts.find((item) => item.id === selected) ?? accounts[0]!;
  const navigate = (next: AccountScreen) => { setScreen(next); setSheetOpen(true); };
  const update = (patch: Partial<PreviewAccount>) => setAccounts((items) => items.map((item) => item.id === selected ? { ...item, ...patch } : item));
  const create = (name: string) => {
    const id = `account-${accounts.length + 1}`;
    setAccounts((items) => [...items, { id, name, initials: name.slice(0, 2).toUpperCase(), kind: ACCOUNT_METHODS[method].kind, notifications: true }]);
    select(id); navigate('accounts');
  };
  const back = () => {
    if (screen === 'edit' || screen === 'add') navigate('accounts');
    else if (screen === 'setup') navigate('add');
    else if (screen === 'addresses') navigate('edit');
    else if (screen === 'transaction') navigate('history');
    else setSheetOpen(false);
  };
  return { menuOpen, setMenuOpen, sheetOpen, setSheetOpen, screen, accounts, account, select, method, setMethod,
    entry, setEntry, navigate, update, create, back };
}
