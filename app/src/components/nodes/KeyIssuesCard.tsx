import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { KeyIssuesCardProps } from '../../contracts/props/key-issues-card';
import { SourceChip } from '../trail/SourceChip';
import glowStyles from '../../theme/glow.module.css';
import styles from './KeyIssuesCard.module.css';

// "What are the live, contested arguments for and against this asset
// right now, and who's making them?" (node-vocabulary.md, Phase 21) — a
// named topic with a bullish case and a bearish case read side by side,
// each independently sourced. Facts/reasoning register, never Merlin's
// own recommendation — same boundary analyst-consensus holds for
// third-party sentiment. First topic starts expanded, the rest
// collapsed (Collapsible's own defaultIsOpen), matching the reference.
//
// Bullish/bearish badges (icon + title, red/green) — direct feedback,
// 2026-08-15, superseding this file's own earlier ruling the same
// session (--viz-1/--viz-4, chosen specifically to AVOID red/green
// after --viz-1/--viz-2 read as literal good/bad framing): the architect
// re-confirmed red/green explicitly this round, so this is the second,
// now-standing exception to principle 8's default ban — same register as
// TrendChart's own --delta-up/--delta-down line color, not a silent
// reversal. Astryx Badge's non-semantic `green`/`red` palette variants
// (not `success`/`error`, which would layer on unwanted tone semantics
// beyond "which side of the argument") pair an arrowUp/arrowDown icon
// with the "Bullish"/"Bearish" label as one unit. Each pane also gets its
// own subtle top-left glow matching its badge color — glow.module.css's
// existing primitive, reused (its own gate required proving reuse
// outside TradableAsset's TrendChart, its first consumer) — PLUS a
// bottom glow (2026-08-16 follow-up), the same primitive's .bottomWide
// variant combined on the same element (glow.module.css splits
// .topLeft/.topRight onto ::before and .bottom*/::after onto ::after so
// both can stack), same --glow-color driving both. .bottomWide, not
// .bottom: KeyIssuesCard's own wider/lower-set sizing, supplied directly
// against its live-inspected output — kept as its own class rather than
// editing .bottom, which stays TrendChart's own already-confirmed
// "flush, no overflow" values (a shared class edit here would have
// silently changed TrendChart's glow too). --glow-strength set to
// --tint-subtle on both panes (2026-08-18 sweep, direct feedback: "all
// gradients... key issues, bullish, bearish... should be subtle, we
// added that scale") — this file was cited by name as still on
// glow.module.css's own --tint-strong default when that token was first
// introduced (2026-08-17); now matches TrendChart's own strength.
export function KeyIssuesCard({ title, issues }: KeyIssuesCardProps) {
  if (issues.length === 0) {
    return <EmptyState title="No key issues" description="No contested topics authored for this asset." />;
  }

  return (
    <div className={styles.root}>
      {title && <Text type="label">{title}</Text>}
      {issues.map((issue, index) => (
        <Collapsible key={issue.topic} trigger={<Text type="body">{issue.topic}</Text>} defaultIsOpen={index === 0}>
          <div className={styles.issueBody}>
            <div
              className={`${styles.viewColumn} ${glowStyles.root} ${glowStyles.topLeft} ${glowStyles.bottomWide} ${glowStyles.clipped}`}
              style={{ '--glow-color': 'var(--delta-up)', '--glow-strength': 'var(--tint-subtle)' } as React.CSSProperties}
            >
              <div className={glowStyles.content}>
                <Badge variant="green" icon={<Icon icon="arrowUp" size="xsm" />} label="Bullish" />
                <Text type="body">{issue.bullishView.text}</Text>
                <div className={styles.sourceRow}>
                  {issue.bullishView.sources.map((source) => (
                    <SourceChip key={source.ref} name={source.name} />
                  ))}
                </div>
              </div>
            </div>
            <div
              className={`${styles.viewColumn} ${glowStyles.root} ${glowStyles.topLeft} ${glowStyles.bottomWide} ${glowStyles.clipped}`}
              style={{ '--glow-color': 'var(--delta-down)', '--glow-strength': 'var(--tint-subtle)' } as React.CSSProperties}
            >
              <div className={glowStyles.content}>
                <Badge variant="red" icon={<Icon icon="arrowDown" size="xsm" />} label="Bearish" />
                <Text type="body">{issue.bearishView.text}</Text>
                <div className={styles.sourceRow}>
                  {issue.bearishView.sources.map((source) => (
                    <SourceChip key={source.ref} name={source.name} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
