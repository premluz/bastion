import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { StatusTag } from './StatusTag';
import type { EntityHeaderProps } from '../../contracts/props/entity-header';

// Vocabulary: "3-5 key attributes" — display cap, not a data-shape limit;
// entities may carry more attributes for other views (dossiers, tables).
const MAX_DISPLAYED_ATTRIBUTES = 5;

// Phase 12 WO-2: derivative-shaped facts render through the exact same
// MetadataList as any other entity's generic attributes — no separate
// visual section, no new component. Ordered ahead of `attributes` since
// they're the entity's own defining facts when present, subject to the
// same display cap as everything else.
const DERIVATIVE_LABELS = {
  counterparty: 'Counterparty',
  notional: 'Notional',
  exposure: 'Mark-to-market exposure',
  tenor: 'Tenor',
  tradeDate: 'Trade date',
} as const;

export function EntityHeader({ data, status }: EntityHeaderProps) {
  const { entity } = data;
  const { derivative } = entity;
  const derivativeAttributes = derivative
    ? (Object.keys(DERIVATIVE_LABELS) as (keyof typeof DERIVATIVE_LABELS)[]).map((key) => ({
        label: DERIVATIVE_LABELS[key],
        value: derivative[key],
      }))
    : [];
  const attributes = [...derivativeAttributes, ...entity.attributes].slice(0, MAX_DISPLAYED_ATTRIBUTES);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
        <Heading level={2}>{entity.name}</Heading>
        {status && <StatusTag label={status.label} tone={status.tone} />}
        {/* Watch action (Phase 8G WO-2): rule 7's escape hatch, same
            pattern as EntityLink — pure data attributes, no onClick, no
            engine/app import. ArtifactStack's delegated listener (shell
            layer, Phase 8H) is what actually reaches watchlistStore. */}
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
