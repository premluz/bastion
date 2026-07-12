import { Banner } from '@astryxdesign/core/Banner';

export type FallbackReason = 'unknown-type' | 'missing-data' | 'invalid-props';

interface FallbackNodeProps {
  reason: FallbackReason;
  detail: string;
}

const TITLES: Record<FallbackReason, string> = {
  'unknown-type': 'Unrecognized node',
  'missing-data': 'Missing data',
  'invalid-props': 'Invalid node data',
};

// The renderer's answer to "unknown never crashes" (CLAUDE.md rule 7): a
// designed error card, never a white screen. Not dismissable — an error
// banner stays until the underlying scene is fixed, not until a user
// clicks it away.
export function FallbackNode({ reason, detail }: FallbackNodeProps) {
  return <Banner status="error" title={TITLES[reason]} description={detail} container="card" />;
}
