import { Card } from '@astryxdesign/core/Card';
import { List } from '@astryxdesign/core/List';
import { ListItem } from '@astryxdesign/core/List';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Text } from '@astryxdesign/core/Text';
import type { WebResult } from '../../contracts/thinking';
import styles from './SearchResultsCard.module.css';

// Mock web-search results card (direct order, 2026-08-10), search-kind
// steps only. Wholly separate from SourceChip/`sources` (internal system
// provenance, unchanged — node-vocabulary.md's "identical everywhere"
// chip law stays intact) — this renders placeholder external web results,
// never a provenance chip. Logo placeholder is Avatar's own
// initials-from-name fallback (no src), so it inherits Astryx's own
// token-driven avatar palette instead of a hand-rolled colored square.
export function SearchResultsCard({ results }: { results: WebResult[] }) {
  if (results.length === 0) return null;

  return (
    <Card padding={2} variant="muted" height={192} {...(styles.card ? { className: styles.card } : {})}>
      <div className={styles.header}>
        <Text type="supporting" color="secondary">{`${results.length} results`}</Text>
      </div>
      <List density="compact" hasDividers>
        {results.map((result) => (
          <ListItem
            key={result.id}
            startContent={<Avatar name={result.domain} size="small" />}
            label={result.title}
            endContent={
              <Text type="supporting" color="secondary">
                {result.domain}
              </Text>
            }
          />
        ))}
      </List>
    </Card>
  );
}
