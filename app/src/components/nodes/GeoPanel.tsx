import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { GeoPanelProps } from '../../contracts/props/geo-panel';
import { vizToken } from './vizPalette';

const POINT_RADIUS = 0.014;

// Stylized abstract map, no tile service (node-vocabulary.md) — points and
// regions are plotted directly in the DataSet's normalized 0..1 space.
// AspectRatio(1) keeps the canvas square so that space maps 1:1 with no
// stretch, unlike a plain responsive width/fixed-height box. AspectRatio
// has no built-in width cap — inside a full-width scene-grid column it
// would otherwise stretch into an oversized square (same fixed-dimension
// precedent as TimeSeries' chart height and EntityGraph's canvas height).
const MAX_WIDTH = 360;

export function GeoPanel({ title, data }: GeoPanelProps) {
  if (data.points.length === 0) {
    return <EmptyState title="No locations" description="No geo points returned for this query." />;
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: MAX_WIDTH }}>
      {title && <Text type="label">{title}</Text>}
      <AspectRatio ratio={1}>
        <svg viewBox="0 0 1 1" width="100%" height="100%" role="img" aria-label={title ?? 'Geographic panel'}>
          {data.regions?.map((region) => (
            <path
              key={region.id}
              d={region.path}
              fill="var(--accent-signal)"
              fillOpacity={0.12}
              stroke="var(--accent-signal)"
              strokeOpacity={0.4}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {data.points.map((point) => {
            // Flip the label to the point's left past the horizontal
            // midpoint so it doesn't run off the right edge of the 0..1
            // viewBox — this space has no scroll/overflow to fall back on.
            const labelOnLeft = point.x > 0.5;
            return (
              <g key={point.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={POINT_RADIUS}
                  fill={point.kind ? vizToken(point.kind) : 'var(--accent-signal)'}
                  stroke="var(--surface-0)"
                  strokeWidth={0.003}
                />
                <text
                  x={labelOnLeft ? point.x - POINT_RADIUS - 0.01 : point.x + POINT_RADIUS + 0.01}
                  y={point.y + 0.012}
                  textAnchor={labelOnLeft ? 'end' : 'start'}
                  fill="var(--ink-primary)"
                  fontSize={0.035}
                  fontFamily="var(--face-ui)"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </AspectRatio>
    </div>
  );
}
