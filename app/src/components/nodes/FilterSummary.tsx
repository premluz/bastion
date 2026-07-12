import { Token } from '@astryxdesign/core/Token';
import type { FilterSummaryProps } from '../../contracts/props/filter-summary';

export function FilterSummary({ constraints }: FilterSummaryProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
      {constraints.map((constraint) => (
        <Token key={constraint} label={constraint} color="default" />
      ))}
    </div>
  );
}
