import { Button } from '@astryxdesign/core/Button';
import type { SceneFollowUp } from '../../contracts/scene';
import styles from './FollowUpChips.module.css';

// A scene's own suggested next queries (2026-08-31, direct feedback: "a
// good follow-up strategy... build chips as part of scenario"), rendered
// after a settled scene wherever one can render — inline in the
// transcript (Transcript.tsx) or in the artifact panel (Canvas.tsx).
// Astryx's own Button, ghost/sm (not Token: Token's own docs are
// explicit — "Don't use tokens for primary actions or navigation; use
// Button or Link instead" — a follow-up chip submits a new query, which
// is an action, not a metadata label). Clicking submits `intent` through
// the SAME submitQuery/IntentResolver path a typed query uses — a
// follow-up is a real match against some scene's own `intents` array,
// not a special-cased action.
export function FollowUpChips({ items, onSelect }: { items: SceneFollowUp[]; onSelect: (intent: string) => void }) {
  if (items.length === 0) return null;

  return (
    <div className={styles.row}>
      {items.map((item) => (
        <Button key={item.intent} label={item.label} variant="ghost" size="sm" onClick={() => onSelect(item.intent)} />
      ))}
    </div>
  );
}
