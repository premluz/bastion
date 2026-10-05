export type AccountScreen = 'accounts' | 'edit' | 'add' | 'setup' | 'addresses' | 'history' | 'transaction'
  | 'profile' | 'chats' | 'watchlist' | 'settings' | 'help';
export type AccountInitialView = 'closed' | 'menu' | AccountScreen;
export type AccountMethod = 'create' | 'hardware' | 'phrase' | 'key' | 'watch';

export interface PreviewAccount {
  id: string;
  name: string;
  initials: string;
  kind: string;
  notifications: boolean;
}

export const ACCOUNT_TITLES: Record<AccountScreen, string> = {
  accounts: 'Your accounts', edit: 'Edit account', add: 'Add account', setup: 'New account',
  addresses: 'Account addresses', history: 'History', transaction: 'Activity details',
  profile: 'Profile', chats: 'Chats', watchlist: 'Watchlist', settings: 'Settings', help: 'Help & support',
};

export const ACCOUNT_METHODS: Record<AccountMethod, { title: string; description: string; kind: string }> = {
  create: { title: 'Create new account', description: 'Add a new multi-chain account', kind: 'Multi-chain' },
  hardware: { title: 'Connect hardware wallet', description: 'Keep your keys on a hardware wallet', kind: 'Hardware' },
  phrase: { title: 'Import recovery phrase', description: 'Bring an existing wallet into Bastion', kind: 'Imported' },
  key: { title: 'Import private key', description: 'Add a single-chain account', kind: 'Imported' },
  watch: { title: 'Watch address', description: 'Follow a public wallet address', kind: 'Watch-only' },
};
