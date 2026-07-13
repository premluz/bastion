import { create } from "zustand";

interface DataSourceConnectionState {
  connectedCatalogIds: Record<string, true>;
  connect: (id: string) => void;
}

// Mock connect flow state (Phase 8H WO-2) — session-scoped only, never
// persisted, never reaching a real integration (the Data Sources page's
// own copy says so explicitly). Idempotent on repeat confirms, same
// keyed-Record precedent as watchlistStore.
export const useDataSourceConnectionStore = create<DataSourceConnectionState>((set) => ({
  connectedCatalogIds: {},
  connect: (id) => set((state) => ({ connectedCatalogIds: { ...state.connectedCatalogIds, [id]: true } })),
}));
