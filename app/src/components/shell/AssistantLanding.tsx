import { LandingMonolith } from './LandingMonolith';
import { SuggestionList } from './SuggestionList';
import { USER_FIRST_NAME } from './greeting';
import '../../theme/agent-dock.css';
import '../../theme/glow-dock.css';
import styles from './AssistantLanding.module.css';

export interface AssistantLandingProps {
  /** The composer is open: the landing is in place, its welcome and suggestions arrive. */
  isOpen: boolean;
  /** A first question has been asked: the welcome and list step aside (and the orb sinks, in GlowDock). */
  isAway: boolean;
  onSuggestion: (text: string, prompt: string) => void;
  /** The Bastion monolith above the welcome, assembling as the landing opens (the plasma orb's place). */
  monolith?: boolean;
}

// The assistant's landing screen (2026-10-14, direct feedback): reached by sliding up
// from any page — a welcome over the orb, and the same suggestions as the home. Both
// arrive on the page recede's own stagger (2026-10-23, direct feedback: much earlier, the
// welcome and the suggestions nearly together). See AssistantLanding.module.css.
export function AssistantLanding({ isOpen, isAway, onSuggestion, monolith = false }: AssistantLandingProps) {
  return (
    <div className={styles.landing} data-open={isOpen ? '' : undefined} data-away={isAway ? '' : undefined}>
      <div className={styles.orbSlot}>{monolith && <LandingMonolith isOpen={isOpen} isAway={isAway} />}</div>
      <p className={styles.welcome}>Hey {USER_FIRST_NAME}, <strong>How can I help?</strong></p>
      <SuggestionList className={styles.list} onSuggestion={onSuggestion} />
    </div>
  );
}
