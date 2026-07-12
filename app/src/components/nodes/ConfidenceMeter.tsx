import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { confidenceQualifier } from '../../contracts/thinking';
import type { ConfidenceMeterProps } from '../../contracts/props/confidence-meter';

// "Must look like an instrument, not a game HUD" (node-vocabulary.md) —
// Astryx's ProgressBar, semantic variant only, no custom gauge chrome.
export function ConfidenceMeter({ label, value }: ConfidenceMeterProps) {
  const qualifier = confidenceQualifier(value);
  const variant = qualifier === 'high' ? 'success' : qualifier === 'moderate' ? 'accent' : 'warning';

  return (
    <ProgressBar
      label={label}
      value={value * 100}
      max={100}
      hasValueLabel
      formatValueLabel={() => `${value.toFixed(2)} · ${qualifier}`}
      variant={variant}
    />
  );
}
