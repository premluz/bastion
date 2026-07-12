import { create } from "zustand";
import watchlistSeed from "../../../universe/watchlist.json";

export type WatchSource = "seeded" | "manual" | "alert";

export interface WatchlistItem {
  entityId: string;
  label: string;
  status: string;
  source: WatchSource;
  watchedAt: string;
}

interface SeedRecord {
  entityId: string;
  label: string;
  status: string;
  watchedAt: string;
}

interface WatchlistState {
  items: Record<string, WatchlistItem>;
  watch: (entityId: string, label: string, source: Exclude<WatchSource, "seeded">) => void;
}

// Seeded items (universe/watchlist.json, fictional statuses authored
// there) are the only "seeded" source — everything watched during a
// session is "manual" (entity-header, Entities pane row) or "alert"
// (presentScene.ts, automatic once a Monitor-module turn lands). Keyed by
// entityId so watching an already-watched entity is a no-op, never a
// duplicate row — the same idempotency `presentScene.ts`'s alert-append
// hook depends on to be safe against an entity that's already tracked.
export const useWatchlistStore = create<WatchlistState>((set) => ({
  items: Object.fromEntries(
    Object.values(watchlistSeed as Record<string, SeedRecord>).map((seed) => [
      seed.entityId,
      { ...seed, source: "seeded" as const },
    ]),
  ),
  watch: (entityId, label, source) =>
    set((state) => {
      if (state.items[entityId]) return state;
      const status =
        source === "alert" ? "Auto-tracked from an alert this session" : "Added to watchlist this session";
      return {
        items: {
          ...state.items,
          [entityId]: { entityId, label, status, source, watchedAt: new Date().toISOString() },
        },
      };
    }),
}));
