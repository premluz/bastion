import { Icon, type IconName } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { ThinkingStep } from '../../contracts/thinking';
import { SourceChip } from './SourceChip';
import { ConfidenceBadge } from './ConfidenceBadge';
import { SearchResultsCard } from './SearchResultsCard';
import { useTextReveal } from './useTextReveal';
import './trail.css';
import styles from './StepRow.module.css';

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
// trail is deliberately not one (node-vocabulary.md Trail law). The icon
// now encodes STATUS (clock while active, check once settled) rather
// than reasoning KIND — supersedes this component's own prior ruling
// ("kind is the meaningful fact here... our steps don't have a failure
// state"), a direct, confirmed amendment to match the new git-log
// reference: the connecting rail (see StepRow.module.css's .rail) reads
// as a real progress timeline only if its nodes show status, not action
// type. Duration shows only once a step settles, matching the template's
// "duration on the trailing edge for completed calls."
export function StepRow({ step, isActive, isLast = false }: StepRowProps) {
  // Order-scoped to the active label only (node-vocabulary.md's
  // ThinkingTrail law: the active step is the only animated thing on
  // screen) — the settled branch below renders a different Text element
  // entirely on isActive flipping false, so it never carries the reveal
  // class and never needs a reset.
  const revealRef = useTextReveal(step.durationMs, isActive);

  const iconName: IconName = isActive ? 'clock' : 'check';
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
            <Text ref={revealRef} type="body" weight="medium" color="primary" className="merlin-text-reveal">
              {step.label}
            </Text>
          ) : (
            <Text type="body" color="secondary">
              {step.label}
            </Text>
          )}
          {!isActive && (
            <Text type="supporting" color="disabled" hasTabularNumbers>
              {(step.durationMs / 1000).toFixed(1)}s
            </Text>
          )}
        </div>
        {step.detail && <Text type="supporting">{step.detail}</Text>}
        {step.sources && step.sources.length > 0 && (
          <div className={styles.sourceChips}>
            {step.sources.map((source) => (
              <SourceChip key={source.name} name={source.name} />
            ))}
          </div>
        )}
        {step.kind === 'search' && step.webResults && step.webResults.length > 0 && (
          <SearchResultsCard results={step.webResults} />
        )}
        {step.confidence !== undefined && <ConfidenceBadge confidence={step.confidence} />}
      </div>
    </div>
  );
}
