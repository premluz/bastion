import { Text } from '@astryxdesign/core/Text';
import styles from './ThinkingTrail.module.css';

// Persistent top-of-trail pulse (direct order, 2026-08-10) — runs
// continuously for the trail's whole active lifetime, simultaneously with
// whatever per-row settle animation is also happening below it. Deliberate,
// confirmed exception to node-vocabulary.md's "active state is the only
// animated thing on screen" law (Trail vocabulary amendment) — reuses the
// exact merlin-step-pulse keyframe/duration/easing already defined in
// trail.css rather than inventing new motion. Mounted/unmounted by
// ThinkingTrail.tsx (only while the trail is running) — this component
// itself is a pure "always pulses while mounted" primitive.
export function ThinkingIndicator() {
  return (
    <div className={styles.thinkingIndicator}>
      <Text type="supporting" color="secondary">
        Thinking…
      </Text>
    </div>
  );
}
