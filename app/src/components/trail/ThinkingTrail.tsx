import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { ThinkingStep } from '../../contracts/thinking';
import { StepRow } from './StepRow';
import { ThinkingIndicator } from './ThinkingIndicator';
import './trail.css';
import styles from './ThinkingTrail.module.css';

// Synthetic, client-only terminal row appended once the trail completes
// (direct order, 2026-08-10) — never persisted, never validated against a
// scene fixture, never counted in the "N reasoning steps" trigger text
// below (that stays keyed on the real `steps.length`). `kind: 'verify'` is
// a type-satisfying placeholder only: StepRow's icon is status-driven
// (clock/check), not kind-driven, so this has zero visual effect — it
// always renders isActive:false, so it always gets the settled check icon
// automatically, no special-casing needed inside StepRow.
const DONE_STEP: ThinkingStep = { id: '__done__', kind: 'verify', label: 'Done', durationMs: 0 };

interface ThinkingTrailProps {
  steps: ThinkingStep[];
  activeIndex: number;
  isComplete: boolean;
  elapsedMs: number;
  skip: (() => void) | null;
}

// The container: steps appear on the player's clock, active step visibly
// alive, completed steps settle. Reads as work being done, never a fake
// chat transcript — settled steps stay visible as the record of how the
// agent got here, they don't scroll away. Skippable by click anywhere
// on the trail while it plays.
//
// Phase 8B WO-2: pure/props now (was store-reading) so Transcript.tsx can
// drive it two ways from the same component — live (trailStore, for the
// one turn currently in flight) or settled (a past turn's frozen
// `turn.trail`, per node-vocabulary.md "settled steps stay visible as the
// record"). No behavior change for the live case.
//
// Once complete, the whole trail becomes an Astryx Collapsible
// (defaultIsOpen — nothing hides by default, matching "stay visible as
// the record") with a summary trigger, adopting the collapsible
// settled-group pattern from the ai-chat template's ChatToolCalls
// (.astryx-scratch/ai-chat/page.tsx: "Group header: a wrench icon with a
// call count, clicking toggles between the summary and the full list").
// Only active while playing does the trail keep its own click-to-skip
// handler — skip is already null once trailStore.finish() runs (or when
// rendering a settled past turn), so the two interaction modes never
// overlap.
export function ThinkingTrail({ steps, activeIndex, isComplete, elapsedMs, skip }: ThinkingTrailProps) {
  if (steps.length === 0) return null;

  const visibleSteps = steps.slice(0, activeIndex + 1);
  const rowsSource = isComplete ? [...visibleSteps, DONE_STEP] : visibleSteps;
  const stepRows = rowsSource.map((step, index) => (
    <StepRow
      key={step.id}
      step={step}
      isActive={index === activeIndex && !isComplete}
      isLast={index === rowsSource.length - 1}
    />
  ));

  if (isComplete) {
    return (
      <Collapsible
        defaultIsOpen
        trigger={
          <div className={styles.triggerHeader}>
            <Icon icon="wrench" color="secondary" size="sm" />
            <Text type="supporting" color="secondary">
              {`${steps.length} reasoning step${steps.length === 1 ? '' : 's'} · ${(elapsedMs / 1000).toFixed(1)}s`}
            </Text>
          </div>
        }
      >
        <div className={styles.stepsContainer}>{stepRows}</div>
      </Collapsible>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => skip?.()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          skip?.();
        }
      }}
      aria-label="Thinking trail — click to skip"
      className={styles.traiContainer}
    >
      <ThinkingIndicator />
      {stepRows}
    </div>
  );
}
