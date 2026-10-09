import type { SendRequest } from '../../engine/sendMoneyState';
import type { TopUpRequest } from '../../engine/mortgageTopUpState';
import type { AgendaItemId } from '../../engine/agentAgenda';
import type { HydratedScene } from '../../contracts/scene';
import type { ThinkingStep } from '../../contracts/thinking';

// One turn in the shell's transcript (moved out of useMobileFrame.ts 2026-10-09 for the file budget).
export interface TranscriptMessage {
  id: number;
  text: string;
  // Settled trail (2026-09-13): only present once playTrail's own
  // onComplete has fired for this message — mirrors Transcript.tsx's own
  // settled-vs-live split (a past turn's frozen turn.trail/
  // trailElapsedMs vs. the one turn currently in flight, read live from
  // useTrailStore). Bastion has no sessionStore turn to freeze this onto,
  // so it lives on the message itself instead.
  trail?: ThinkingStep[];
  trailElapsedMs?: number;
  // Set once the trail completes (undefined while pending/no match) —
  // same manifest/keywordResolver ChatBar.tsx already uses on desktop,
  // resolved directly rather than through submitQuery/presentScene: those
  // orchestrate sessionStore/artifactStore, Merlin's desktop artifact-
  // stack overlay model that CLAUDE.md §3 says does not carry over to a
  // single-column mobile shell. playTrail/useTrailStore themselves carry
  // no such coupling (a plain zustand store, pure-props ThinkingTrail) —
  // reused as-is, same sequencing presentScene.ts already establishes:
  // trail plays first, scene attaches only once it completes.
  scene?: HydratedScene;
  // Set when the query parses as a buy-ETH request (2026-09-13, direct
  // feedback: "inline — for all scenarios entering into composer just
  // runs the scenario in that view, unless the conversation icon is
  // clicked"). Lives on the message so the buy flow renders inside the
  // transcript like any other scenario result, rather than through the
  // whole-shell takeover this replaces — that early return unmounted the
  // entire shell, which is why pressing Enter looked like a jump to
  // conversation mode: the nav and composer were not hidden, they were
  // gone.
  buyAmount?: number;
  sendRequest?: SendRequest;
  topUpRequest?: TopUpRequest;
  source?: 'voice';
  voiceFeedback?: string;
  /** The assistant speaking unprompted (an agenda handover), not a user turn. */
  role?: 'assistant';
  /** The recommended action this assistant message offers, awaiting yes/no. */
  agendaOffer?: AgendaItemId;
  /** A spoken "no" to that offer: recorded as said, never resolved. */
  declinedOffer?: AgendaItemId;
}
