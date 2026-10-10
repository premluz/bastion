import { Icon } from '@astryxdesign/core/Icon';
import { Item } from '@astryxdesign/core/Item';
import { Text } from '@astryxdesign/core/Text';
import { ArrowTrendingUpIcon, BuildingLibraryIcon, ChartPieIcon, UserIcon } from '@heroicons/react/24/outline';
import { resolveAssetsHomeSummary } from '../../engine/assetsHome';
import { AGENT_SUGGESTIONS } from '../../engine/agentAgenda';
import { AssetsHomeHeader } from './AssetsHomeHeader';
import { HomePromos } from './HomePromos';
import homeStyles from './AssetsHomePage.module.css';
import styles from './AgentHomePage.module.css';

// The list itself lives with the agenda (engine/agentAgenda.ts), so what the
// home suggests and what the agent goes over in voice mode are one list.
const ICONS = { mortgage: BuildingLibraryIcon, positions: ArrowTrendingUpIcon, 'payment-request': UserIcon, portfolio: ChartPieIcon } as const;

export interface AgentHomePageProps {
  onSelectMoney?: () => void;
  onSelectInvestments?: () => void;
  /** Hands this suggestion to the assistant as the user's turn: shown as `text`, run as `prompt`. */
  onSuggestion: (text: string, prompt: string) => void;
  /** The assistant has a request to work on: the contents fade out, bottom-up. */
  isReceding?: boolean;
}

// The agent-first home (2026-10-09): same balance and promos as the assets
// home, but the coin list gives way to what the assistant suggests looking
// at next. A suggestion is a request: it wakes the assistant on it.
export function AgentHomePage({ onSelectMoney, onSelectInvestments, onSuggestion, isReceding = false }: AgentHomePageProps) {
  const summary = resolveAssetsHomeSummary();
  return (
    <div className={`${homeStyles.root} ${styles.root}`} data-receding={isReceding ? '' : undefined} inert={isReceding}>
      <div className={homeStyles.body}>
        <div className={`${homeStyles.cardStack} ${styles.top}`}>
          <AssetsHomeHeader totalValue={summary.totalValue} changeAbs={summary.changeAbs} changePercent={summary.changePercent}
            {...(onSelectMoney ? { onSelectMoney } : {})} {...(onSelectInvestments ? { onSelectInvestments } : {})} />
          <HomePromos variant="bleed" />
        </div>
        <section className={styles.suggestions} aria-labelledby="agent-suggestions-title">
          <Text type="body" as="h2" id="agent-suggestions-title" className={styles.title}>Would you like to review those?</Text>
          <div className={styles.pane}>
            {AGENT_SUGGESTIONS.map((suggestion) => (
              <Item key={suggestion.id} className={styles.item} label={suggestion.text} labelLines={2}
                onClick={() => onSuggestion(suggestion.text, 'prompt' in suggestion ? suggestion.prompt : suggestion.text)}
                startContent={<span className={styles.icon}><Icon icon={ICONS[suggestion.id]} size="md" /></span>} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
