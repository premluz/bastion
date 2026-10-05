import { useEffect } from 'react';
import { ChatMessage, ChatMessageBubble } from '@astryxdesign/core/Chat';
import { Text } from '@astryxdesign/core/Text';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import { buildFundingScene, buildQuoteScene, BUY_ETH_COPY } from '../../engine/buyEthScenes';
import { useBuyEthFlow } from '../../engine/useBuyEthFlow';
import { FundingCurrencySchema } from '../../contracts/props/funding-choice';
import { StreamingReply } from './StreamingReply';
import shimmer from '../trail/ThinkingTrail.module.css';
import styles from './BuyEthConversation.module.css';

// hideQuery (2026-09-13): when this renders inline inside MobileFrame's
// own transcript, that loop has already drawn a user bubble for this very
// message — rendering a second one here would duplicate it. The standalone
// BuyEthConversation surface still shows its own, so the prop defaults off.
//
// Split in two (2026-09-13): MobileFrame mounts one transcript array in
// BOTH the composer surface and the conversation overlay, so this renders
// twice. When it owned its own useBuyEthFlow that meant two independent
// flows with two sets of timers advancing separately — caught by the
// buy-eth specs, which hit a strict-mode violation on "Thinking..."
// resolving to 2 elements. BuyEthTranscriptView takes the flow as a
// required prop so both mounts share one state and timer set; this
// wrapper owns a flow for standalone use (BuyEthConversation). Kept as
// two components rather than one optional prop because a conditional hook
// is impossible — the hook would still run, and still tick, even when a
// shared flow was passed in.
export function BuyEthTranscript({ query, amount, hideQuery = false }:
  { query: string; amount: number; hideQuery?: boolean }) {
  const flow = useBuyEthFlow(amount);
  return <BuyEthTranscriptView query={query} amount={amount} hideQuery={hideQuery} flow={flow} />;
}

export function BuyEthTranscriptView({ query, amount, hideQuery = false, flow }:
  { query: string; amount: number; hideQuery?: boolean; flow: ReturnType<typeof useBuyEthFlow> }) {
  const acknowledgement = `Perfect. You want to use your ${flow.currency} balance.`;
  useEffect(() => {
    if (flow.currency && matchMedia('(prefers-reduced-motion: reduce)').matches) flow.hideChoice();
  }, [flow.currency, flow.hideChoice]);
  return <div className={styles.transcript} data-stage={flow.stage} aria-label="ETH purchase conversation" onChange={(event) => {
    if (!(event.target instanceof Element)) return;
    const selected = FundingCurrencySchema.safeParse(event.target.closest('[data-approval-card]')?.getAttribute('data-approval-value'));
    if (selected.success) flow.select(selected.data);
  }} onClick={(event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-purchase-confirm]')) flow.confirm();
  }}>
    {!hideQuery && <ChatMessage sender="user"><ChatMessageBubble>{query}</ChatMessageBubble></ChatMessage>}
    {flow.stage === 'greeting' ? <StreamingReply text={BUY_ETH_COPY.greeting} onComplete={flow.advance} /> : <Text>{BUY_ETH_COPY.greeting}</Text>}
    {flow.currency && (flow.stage === 'acknowledge' ? <StreamingReply key="ack" text={acknowledgement} onComplete={flow.advance} /> : <Text>{acknowledgement}</Text>)}
    {flow.status && <Text key={flow.stage} className={shimmer.shimmerText} role="status">{flow.status}</Text>}
    {flow.choicePresent && <div className={styles.choice} data-leaving={Boolean(flow.currency)} inert={Boolean(flow.currency)}
      onAnimationEnd={(event) => { if (flow.currency && event.target === event.currentTarget) flow.hideChoice(); }}>
      <SceneRenderer scene={buildFundingScene(amount, flow.currency)} />
    </div>}
    {flow.stage === 'introduction' && <StreamingReply key="intro" text={BUY_ETH_COPY.introduction} onComplete={flow.advance} />}
    {(flow.stage === 'quote' || flow.stage === 'confirmed') && flow.currency && <>
      <Text>{BUY_ETH_COPY.introduction}</Text><SceneRenderer scene={buildQuoteScene(amount, flow.currency, flow.stage === 'confirmed')} />
    </>}
    {flow.stage === 'confirmed' && <Text role="status">Purchase simulated. Your real balances are unchanged.</Text>}
  </div>;
}
