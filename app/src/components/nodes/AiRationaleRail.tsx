import { Text } from '@astryxdesign/core/Text';
import { Timestamp } from '@astryxdesign/core/Timestamp';
import type { AiRationaleRailProps } from '../../contracts/props/ai-rationale-rail';
import { SourceChip } from '../trail/SourceChip';
import styles from './AiRationaleRail.module.css';

// "Why is this asset moving, in the agent's own words, backed by named
// sources?" (node-vocabulary.md, Phase 20) — one scripted summary
// paragraph plus its own source list and timestamp, the CoinGecko "Why
// BTC is moving" right-rail pattern. Scripted/template-generated text,
// same discipline as scene-summary/recommendation's own synthesis, never
// live LLM generation. Own "Why is this moving?" label REMOVED 2026-08-19
// (direct feedback: "why is this moving has double title, should only
// have pane title not comp title") — both real consumers
// (AssetOverviewTab.tsx, EntityDetailPage.tsx's News tab) already wrap
// this in a Panel/PanelWithAction whose own `title` prop rendered the
// identical string, stacked directly above this one.
export function AiRationaleRail({ summary, sources, asOf }: AiRationaleRailProps) {
  return (
    <div className={styles.root}>
      <Text type="body">{summary}</Text>
      <div className={styles.sourceRow}>
        {sources.map((source) => (
          <SourceChip key={source.ref} name={source.name} />
        ))}
      </div>
      <Text type="supporting" color="secondary">
        As of <Timestamp value={asOf} format="date" />
      </Text>
    </div>
  );
}
