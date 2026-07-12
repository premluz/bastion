import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SceneRenderer } from './SceneRenderer';
import { SceneSchema } from '../contracts/scene';
import { hydrateScene, loadUniverse } from '../contracts/hydrate';
import assetDiscovery from '../../scenes/asset-discovery.scene.json';

const universe = loadUniverse();

function parseAndHydrate(text: string) {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    return { error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}` } as const;
  }

  const parsed = SceneSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    return { error: `Invalid Scene: ${issues.join('; ')}` } as const;
  }

  return { scene: hydrateScene(parsed.data, universe) } as const;
}

function Playground() {
  const [text, setText] = useState(() => JSON.stringify(assetDiscovery, null, 2));
  const result = useMemo(() => parseAndHydrate(text), [text]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', height: '100vh' }}>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--text-12)',
          background: 'var(--surface-1)',
          color: 'var(--ink-primary)',
          border: '1px solid var(--edge)',
          borderRadius: 'var(--radius-8)',
          padding: 'var(--space-12)',
          resize: 'none',
        }}
      />
      <div style={{ overflow: 'auto', padding: 'var(--space-16)' }}>
        {'error' in result ? (
          <div style={{ color: 'var(--accent-alert)', fontFamily: 'var(--font-data)', fontSize: 'var(--text-13)' }}>
            {result.error}
          </div>
        ) : (
          <SceneRenderer scene={result.scene} />
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof Playground> = {
  title: 'Renderer/Playground',
  component: Playground,
};
export default meta;
type Story = StoryObj<typeof Playground>;

export const Default: Story = {};
