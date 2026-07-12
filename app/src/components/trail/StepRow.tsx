import { Icon, type IconName } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { StepKind, ThinkingStep } from '../../contracts/thinking';
import { SourceChip } from './SourceChip';
import { ConfidenceBadge } from './ConfidenceBadge';
import './trail.css';

const KIND_ICONS: Record<StepKind, IconName> = {
  plan: 'wrench',
  search: 'search',
  retrieve: 'copy',
  correlate: 'arrowsUpDown',
  synthesize: 'checkDouble',
  verify: 'check',
};

interface StepRowProps {
  step: ThinkingStep;
  isActive: boolean;
}

// One atomic reasoning action. Active state is the only animated thing on
// screen at that moment (node-vocabulary.md principle 5) — settled steps
// carry no motion at all.
//
// Craft adopted from Astryx's ai-chat template's ChatToolCalls
// (.astryx-scratch/ai-chat/page.tsx lines 398-421, docs anatomy: status
// icon / label weight / duration on the trailing edge), reimplemented
// with our own primitives rather than importing ChatToolCalls itself —
// its own docs say "Don't display outside chat message context," and the
// trail is deliberately not one (node-vocabulary.md Trail law). The kind
// icon (what reasoning action this is) is kept rather than swapped for a
// status icon (pending/running/complete) — our steps don't have a
// failure state, and kind is the meaningful fact here — but it now sits
// in a circular backdrop matching the template's "colored circle"
// silhouette. Duration shows only once a step settles, matching the
// template's "duration on the trailing edge for completed calls."
export function StepRow({ step, isActive }: StepRowProps) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'var(--space-24)',
          height: 'var(--space-24)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--surface-2)',
          flexShrink: 0,
          ...(isActive
            ? {
                animationName: 'merlin-step-pulse',
                animationDuration: 'var(--duration-480)',
                animationTimingFunction: 'var(--ease-standard)',
                animationIterationCount: 'infinite',
              }
            : {}),
        }}
      >
        <Icon icon={KIND_ICONS[step.kind]} color={isActive ? 'accent' : 'secondary'} size="sm" />
      </div>
      <div style={{ display: 'grid', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {isActive ? (
            <Text type="body" weight="medium" color="primary">
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
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {step.sources.map((source) => (
              <SourceChip key={source.name} name={source.name} />
            ))}
          </div>
        )}
        {step.confidence !== undefined && <ConfidenceBadge confidence={step.confidence} />}
      </div>
    </div>
  );
}
