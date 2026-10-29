import type { PaymentCardProps } from '../../contracts/props/payment-card';
import { buildPaymentRequestScene } from '../../engine/paymentRequestScenes';
import type { PaymentRequestAction, PaymentRequestState } from '../../engine/paymentRequestState';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import styles from './SendMoneyTranscript.module.css';

// The payment request in the thread: its scene for the current stage, with the same delegated
// data-attribute listener the other flows use (§2.7). Nothing to choose, so only the card's Confirm and Cancel.
export function PaymentRequestTranscript({ state, presentation, dispatch }: {
  state: PaymentRequestState; presentation: PaymentCardProps['presentation']; dispatch: (action: PaymentRequestAction) => void;
}) {
  return <section aria-label="Payment request" data-payment-request-stage={state.stage} className={styles.root}
    onClick={(event) => {
      if (!(event.target instanceof Element)) return;
      const type = event.target.closest('[data-payment-action]')?.getAttribute('data-payment-action');
      if (type === 'accept' || type === 'cancel') dispatch({ type });
    }}>
    <SceneRenderer scene={buildPaymentRequestScene(state, presentation)} />
  </section>;
}
