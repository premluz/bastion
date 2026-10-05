import { useState } from 'react';
import { Text } from '@astryxdesign/core/Text';
import styles from './WalletTabSwitch.module.css';

export interface WalletTabSwitchItem { id: string; label: string }
export interface WalletTabSwitchProps<T extends string> {
  items: readonly WalletTabSwitchItem[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

// Same sliding-highlight interaction as the main pill nav (2026-09-16,
// direct feedback: "on changing tabs (money/investments in portfolio) we
// need same interaction animation as on main menu") — PillNavigation's
// own track/indicator/highlight mechanism (PillNavigation.module.css),
// generalized here to N equal-width items instead of a fixed 4, since
// Astryx's own SegmentedControl (used until now) has no shared-highlight
// concept at all: its selected item merely swaps its own background/
// shadow in place, no indicator element travels between positions.
// key={value} on .highlight replays the squash-stretch keyframe on every
// switch, exactly like PillNavigation's own <span key={activeItem}>.
export function WalletTabSwitch<T extends string>({ items, value, onChange, label }: WalletTabSwitchProps<T>) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === value));
  const [hasSwitched, setHasSwitched] = useState(false);
  return (
    <div className={styles.root} role="tablist" aria-label={label} data-entrance="morph"
      data-switched={hasSwitched ? '' : undefined}
      style={{ '--wallet-tab-count': items.length, '--wallet-tab-active': activeIndex } as React.CSSProperties}>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.indicator}>
          <span key={value} className={styles.highlight} />
        </span>
      </span>
      {items.map((item) => (
        <button key={item.id} type="button" role="tab" aria-selected={item.id === value}
          className={styles.tab} onClick={() => { setHasSwitched(true); onChange(item.id as T); }}>
          <Text type="body" weight={item.id === value ? 'semibold' : 'medium'}>{item.label}</Text>
        </button>
      ))}
    </div>
  );
}
