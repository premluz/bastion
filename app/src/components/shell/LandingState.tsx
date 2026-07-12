import { useMemo, useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { ChatComposer, ChatComposerInput } from '@astryxdesign/core/Chat';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Grid } from '@astryxdesign/core/Grid';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { submitQuery } from '../../engine/submitQuery';

// Real fixture intents (app/scenes/manifest.json), one representative
// prompt per primary entry-point scene — asset-discovery-refine is a
// follow-up intent ("narrow to eu regulated..."), not a sensible
// cold-start suggestion, so it's excluded.
const SUGGESTIONS = [
  {
    heading: 'Screen for yield',
    body: 'Find conservative assets above a yield threshold',
    prompt: 'show me tokenized assets yielding above 6%',
  },
  {
    heading: 'Research an issuer',
    body: 'Full profile: filings, distributions, holder concentration',
    prompt: 'give me the full picture on aldergate estates',
  },
  {
    heading: 'Investigate an anomaly',
    body: 'Trace failed settlements back to their cause',
    prompt: 'why did two nordbond settlements fail this week',
  },
];

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
            key={suggestion.heading}
            label={suggestion.heading}
            variant="muted"
            padding={3}
            onClick={() => handleSubmit(suggestion.prompt)}
          >
            <VStack gap={0.5}>
              <Text type="label" weight="semibold">
                {suggestion.heading}
              </Text>
              <Text type="supporting" color="secondary">
                {suggestion.body}
              </Text>
            </VStack>
          </ClickableCard>
        ))}
      </Grid>
    </VStack>
  );
}
