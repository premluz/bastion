import { Icon, type IconName } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { ThinkingStep } from '../../contracts/thinking';
import { SourceChip } from './SourceChip';
import { ConfidenceBadge } from './ConfidenceBadge';
import { SearchResultsCard } from './SearchResultsCard';
import { LabelReveal } from './LabelReveal';
import './trail.css';
import styles from './StepRow.module.css';
import trailStyles from './ThinkingTrail.module.css';

interface StepRowProps {
  step: ThinkingStep;
  isActive: boolean;
  // Only isLast is needed: each row draws its rail segment downward only
  // (see .rail's comment in StepRow.module.css) — there is no "segment
  // above" a first row to suppress, so no isFirst prop exists.
  isLast?: boolean;
}

// One atomic reasoning action, now on a connected git-log-style timeline
// (direct order, 2026-08-10 — see node-vocabulary.md Trail vocabulary's
// amendment note). Active state is still the one animated thing among the
// step rows themselves (node-vocabulary.md principle 5, narrowed) —
// ThinkingTrail's own persistent top-of-trail pulse is a separate,
// confirmed exception living outside this component.
//
// Craft adopted from Astryx's ai-chat template's ChatToolCalls
// (.astryx-scratch/ai-chat/page.tsx lines 398-421, docs anatomy: status
// icon / label weight / duration on the trailing edge), reimplemented
// with our own primitives rather than importing ChatToolCalls itself —
// its own docs say "Don't display outside chat message context," and the
// trail is deliberately not one (node-vocabulary.md Trail law). Duration
// shows only once a step settles, matching the template's "duration on
// the trailing edge for completed calls."
//
// The active row IS "Thinking" (2026-09-06 — two prior attempts at a
// separate Thinking element/row were both wrong: a persistent node
// rendered above the list read as "left behind" once real steps advanced
// past it, and a fixed row pinned at index 0 had the exact same problem
// restated. Direct correction: "always coming in front... not staying at
// the beginning as first item but always coming in front" — "in front"
// means whichever step is CURRENT, not a fixed position). There is no
// separate row: whichever step is active shows the shimmering
// wrench+"Thinking" treatment instead of its own real label; the same
// row settles into its real label + check + duration exactly as it
// always has once isActive flips false. This is what makes "Thinking"
// travel down the list with the active step automatically, with no
// position bookkeeping anywhere — it was never a step of its own, it's
// what any step looks like while still in flight.
//
// The real label streams in the instant a step settles (2026-09-06
// follow-up — see LabelReveal.tsx's own comment for the full
// reasoning/technique). Deleting TextChunkReveal alongside the shimmer
// change above was a real regression: this row's real text disappearing
// entirely while active didn't mean the SETTLE transition should lose
// its own reveal too — LabelReveal plays exactly once, the moment
// isActive flips from true to false and this branch renders for the
// first time.
export function StepRow({ step, isActive, isLast = false }: StepRowProps) {
  const iconName: IconName = isActive ? 'wrench' : 'check';
  const iconBoxClasses = isActive ? `${styles.iconBox} ${styles.activeIndicator}` : styles.iconBox;

  return (
    <div className={styles.root}>
      {/* Every row draws the rail segment BELOW its own icon (down to the
          next row's icon center) except the last row, which has nothing
          below it to reach — see StepRow.module.css's .rail comment for
          the full concatenation mechanism. */}
      {!isLast && <div className={styles.rail} aria-hidden="true" />}
      <div className={iconBoxClasses}>
        <Icon icon={iconName} color={isActive ? 'accent' : 'secondary'} size="sm" />
      </div>
      <div className={styles.contentBlock}>
        <div className={styles.headerRow}>
          {isActive ? (
            <Text type="body" weight="medium" className={trailStyles.shimmerText}>
              Thinking
            </Text>
          ) : (
            <Text type="body" color="secondary">
              <LabelReveal text={step.label} durationMs={step.durationMs} />
            </Text>
          )}
          {!isActive && (
            <Text type="supporting" color="disabled" hasTabularNumbers>
              {(step.durationMs / 1000).toFixed(1)}s
            </Text>
          )}
        </div>
        {!isActive && step.detail && <Text type="supporting">{step.detail}</Text>}
        {!isActive && step.sources && step.sources.length > 0 && (
          <div className={styles.sourceChips}>
            {step.sources.map((source) => (
              <SourceChip key={source.name} name={source.name} />
            ))}
          </div>
        )}
        {!isActive && step.kind === 'search' && step.webResults && step.webResults.length > 0 && (
          <SearchResultsCard results={step.webResults} />
        )}
        {!isActive && step.confidence !== undefined && <ConfidenceBadge confidence={step.confidence} />}
      </div>
    </div>
  );
}
