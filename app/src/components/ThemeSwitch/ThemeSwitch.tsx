import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';

const THEME_VALUES = ['default', 'ops-dark', 'glass', 'glass-light', 'safe-one', 'bastion', 'bastion-light', 'bastion-aura', 'bastion-aura-light', 'bastion-pastel'] as const;

export type Theme = (typeof THEME_VALUES)[number];

export type ThemeSwitchProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function isTheme(value: string): value is Theme {
  return (THEME_VALUES as readonly string[]).includes(value);
}

export function ThemeSwitch({ theme, onThemeChange }: ThemeSwitchProps) {
  return (
    <SegmentedControl
      label="Theme"
      value={theme}
      onChange={(value) => {
        if (isTheme(value)) {
          onThemeChange(value);
        }
      }}
    >
      <SegmentedControlItem value="default" label="Default" />
      <SegmentedControlItem value="ops-dark" label="Ops Dark" />
      <SegmentedControlItem value="glass" label="Glass" />
      <SegmentedControlItem value="glass-light" label="Glass Light" />
      <SegmentedControlItem value="safe-one" label="SAFE ONE" />
      <SegmentedControlItem value="bastion" label="Bastion" />
      <SegmentedControlItem value="bastion-light" label="Bastion Light" />
      <SegmentedControlItem value="bastion-aura" label="Aura" />
      <SegmentedControlItem value="bastion-aura-light" label="Aura Light" />
      <SegmentedControlItem value="bastion-pastel" label="Pastel" />
    </SegmentedControl>
  );
}
