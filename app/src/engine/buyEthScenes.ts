import fundingJson from '../../scenes/buy-eth-funding.scene.json';
import quoteJson from '../../scenes/buy-eth-quote.scene.json';
import { HydratedSceneSchema } from '../contracts/scene';
import { FundingCurrencySchema, type FundingCurrency } from '../contracts/props/funding-choice';
import { ApprovalCardPropsSchema } from '../contracts/props/approval-card';

export const fundingScene = HydratedSceneSchema.parse(fundingJson);
export const quoteScene = HydratedSceneSchema.parse(quoteJson);
export const FUNDING_BALANCES: Record<FundingCurrency, number> = { USDC: 812.22, USDT: 912.76 };
export const BUY_ETH_DEMO = { defaultAmount: 800, ethPerDollar: 0.0003725 } as const;
export const BUY_ETH_COPY = {
  greeting: 'Hey Prem. Let me pull up the details.',
  introduction: "Here's what that would get you:",
};

export function parseBuyEthAmount(query: string): number | null {
  if (!/\bbuy\s+(?:eth|ethereum)\b/i.test(query)) return null;
  const amount = query.match(/(?:\$\s*|\bfor\s+)(\d[\d,]*(?:\.\d{1,2})?)/i)?.[1];
  const parsed = amount ? Number(amount.replaceAll(',', '')) : BUY_ETH_DEMO.defaultAmount;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function buildFundingScene(amount: number, selected: FundingCurrency | null) {
  const props = ApprovalCardPropsSchema.parse(fundingScene.layout.props);
  return { ...fundingScene, layout: { ...fundingScene.layout, props: {
    ...props, isDisabled: Boolean(selected), ...(selected ? { selected } : {}),
    options: props.options.map((option) => {
      const balance = FUNDING_BALANCES[FundingCurrencySchema.parse(option.value)];
      const isDisabled = amount > balance;
      return { ...option, isDisabled, description: `${option.description}${isDisabled ? ' · Insufficient balance' : ''}` };
    }),
  } } };
}

export function buildQuoteScene(amount: number, currency: FundingCurrency, confirmed: boolean) {
  const values: Record<string, string> = {
    spend: `${amount.toFixed(2)} ${currency}`,
    receive: `${(amount * BUY_ETH_DEMO.ethPerDollar).toFixed(4)} ETH`,
    rate: `1 ${currency} ≈ ${BUY_ETH_DEMO.ethPerDollar} ETH`,
  };
  return { ...quoteScene, layout: { ...quoteScene.layout,
    props: { ...quoteScene.layout.props, currency },
    children: quoteScene.layout.children?.map((node) => ({ ...node, props: {
      ...node.props, ...(values[node.id] ? { value: values[node.id] } : {}), ...(node.id === 'confirm' ? { confirmed } : {}),
    } })),
  } };
}
