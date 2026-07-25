import type { MouseEvent } from "react";

// Shared by every shell-level delegated listener that catches a click on
// a `data-entity-id` element (EntityLink's own pattern, Phase 8F; now also
// bar-series' linkable bars, Portfolio wiring order 2026-07-25). Each
// listener still decides its OWN destination (Canvas.tsx routes to
// submitQuery via an intent; DashboardPage.tsx routes to openEntityDetail)
// — only the DOM lookup is shared, not the navigation.
export function resolveClickedEntityId(event: MouseEvent<HTMLElement>): string | undefined {
  const target = (event.target as HTMLElement).closest("[data-entity-id]");
  return target?.getAttribute("data-entity-id") ?? undefined;
}
