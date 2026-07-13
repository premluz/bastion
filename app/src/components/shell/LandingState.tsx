import { useMemo, useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { ChatComposer, ChatComposerInput } from '@astryxdesign/core/Chat';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Grid } from '@astryxdesign/core/Grid';
import marketPulseJson from '../../../universe/marketPulse.json';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { submitQuery } from '../../engine/submitQuery';

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

// Landing state per Astryx's ai-chat-landing template
// (.astryx-scratch/ai-chat-landing/page.tsx lines 303-322 for the
// centered greeting + composer shell, lines 450-471 for the suggestion
// cards grid) — appears only before the first turn (node-vocabulary.md
// Shell law: "the landing surface is the question, never a workspace").
// The template's category toggle (Writing/Coding/Research/Creative) is
// dropped: Merlin has exactly one "category" — real investigation
// intents — so the cards show directly, no filter step needed.
export function LandingState() {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolver = useMemo(() => createKeywordResolver(), []);

  const handleSubmit = async (submittedValue: string) => {
    if (!submittedValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await submitQuery(submittedValue, resolver);
    setValue('');
    setIsSubmitting(false);
  };

  return (
    <VStack gap={8} hAlign="center" vAlign="center" height="100%" style={{ padding: 'var(--space-24)' }}>
      <VStack gap={1} vAlign="center">
        <HStack gap={2} vAlign="center">
          <Icon icon="search" size="md" color="accent" />
          <Text type="large">Merlin</Text>
        </HStack>
        <Heading level={1}>Where should we start?</Heading>
      </VStack>

      <div style={{ width: '100%', maxWidth: 640 }}>
        <ChatComposer
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          isDisabled={isSubmitting}
          placeholder="Ask a question about the venue…"
          input={<ChatComposerInput />}
        />
      </div>

      {/* Phase 8C: "New investigation" resets the session with no confirm
          dialog — nothing persists by design, so the reassurance belongs
          here in the state you land on, not a modal at the moment of reset. */}
      <Text type="supporting" color="disabled">
        Nothing here is saved between investigations — start fresh anytime.
      </Text>

      <Grid columns={{ minWidth: 220, max: 3 }} gap={3} width="100%" maxWidth={720}>
        {SUGGESTIONS.map((suggestion) => (
          <ClickableCard
            key={suggestion.headline}
            label={suggestion.headline}
            variant="muted"
            padding={3}
            onClick={() => handleSubmit(suggestion.intent)}
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
        ))}
      </Grid>
    </VStack>
  );
}
