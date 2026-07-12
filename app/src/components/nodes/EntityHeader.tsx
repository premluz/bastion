import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { StatusTag } from './StatusTag';
import type { EntityHeaderProps } from '../../contracts/props/entity-header';

// Vocabulary: "3-5 key attributes" — display cap, not a data-shape limit;
// entities may carry more attributes for other views (dossiers, tables).
const MAX_DISPLAYED_ATTRIBUTES = 5;

export function EntityHeader({ data, status }: EntityHeaderProps) {
  const { entity } = data;
  const attributes = entity.attributes.slice(0, MAX_DISPLAYED_ATTRIBUTES);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
        <Heading level={2}>{entity.name}</Heading>
        {status && <StatusTag label={status.label} tone={status.tone} />}
        {/* Watch action (Phase 8G WO-2): rule 7's escape hatch, same
            pattern as EntityLink — pure data attributes, no onClick, no
            engine/app import. ArtifactPanel's delegated listener (shell
            layer) is what actually reaches watchlistStore. */}
        <button
          type="button"
          data-watch-entity-id={entity.id}
          data-watch-label={entity.name}
          aria-label={`Watch ${entity.name}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--ink-secondary)',
            fontSize: 'var(--text-13)',
            cursor: 'pointer',
          }}
        >
          <Icon icon="checkDouble" size="xsm" />
          Watch
        </button>
      </div>
      <Text type="supporting">{entity.type}</Text>
      <MetadataList columns="multi" orientation="horizontal">
        {attributes.map((attribute) => (
          <MetadataListItem key={attribute.label} label={attribute.label}>
            <Text type="body" hasTabularNumbers>
              {attribute.value}
            </Text>
          </MetadataListItem>
        ))}
      </MetadataList>
    </div>
  );
}
