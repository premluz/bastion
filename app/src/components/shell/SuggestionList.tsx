import { Icon } from '@astryxdesign/core/Icon';
import { Item } from '@astryxdesign/core/Item';
import { ArrowTrendingUpIcon, BanknotesIcon, BuildingLibraryIcon, ChartPieIcon, ChevronRightIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline';
import { AGENT_SUGGESTIONS } from '../../engine/agentAgenda';
import type { PULSE_ITEMS } from '../../engine/attentionQueue';
import '../../theme/agent-dock.css';
import styles from './SuggestionList.module.css';

// The list itself lives with the agenda (engine/agentAgenda.ts), so what the home
// suggests and what the agent goes over in voice mode are one list.
const ICONS = { mortgage: BuildingLibraryIcon, positions: ArrowTrendingUpIcon, 'payment-request': UserIcon, portfolio: ChartPieIcon,
  'portfolio-gain': ChartPieIcon, subscriptions: CreditCardIcon, 'idle-cash': BanknotesIcon } as const;

type Suggestion = (typeof AGENT_SUGGESTIONS)[number] | (typeof PULSE_ITEMS)[number];

export interface SuggestionListProps {
  /** Hands a suggestion to the assistant as the user's turn: shown as `text`, run as `prompt`. */
  onSuggestion: (text: string, prompt: string) => void;
  /** Extra class on the list, for a caller that animates its rows. */
  className?: string | undefined;
  /** The rows; the home's agenda unless given (the attention home's Pulse, 2026-10-23). */
  items?: readonly Suggestion[];
  /** `card` wraps the rows in the cards' raised surface (2026-10-23, the attention home's Pulse). `list` is a flat white
   *  surface with hairline dividers, plain icons and a chevron on every row (2026-10-30, the home's insights). */
  variant?: 'plain' | 'card' | 'list';
}

export function SuggestionList({ onSuggestion, className, items = AGENT_SUGGESTIONS, variant = 'plain' }: SuggestionListProps) {
  return (
    <div className={className ? `${styles.list} ${className}` : styles.list} data-variant={variant}>
      {items.map((suggestion) => (
        <Item key={suggestion.id} className={styles.item} label={suggestion.text} labelLines={2}
          {...('action' in suggestion ? { description: suggestion.action } : {})}
          onClick={() => onSuggestion(suggestion.text, 'prompt' in suggestion ? suggestion.prompt : suggestion.text)}
          startContent={<span className={styles.icon}><Icon icon={ICONS[suggestion.id]} size="md" /></span>}
          {...(variant === 'list' ? { endContent: <Icon icon={ChevronRightIcon} size="sm" color="secondary" /> } : {})} />
      ))}
    </div>
  );
}
