import type { PaymentCardProps } from '../../contracts/props/payment-card';
import { buildTopUpScene } from '../../engine/mortgageTopUpScenes';
import type { TopUpAction, TopUpState } from '../../engine/mortgageTopUpState';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import styles from './SendMoneyTranscript.module.css';

// The mortgage top-up in the thread: its scene for the current stage, with
// the same delegated data-attribute listeners the send flow uses (§2.7).
export function TopUpTranscript({ state, presentation, voice, dispatch }: {
  state: TopUpState; presentation: PaymentCardProps['presentation']; voice: boolean; dispatch: (action: TopUpAction) => void;
}) {
  return <section aria-label="Mortgage top-up" data-top-up-stage={state.stage} className={styles.root}
    onChange={(event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const question = event.target.closest('[data-approval-card]');
      const choice = question?.getAttribute('data-approval-value');
      if (question?.getAttribute('data-approval-card') === 'top-up-source' && (choice === 'money' || choice === 'usdc'))
        dispatch({ type: 'source', value: choice, advance: voice });
      const field = event.target.closest('[data-payment-field]')?.getAttribute('data-payment-field');
      if (field === 'amount' || field === 'purpose') dispatch({ type: 'change', field, value: event.target.value });
    }} onClick={(event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('[data-approval-action]')?.getAttribute('data-approval-action') === 'continue') dispatch({ type: 'continue' });
      const type = event.target.closest('[data-payment-action]')?.getAttribute('data-payment-action');
      if (type === 'accept' || type === 'edit' || type === 'save' || type === 'cancel') dispatch({ type });
    }}>
    <SceneRenderer scene={buildTopUpScene(state, presentation, voice)} />
  </section>;
}
