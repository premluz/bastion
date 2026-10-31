import type { TranscriptMessage } from './transcriptMessage';
import { AttentionCardBody } from './AttentionCardBody';
import glowStyles from '../../theme/glow.module.css';
import cardStyles from './AttentionCard.module.css';
import '../../theme/scenario-expand.css';

// A scenario opened from a home alert (2026-10-31, direct feedback): the conversation opens on the very card the user
// tapped — the same surface, size and words (AttentionCard's own styles), no longer a button — where a typed question
// would be (useTranscriptNodes). During the transition the card travels here from the home (theme/scenario-expand.css).
export function ScenarioOpening({ alert }: { alert: NonNullable<TranscriptMessage['alert']> }) {
  return (
    <header className={`${cardStyles.root} ${glowStyles.root} ${glowStyles.bottom} ${glowStyles.clipped}`} data-attention-kind={alert.kind}
      data-scenario-opening="">
      <AttentionCardBody kind={alert.kind} title={alert.title} action={alert.action} />
    </header>
  );
}
