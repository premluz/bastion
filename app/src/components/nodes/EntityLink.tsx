import styles from './EntityLink.module.css';

// Shared presentational primitive (Phase 8F) — NOT a registry node, same
// precedent as chartCraft.tsx: reused directly by data-table/signal-feed
// wherever a cell names a known, investigable entity. Deliberately pure:
// no onClick, no store access, no scene awareness (renderer-layer rule) —
// it only exposes `data-entity-id` for a delegated listener higher up the
// tree (Canvas, app-shell layer) to act on, per the one-way dependency
// direction (contracts ← registry ← renderer ← engine ← app). Facts
// register (principle 2): no color change, no permanent decoration —
// underline appears on hover only, emphasis is earned (principle 8).
export function EntityLink({ entityId, label }: { entityId: string; label: string }) {
  return (
    <span data-entity-id={entityId} className={styles.link}>
      {label}
    </span>
  );
}
