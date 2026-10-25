import { Text } from '@astryxdesign/core/Text';

export function SectionTitle({ title }: { readonly title: string }) {
  return (
    <Text type="label" weight="medium">
      {title}
    </Text>
  );
}

export const percent = (v: number): string => `${Math.round(v * 100)}%`;
