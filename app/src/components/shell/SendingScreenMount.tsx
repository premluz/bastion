import { dollars, type SendAction, type SendState } from '../../engine/sendMoneyState';
import { recipientName } from '../../engine/sendMoneyQuestions';
import { SendingScreen } from './SendingScreen';

// Drop images here (app/public/avatars/<id>.png); Avatar shows initials
// until a file exists or if it fails to load.
const avatarSrc = (id: string) => `/avatars/${id}.png`;
const SENDER = { name: 'Preview user', src: avatarSrc('me') };
const isShowing = (flow: SendState) => flow.stage === 'sending' || (flow.stage === 'sent' && !flow.acknowledged);
export const isSendingScreenOpen = (flows: Record<number, SendState>) => Object.values(flows).some(isShowing);

// Mounted once at shell level, not inside the transcript: the transcript
// renders in several overlays at once, and only one modal may open.
export function SendingScreenMount({ flows, dispatch }: {
  flows: Record<number, SendState>;
  dispatch: (id: number, action: SendAction) => void;
}) {
  const entry = Object.entries(flows).find(([, flow]) => isShowing(flow));
  if (!entry) return null;
  const [key, flow] = entry;
  const id = Number(key);
  return <SendingScreen phase={flow.stage === 'sending' ? 'processing' : 'success'} amount={`$${dollars(flow.amountCents)}`}
    sender={SENDER} recipient={{ name: recipientName(flow) }}
    onCancel={() => dispatch(id, { type: 'cancel' })} onDone={() => dispatch(id, { type: 'done' })} />;
}
