import { Token } from '@astryxdesign/core/Token';

// The canonical provenance chip — identical rendering wherever a source
// system is cited (trail steps, panel attributions, recommendations),
// so users recognize a source by its chip before reading its name
// (node-vocabulary.md Trail section).
export function SourceChip({ name }: { name: string }) {
  return <Token label={name} color="default" size="sm" />;
}
