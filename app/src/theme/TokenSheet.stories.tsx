import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeSwitch, isTheme, type Theme } from '../components/ThemeSwitch/ThemeSwitch';

const SURFACES = ['surface-0', 'surface-1', 'surface-2', 'surface-3'] as const;
const INK = ['ink-primary', 'ink-secondary', 'ink-muted'] as const;
const ACCENTS = ['accent-signal', 'accent-alert', 'accent-warn', 'accent-ok'] as const;

function Swatch({ token }: { token: string }) {
  return (
    <div
      style={{
        background: `var(--${token})`,
        color: 'var(--ink-primary)',
        padding: 'var(--space-16)',
        borderRadius: 'var(--radius-8)',
        fontFamily: 'var(--font-ui)',
        fontSize: 'var(--text-13)',
      }}
    >
      {token}
    </div>
  );
}

function TokenSheet({ initialTheme = 'default' }: { initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div
      data-testid="token-sheet"
      style={{ display: 'grid', gap: 'var(--space-24)', padding: 'var(--space-24)' }}
    >
      <ThemeSwitch theme={theme} onThemeChange={setTheme} />
      <section style={{ display: 'grid', gap: 'var(--space-8)', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {SURFACES.map((token) => (
          <Swatch key={token} token={token} />
        ))}
      </section>
      <section style={{ display: 'grid', gap: 'var(--space-8)' }}>
        {INK.map((token) => (
          <div
            key={token}
            style={{ color: `var(--${token})`, fontFamily: 'var(--font-ui)', fontSize: 'var(--text-13)' }}
          >
            {token}
          </div>
        ))}
      </section>
      <section style={{ display: 'grid', gap: 'var(--space-8)', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {ACCENTS.map((token) => (
          <Swatch key={token} token={token} />
        ))}
      </section>
    </div>
  );
}

const meta: Meta<typeof TokenSheet> = {
  title: 'Theme/Token Sheet',
  component: TokenSheet,
  render: (_args, context) => {
    const globalTheme = context.globals.theme;
    const initialTheme = typeof globalTheme === 'string' && isTheme(globalTheme) ? globalTheme : 'default';
    return <TokenSheet initialTheme={initialTheme} />;
  },
};

export default meta;
type Story = StoryObj<typeof TokenSheet>;

export const Default: Story = {};
