import { useMemo } from 'react';
import { Grid } from '@astryxdesign/core/Grid';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { StatusTag } from '../nodes/StatusTag';
import marketPulseJson from '../../../universe/marketPulse.json';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { submitQuery } from '../../engine/submitQuery';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { PageShell } from './PageShell';

interface MarketPulseCard {
  id: string;
  headline: string;
  stake: string;
  intent: string;
  module: string;
  persona?: 'analyst' | 'risk-officer';
}

const cards = Object.values(marketPulseJson as Record<string, MarketPulseCard & { featured: boolean }>);

// Page (Phase 8I, content corrected same day) — the agent's own
// surfaced-but-not-yet-investigated observations, authored per-session
// (not live-generated). A card is a signal, not a capability: headline
// (what happened, past tense, specific) + stake (why it matters) —
// never an action description. What-needs-action lives in the assembled
// investigation's own recommendation node, not the card
// (node-vocabulary.md Shell section, verbatim law). `persona` is
// data-ready only — no filtering reads it yet.
// Register law (node-vocabulary.md Shell section, verbatim): Surfaced
// and Investigated never share a row style. Surfaced: headline in the UI
// face, stake in the voice face (principle 2's "agent's interpretive
// prose" register — this IS agent-authored prose with no evidence
// behind it yet, the same class text-block/recommendation already own).
// Investigated: gains a leading document icon and an "Investigated" tag
// (ArtifactCard's own visual language, Phase 8B WO-2), stake drops to
// plain UI/data-face text — the same structural shift a card would get
// once it actually has a trail. A card stays here forever once
// surfaced — "still lives in Market Pulse, it's a record of what was
// surfaced" — clicking an investigated card opens its artifact instead
// of re-asking the same question.
export function MarketPulsePage() {
  const turns = useSessionStore((state) => state.turns);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const setPage = usePageStore((state) => state.setPage);
  const resolver = useMemo(() => createKeywordResolver(), []);

  const artifactRefByIntent = useMemo(() => {
    const map = new Map<string, string>();
    for (const turn of turns) {
      if (turn.status === 'resolved' && turn.artifactRef) map.set(turn.utterance, turn.artifactRef);
    }
    return map;
  }, [turns]);

  // Starting a new investigation (a surfaced card, no artifact yet) is the
  // same event as submitting a query from Home or LandingState — it must
  // land on Home so the user actually sees the turn appear and the trail
  // play, not just an artifact silently landing in the global stack while
  // they're still looking at this page's card grid. Re-opening an
  // already-investigated card's own result doesn't need to leave Market
  // Pulse — the stack is global, it's already visible from here.
  function handleClick(card: MarketPulseCard) {
    const artifactRef = artifactRefByIntent.get(card.intent);
    if (artifactRef) {
      setOpenArtifact(artifactRef);
    } else {
      setPage('home');
      void submitQuery(card.intent, resolver);
    }
  }

  return (
    <PageShell title="Market Pulse">
      {cards.length === 0 ? (
        <EmptyState title="Nothing surfaced yet" description="The agent hasn't flagged anything new this session." />
      ) : (
        <Grid columns={{ minWidth: 240, max: 3 }} gap={3}>
          {cards.map((card) => {
            const artifactRef = artifactRefByIntent.get(card.intent);
            const isInvestigated = !!artifactRef;
            return (
              <ClickableCard
                key={card.id}
                label={isInvestigated ? `Open ${card.headline}` : card.headline}
                variant="muted"
                padding={3}
                onClick={() => handleClick(card)}
              >
                {isInvestigated ? (
                  <HStack gap={2} vAlign="center" width="100%">
                    <Icon icon="viewColumns" size="md" color="secondary" />
                    <StackItem size="fill">
                      <VStack gap={0.5}>
                        <Text type="label" weight="semibold">
                          {card.headline}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {card.stake}
                        </Text>
                      </VStack>
                    </StackItem>
                    <StatusTag label="Investigated" tone="ok" />
                  </HStack>
                ) : (
                  <VStack gap={0.5}>
                    <Text type="label" weight="semibold">
                      {card.headline}
                    </Text>
                    <Text type="supporting" color="secondary" style={{ fontFamily: 'var(--face-voice)' }}>
                      {card.stake}
                    </Text>
                  </VStack>
                )}
              </ClickableCard>
            );
          })}
        </Grid>
      )}
    </PageShell>
  );
}
