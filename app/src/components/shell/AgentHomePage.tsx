import type { ReactNode } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { resolveAssetsHomeSummary } from '../../engine/assetsHome';
import { greetingFor, USER_FIRST_NAME } from './greeting';
import { AssetsHomeHeader } from './AssetsHomeHeader';
import { HomePromos } from './HomePromos';
import { SuggestionList } from './SuggestionList';
import '../../theme/balance-glass.css';
import homeStyles from './AssetsHomePage.module.css';
import styles from './AgentHomePage.module.css';

export interface AgentHomePageProps {
  onSelectMoney?: () => void;
  onSelectInvestments?: () => void;
  /** Hands this suggestion to the assistant as the user's turn: shown as `text`, run as `prompt`. */
  onSuggestion: (text: string, prompt: string) => void;
  /** The assistant has a request to work on: the contents fade out, bottom-up. */
  isReceding?: boolean;
  /** The banner runs behind the whole hero (balance and tiles too), with no top texture. */
  heroBleed?: boolean;
  /** Takes the suggestions' place: the attention home's queue (2026-10-23). */
  attention?: ReactNode;
}

// The agent-first home (2026-10-09): same balance and promos as the assets
// home, but the coin list gives way to what the assistant suggests looking
// at next. A suggestion is a request: it wakes the assistant on it.
export function AgentHomePage({ onSelectMoney, onSelectInvestments, onSuggestion, isReceding = false, heroBleed = false, attention }: AgentHomePageProps) {
  const summary = resolveAssetsHomeSummary();
  return (
    <div className={`${homeStyles.root} ${styles.root}`} data-receding={isReceding ? '' : undefined} data-hero={heroBleed ? '' : undefined}
      data-attention={attention ? '' : undefined} inert={isReceding}>
      <div className={homeStyles.body}>
        <div className={`${homeStyles.cardStack} ${styles.top}`}>
          <AssetsHomeHeader totalValue={summary.totalValue} changeAbs={summary.changeAbs} changePercent={summary.changePercent}
            {...(onSelectMoney ? { onSelectMoney } : {})} {...(onSelectInvestments ? { onSelectInvestments } : {})} />
          <HomePromos variant="bleed" ctaSize={attention ? 'lg' : 'sm'} />
        </div>
        {attention ?? <section className={styles.suggestions} aria-labelledby="agent-suggestions-title">
          <Text type="body" as="h2" id="agent-suggestions-title" className={styles.title}>
            {greetingFor(new Date().getHours())} {USER_FIRST_NAME}, would you like to review those?
          </Text>
          <SuggestionList className={styles.pane} onSuggestion={onSuggestion} />
        </section>}
      </div>
    </div>
  );
}
