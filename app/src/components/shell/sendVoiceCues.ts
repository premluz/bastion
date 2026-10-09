// The send flow's narration: one recorded clip per stage it speaks at.
import type { SendAction, SendState } from '../../engine/sendMoneyState';
import type { NarrationLine } from './useVoiceNarration';
import promptClip from '../../../scenes/send-paul/01.mp3?url';
import recipientClip from '../../../scenes/send-paul/02.mp3?url';
import fundingClip from '../../../scenes/send-paul/03.mp3?url';
import answeredClip from '../../../scenes/send-paul/04.mp3?url';
import confirmationClip from '../../../scenes/send-paul/05.mp3?url';
import consolidateClip from '../../../scenes/send-paul/06a.mp3?url';
import swapClip from '../../../scenes/send-paul/06b.mp3?url';
import buyClip from '../../../scenes/send-paul/06c.mp3?url';
import progressClip from '../../../scenes/send-paul/07.mp3?url';

const clips = {
  prompt: promptClip,
  recipient: recipientClip,
  funding: fundingClip,
  answered: answeredClip,
  confirmation: confirmationClip,
  consolidate: consolidateClip,
  swap: swapClip,
  buy: buyClip,
  progress: progressClip,
} as const;

type Cue = keyof typeof clips;
const isTransferCue = (cue: Cue) => cue === 'consolidate' || cue === 'swap' || cue === 'buy';

function cueFor(state: SendState): Cue | null {
  switch (state.stage) {
    case 'checking': return 'prompt';
    case 'options': return state.questionIndex === 0 ? 'recipient' : 'funding';
    case 'moving':
    case 'funding': return 'answered';
    case 'review':
    case 'editing': return 'confirmation';
    case 'confirming': return state.funding === 'swap' ? 'swap' : state.funding === 'card' ? 'buy' : 'consolidate';
    case 'sending': return 'progress';
    case 'sent': return null;
    case 'cancelled': return null;
  }
}


// The send scenario's narration: its recorded clip for the current stage.
// Transfer clips start the send when they finish; the in-progress clip holds
// the send open for its own length.
export function sendNarration(state: SendState, dispatch: (action: SendAction) => void): NarrationLine | null {
  const cue = cueFor(state);
  if (!cue) return null;
  return {
    key: cue, clip: clips[cue],
    ...(cue === 'progress' ? { onPlaying: (ms: number) => dispatch({ type: 'holdSending', ms }) } : {}),
    ...(isTransferCue(cue) ? { onEnd: () => dispatch({ type: 'beginSending' }), onFail: () => dispatch({ type: 'narrationFailed' }) } : {}),
  };
}
