import { Button } from '@astryxdesign/core/Button';
import { ChatMessage } from '@astryxdesign/core/Chat';
import { Text } from '@astryxdesign/core/Text';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import { buildSendQuestionScene, buildSendTransferScene } from '../../engine/sendMoneyConversation';
import { displayDollars, dollars, type SendState, type SendAction, type SendInteractionMode } from '../../engine/sendMoneyState';
import { recipientName } from '../../engine/sendMoneyQuestions';
import type { PaymentCardProps } from '../../contracts/props/payment-card';
import styles from './SendMoneyTranscript.module.css';

export function SendMoneyTranscript({ state, presentation, interactionMode, dispatch }: {
  state: SendState; presentation: PaymentCardProps['presentation']; interactionMode: SendInteractionMode; dispatch: (action: SendAction) => void;
}) {
  return <section aria-label="Send money conversation" data-send-stage={state.stage} className={styles.root}
    onChange={(event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const question = event.target.closest('[data-approval-card]');
      const choice = question?.getAttribute('data-approval-value');
      if (choice && question?.getAttribute('data-approval-card') === 'send-recipient') dispatch({ type: 'recipient', value: choice, advance: interactionMode === 'voice' });
      if (choice === 'consolidate' || choice === 'swap' || choice === 'card' || choice === 'other') dispatch({ type: 'choose', funding: choice, advance: interactionMode === 'voice' });
      const field = event.target.closest('[data-payment-field]')?.getAttribute('data-payment-field');
      if (field === 'amount' || field === 'purpose') dispatch({ type: 'change', field, value: event.target.value });
    }} onClick={(event) => {
      if (!(event.target instanceof Element)) return;
      const questionAction = event.target.closest('[data-approval-action]')?.getAttribute('data-approval-action');
      if (questionAction === 'previous' || questionAction === 'next' || questionAction === 'skip' || questionAction === 'continue') dispatch({ type: questionAction });
      const type = event.target.closest('[data-payment-action]')?.getAttribute('data-payment-action');
      if (type === 'accept') dispatch({ type, deferSending: interactionMode === 'voice' });
      else if (type === 'edit' || type === 'save' || type === 'cancel') dispatch({ type });
    }}>
    <SceneRenderer scene={buildSendQuestionScene(state, interactionMode)} />
    {state.stage !== 'checking' && state.stage !== 'options' && <SceneRenderer scene={buildSendTransferScene(state, presentation, interactionMode)} />}
    {state.stage === 'sent' && <div className={styles.followUp}>
      <ChatMessage sender="assistant"><Text type="body" as="p" className={styles.agentReply}>
        {displayDollars(state.amountCents)} was sent to {recipientName(state)}. Anything else, Prem?
      </Text></ChatMessage>
      <div className={styles.choices}>
        <Button label="Send message to Daniel" variant="ghost" size="sm" className={styles.choice}
          onClick={() => dispatch({ type: 'followUp', value: 'message' })} />
        <Button label="Check balance" variant="ghost" size="sm" className={styles.choice}
          onClick={() => dispatch({ type: 'followUp', value: 'balance' })} />
      </div>
      {state.followUp === 'message' && <Text role="status">Messaging Daniel is not available in this preview.</Text>}
      {state.followUp === 'balance' && <Text role="status">Main USDT balance: ${dollars(state.balanceCents)}</Text>}
    </div>}
  </section>;
}
