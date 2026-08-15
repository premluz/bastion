import { create } from "zustand";

interface WalletConnectionState {
  connectedWalletIds: Record<string, true>;
  connect: (id: string) => void;
}

// Mock connect flow state (Phase 15 WO-1) — session-scoped only, never
// persisted, never reaching a real wallet integration (the Holdings
// page's own copy says so explicitly). Idempotent on repeat confirms,
// same keyed-Record precedent as dataSourceConnectionStore/watchlistStore.
export const useWalletConnectionStore = create<WalletConnectionState>((set) => ({
  connectedWalletIds: {},
  connect: (id) => set((state) => ({ connectedWalletIds: { ...state.connectedWalletIds, [id]: true } })),
}));
