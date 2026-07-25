import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { HStack, VStack, StackItem } from '@astryxdesign/core/Layout';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { StatusTag } from '../nodes/StatusTag';
import { DocumentIcon } from './DocumentIcon';

interface ArtifactCardProps {
  title: string;
  module: string;
  onOpen: () => void;
}

// Astryx ai-chat template's document-card primitive, adopted exactly
// (.astryx-scratch/ai-chat/page.tsx lines 246-271: ClickableCard, leading
// icon, title+subtitle stack, trailing chevron) — filled with our own
// scene title + module + status instead of a document name. "Ready" is
// the only status an artifact card ever shows: it appears in the
// transcript only once its trail has completed (Phase 8B WO-1's
// artifactRef is set), so there's no in-progress state to represent here.
export function ArtifactCard({ title, module, onOpen }: ArtifactCardProps) {
  return (
    <ClickableCard label={`Open ${title}`} onClick={onOpen} variant="muted" padding={3} maxWidth={360}>
      <HStack gap={3} vAlign="center" width="100%">
        <Icon icon={DocumentIcon} size="md" color="secondary" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="label" weight="semibold">
              {title}
            </Text>
            <Text type="supporting" color="secondary">
              {module}
            </Text>
          </VStack>
        </StackItem>
        <StatusTag label="Ready" tone="ok" />
        <Icon icon="chevronRight" size="sm" color="secondary" />
      </HStack>
    </ClickableCard>
  );
}
