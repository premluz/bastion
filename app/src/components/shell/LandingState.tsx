import { useMemo, useRef, useState } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { ChatComposer, ChatComposerInput } from '@astryxdesign/core/Chat';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Grid } from '@astryxdesign/core/Grid';
import marketPulseJson from '../../../universe/marketPulse.json';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { submitQuery } from '../../engine/submitQuery';
import styles from './LandingState.module.css';
import viewport from './ChatViewport.module.css';

interface MarketPulseCard {
  headline: string;
  stake: string;
  intent: string;
  featured: boolean;
}

// Phase 8I: a 2-3 card echo of Market Pulse's own data (single source,
// two renderings) — not separately authored content. Only `featured`
// entries show here; the full set (plus anything already investigated)
// lives on the Market Pulse page. asset-discovery-refine's own intent is
// deliberately NOT featured — a follow-up query reads oddly as a
// cold-start suggestion even though it's a fine standalone Market Pulse
// card.
const SUGGESTIONS = Object.values(marketPulseJson as Record<string, MarketPulseCard>).filter((card) => card.featured);

// Reads the real, live theme value rather than guessing a duration —
// same discipline as useTextReveal.ts's own duration priming. ms only;
// every motion token in this codebase is authored in ms (tokens.base.css).
function readMs(varName: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return parseFloat(raw) || 0;
}

// Landing state per Astryx's ai-chat-landing template
// (.astryx-scratch/ai-chat-landing/page.tsx lines 303-322 for the
// centered greeting + composer shell, lines 450-471 for the suggestion
// cards grid) — appears only before the first turn (node-vocabulary.md
// Shell law: "the landing surface is the question, never a workspace").
// The template's category toggle (Writing/Coding/Research/Creative) is
// dropped: Merlin has exactly one "category" — real investigation
// intents — so the cards show directly, no filter step needed.
//
// ORDER — seamless landing→chat transition (in-repo, no phase): on
// submit (typed or a card click), the heading and cards fade + collapse
// (height, not just opacity — see LandingState.module.css's own comment
// on why opacity alone left the composer stalling mid-slide), staggered
// by card index, while the composer's own position settles to exactly
// where the real chat composer dock sits — the CSS grid engine computes
// that final position from real layout, no pixel measurement. The actual
// submitQuery call (which swaps this component out for the real
// transcript + ChatBar) is scheduled from the SAME real motion-token
// values the CSS transitions themselves use (readMs, below) — one source
// of truth, so the swap can't fire before or noticeably after the eye
// sees the motion finish.
export function LandingState() {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const resolver = useMemo(() => createKeywordResolver(), []);
  const upperRef = useRef<HTMLDivElement>(null);

  const commit = (submittedValue: string) => {
    void submitQuery(submittedValue, resolver).then(() => {
      setValue('');
      setIsSubmitting(false);
    });
  };

  const beginTransition = (submittedValue: string) => {
    if (!submittedValue.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const exitMs = readMs('--motion-exit-duration');
    const staggerMs = readMs('--motion-assembly-stagger');
    const cardsTailMs = exitMs + staggerMs * Math.max(0, SUGGESTIONS.length - 1);
    const totalMs = Math.max(cardsTailMs, exitMs);

    // Imperative custom-property priming (useTextReveal.ts's own
    // precedent), not a JSX style object — the value must land on the
    // DOM node before the .collapsing class is added in the same tick.
    const upper = upperRef.current;
    upper?.style.setProperty('--collapse-duration', `${totalMs}ms`);
    setIsCollapsing(true);

    // The actual commit is sequenced off .upper's own real
    // grid-template-rows transitionend, not the computed totalMs itself
    // (a real, measured discrepancy — a plain setTimeout at totalMs fired
    // ~25px before the CSS engine's own last painted frame, a small but
    // genuine seam) — same "onAnimationEnd, not a guessed timeout"
    // discipline assembly.css's own reveal effect already follows.
    if (!upper) {
      commit(submittedValue);
      return;
    }
    const onDone = (event: TransitionEvent) => {
      if (event.propertyName !== 'grid-template-rows' || event.target !== upper) return;
      upper.removeEventListener('transitionend', onDone);
      commit(submittedValue);
    };
    upper.addEventListener('transitionend', onDone);
  };

  return (
    <div className={styles.root}>
      <div ref={upperRef} className={isCollapsing ? `${styles.upper} ${styles.collapsing}` : styles.upper}>
        <div />
        <div className={styles.group}>
          <div className={styles.collapseWrap}>
            <div className={styles.fade}>
              <Heading level={1}>Where should we start?</Heading>
            </div>
          </div>

          <div className={viewport.viewport}>
            <ChatComposer
              value={value}
              onChange={setValue}
              onSubmit={beginTransition}
              isDisabled={isSubmitting}
              placeholder="Ask a question about the venue…"
              input={<ChatComposerInput />}
            />
          </div>

          <div className={styles.collapseWrap}>
            {/* gap={4} (16px): ratified page-section/card-grid gap
                (node-vocabulary.md Shell section, 2026-08-10) — this grid
                is the landing echo of Market Pulse's own card grid (Phase
                8I), which uses the same ratified gap; found+fixed via
                merlin-layout-law's sweep (2026-08-13), was gap={3}/12px.
                minWidth re-derived for the new gap, not left at its old
                value: at gap={4} (16px) and the shared 680px cap, 3
                columns need 3*minWidth + 2*16 <= 680 → minWidth <= 216.
                210 leaves the same kind of real margin below the
                threshold (662 total) that the original 200-vs-220 case
                did, confirmed live via computed grid-template-columns
                before picking it, not guessed. */}
            <Grid columns={{ minWidth: 210, max: 3 }} gap={4} width="100%" maxWidth={680}>
              {SUGGESTIONS.map((suggestion, index) => (
                <div key={suggestion.headline} className={styles.fade} style={{ transitionDelay: `calc(var(--motion-assembly-stagger) * ${index})` }}>
                  {/* panelFlat (Panel.tsx's own class, theme files) —
                      transparent background + edge-only border, no
                      elevation at rest, consistent with RelatedEntitiesStrip.tsx
                      and MarketPulsePage.tsx's same reuse (direct
                      feedback, 2026-08-02). */}
                  <ClickableCard
                    label={suggestion.headline}
                    variant="default"
                    className="panelFlat"
                    padding={3}
                    isDisabled={isSubmitting}
                    onClick={() => beginTransition(suggestion.intent)}
                  >
                    <VStack gap={0.5}>
                      <Text type="label" weight="semibold">
                        {suggestion.headline}
                      </Text>
                      {/* Surfaced register (node-vocabulary.md Shell section,
                          Phase 8I): agent-authored, no evidence yet — the voice
                          face, same as Market Pulse's own un-investigated cards.
                          A card is a signal (headline + stake), never an action
                          description — the correction that renamed heading/body
                          to headline/stake. */}
                      <Text type="supporting" color="secondary" style={{ fontFamily: 'var(--face-voice)' }}>
                        {suggestion.stake}
                      </Text>
                    </VStack>
                  </ClickableCard>
                </div>
              ))}
            </Grid>
          </div>
        </div>
        <div />
      </div>
    </div>
  );
}
