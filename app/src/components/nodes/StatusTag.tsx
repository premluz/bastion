import { Badge } from '@astryxdesign/core/Badge';
import type { StatusTagProps } from '../../contracts/props/status-tag';

const TONE_TO_VARIANT = {
  ok: 'success',
  warn: 'warning',
  alert: 'error',
  neutral: 'neutral',
} as const;

export function StatusTag({ label, tone }: StatusTagProps) {
  return <Badge variant={TONE_TO_VARIANT[tone]} label={label} />;
}
