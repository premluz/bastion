import { useState } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { EntityGraphProps } from '../../contracts/props/entity-graph';
import { vizToken } from './vizPalette';

const PADDING = 40;
const NODE_RADIUS = 7;

// v1 interaction pins (node-vocabulary.md): hover highlights only the
// hovered entity's connected edges — no pan/zoom, no simulation. Positions
// are authored in the scene data payload and used as-is.
export function EntityGraph({ title, data }: EntityGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (data.nodes.length === 0) {
    return <EmptyState title="No relationships" description="No connected entities returned for this query." />;
  }

  const xs = data.nodes.map((node) => node.x);
  const ys = data.nodes.map((node) => node.y);
  const minX = Math.min(...xs) - PADDING;
  const minY = Math.min(...ys) - PADDING;
  const width = Math.max(...xs) - Math.min(...xs) + PADDING * 2;
  const height = Math.max(...ys) - Math.min(...ys) + PADDING * 2;

  const connectedEdgeKeys = hoveredId
    ? new Set(
        data.edges
          .filter((edge) => edge.source === hoveredId || edge.target === hoveredId)
          .map((edge) => `${edge.source}->${edge.target}`),
      )
    : null;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        width="100%"
        style={{ aspectRatio: `${width} / ${height}`, display: 'block' }}
        role="img"
        aria-label={title ?? 'Entity relationship graph'}
      >
        {data.edges.map((edge) => {
          const source = data.nodes.find((node) => node.id === edge.source);
          const target = data.nodes.find((node) => node.id === edge.target);
          if (!source || !target) return null;
          const key = `${edge.source}->${edge.target}`;
          const isHighlighted = connectedEdgeKeys?.has(key) ?? false;
          const isDimmed = connectedEdgeKeys !== null && !isHighlighted;
          return (
            <line
              key={key}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={isHighlighted ? 'var(--accent-signal)' : 'var(--edge)'}
              strokeWidth={isHighlighted ? 2 : 1}
              opacity={isDimmed ? 0.3 : 1}
            />
          );
        })}
        {data.nodes.map((node) => {
          // Flip the label to the node's left past the horizontal midpoint
          // so it doesn't run off the viewBox's right edge — same fix as
          // geo-panel's label clipping (Phase 7): the SVG clips at its own
          // bounds, not the rendered box, so this is independent of size.
          const labelOnLeft = node.x > minX + width / 2;
          // weight is decorative only (Phase 8D) — never read for hover,
          // filtering, or edge logic, purely a radius nudge. sqrt scaling
          // keeps rendered AREA proportional to weight, matching how a
          // reader actually perceives circle size.
          const radius = node.weight !== undefined ? NODE_RADIUS + Math.sqrt(node.weight) * 6 : NODE_RADIUS;
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
            >
              <circle cx={node.x} cy={node.y} r={radius} fill={node.group ? vizToken(node.group) : 'var(--ink-muted)'} />
              <text
                x={labelOnLeft ? node.x - radius - 4 : node.x + radius + 4}
                y={node.y + 4}
                textAnchor={labelOnLeft ? 'end' : 'start'}
                fill="var(--ink-primary)"
                fontSize={11}
                fontFamily="var(--face-ui)"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
