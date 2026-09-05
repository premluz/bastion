import { Text } from '@astryxdesign/core/Text';
import { Panel } from '../nodes/Panel';
import type { TimelineEntry } from '../../contracts/tradableAsset';
import styles from './StoriesAndAnalysisCard.module.css';

const PLACEHOLDER_COLORS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)'];

// "Stories & Analysis" (Phase 21) — Overview's own card-grid preview of
// priceMovementTimeline's same entries (news-feed.tsx grammar reused,
// no schema change — this is a shell-level presentational variant, not a
// registry node, same posture as AssetKeyStatsTable/AssetSnippetCard).
// Placeholder image blocks are token-colored, not real images — no
// image-asset pipeline exists in this app, same honest-placeholder
// posture as Data Sources' own public catalog.
export function StoriesAndAnalysisCard({ entries }: { entries: TimelineEntry[] }) {
  return (
    <Panel title="Stories & Analysis">
      <div className={styles.list}>
        {entries.map((entry, index) => (
          <div key={entry.id} className={styles.row}>
            <div
              className={styles.placeholder}
              style={{ '--placeholder-color': PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length] } as React.CSSProperties}
            />
            <div className={styles.textColumn}>
              <Text type="body" weight="semibold">
                {entry.headline}
              </Text>
              <Text type="supporting" color="secondary">
                {entry.source.name}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
