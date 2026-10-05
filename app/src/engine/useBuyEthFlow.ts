import { useEffect, useState } from 'react';
import type { FundingCurrency } from '../contracts/props/funding-choice';
import { fundingScene, quoteScene, FUNDING_BALANCES } from './buyEthScenes';

export type BuyEthStage = 'greeting' | 'thinking' | 'choice' | 'acknowledge' | 'price' | 'interface' | 'introduction' | 'quote' | 'confirmed';
const nextStage: Partial<Record<BuyEthStage, BuyEthStage>> = {
  greeting: 'thinking', thinking: 'choice', acknowledge: 'price', price: 'interface', interface: 'introduction', introduction: 'quote',
};
const timedStages = {
  thinking: fundingScene.thinking[0]!, price: quoteScene.thinking[0]!, interface: quoteScene.thinking[1]!,
};

export function useBuyEthFlow(amount: number) {
  const [stage, setStage] = useState<BuyEthStage>('greeting');
  const [currency, setCurrency] = useState<FundingCurrency | null>(null);
  const [choicePresent, setChoicePresent] = useState(false);
  const timed = stage === 'thinking' || stage === 'price' || stage === 'interface' ? timedStages[stage] : null;
  useEffect(() => {
    if (!timed) return;
    const timer = setTimeout(() => setStage(nextStage[stage] ?? stage), timed.durationMs);
    return () => clearTimeout(timer);
  }, [stage, timed]);
  useEffect(() => { if (stage === 'choice') setChoicePresent(true); }, [stage]);
  const advance = () => setStage((current) => nextStage[current] ?? current);
  const select = (value: FundingCurrency) => {
    const balance = FUNDING_BALANCES[value];
    if (stage !== 'choice' || typeof balance !== 'number' || amount > balance) return;
    setCurrency(value); setStage('acknowledge');
  };
  const confirm = () => { if (stage === 'quote') setStage('confirmed'); };
  return { stage, currency, choicePresent, hideChoice: () => setChoicePresent(false), advance, select, confirm, status: timed?.label };
}
