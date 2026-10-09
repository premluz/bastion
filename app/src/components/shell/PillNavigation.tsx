import { Fragment, type Ref } from 'react';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { HomeIcon, MagnifyingGlassIcon, WalletIcon, SparklesIcon, PlusIcon,
  BanknotesIcon, ArrowUpRightIcon, ArrowDownLeftIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { DockMenu, type DockMenuItem } from './DockMenu';
import '../../theme/pill-navigation.css';
import styles from './PillNavigation.module.css';

const destinations = [
  { id: 'home', label: 'Home', icon: HomeIcon }, { id: 'explore', label: 'Explore', icon: MagnifyingGlassIcon },
  { id: 'assets', label: 'Assets', icon: WalletIcon }, { id: 'assistant', label: 'Assistant', icon: SparklesIcon },
] as const;
export const QUICK_ACTIONS = [
  { id: 'add-cash', label: 'Add cash', icon: BanknotesIcon, isPrototype: true }, { id: 'send', label: 'Send', icon: ArrowUpRightIcon, isPrototype: true },
  { id: 'receive', label: 'Receive', icon: ArrowDownLeftIcon, isPrototype: true }, { id: 'trade', label: 'Trade', icon: ArrowsRightLeftIcon, isPrototype: true },
] as const satisfies readonly DockMenuItem[];
export const PLUS_TRIGGER_ICON = <span className={styles.plus}><Icon icon={PlusIcon} size="lg" /></span>;
export type PillDestination = (typeof destinations)[number]['id'];
export type PillAction = (typeof QUICK_ACTIONS)[number]['id'];
const isPillAction = (id: string): id is PillAction => QUICK_ACTIONS.some((action) => action.id === id);

export interface PillNavigationProps {
  assistantRef?: Ref<HTMLButtonElement>;
  // Still meaningful even though the composer's own UI now lives in a
  // separate full-screen overlay (ComposerModeOverlay.tsx, 2026-09-16
  // follow-up) — drives the dock's own halo glow and the nav pill's
  // fade-out, both real visual cues that composer mode is active
  // elsewhere on screen.
  isComposerOpen?: boolean;
  activeItem: PillDestination; onNavigate: (destination: PillDestination) => void;
  isActionsOpen: boolean; onActionsOpenChange: (open: boolean) => void; onAction: (action: PillAction) => void;
}

export function PillNavigation({ activeItem, onNavigate, isActionsOpen, onActionsOpenChange, onAction, isComposerOpen = false, assistantRef }: PillNavigationProps) {
  return <Fragment>
    {/* Modal scrim, not alpha-dimming the nav itself (2026-09-16, direct
        feedback: "the menu when opened via + in the nav sets alpha
        opacity on nav but actually should put scrim, so should be modal
        that popover, undo alpha") — the quick-actions popover is a real
        modal-feeling surface: content behind it dims, the nav pill
        stays fully visible/undimmed on top (it's the thing that opened
        the menu, not part of what's being backgrounded). A sibling of
        .dock (not nested inside it) so its own absolute inset:0 resolves
        against .chrome — the true full-phone containing block — rather
        than .dock's own bottom-anchored, intrinsic-height box, which
        would only cover the dock's own band. Click dismisses the
        popover, same as the existing outside-click behavior Popover's
        own onOpenChange already wires up — this just gives that
        dismissal a visible surface to click, rather than relying on an
        invisible "anywhere outside" hit-test. */}
    {isActionsOpen && <button type="button" className={styles.scrim} aria-hidden="true" tabIndex={-1}
      onClick={() => onActionsOpenChange(false)} />}
    <div className={styles.dock} data-composer-open={isComposerOpen}>
    <div className={styles.root} data-open={isActionsOpen} data-testid="pill-navigation">
    <nav className={styles.pill} aria-label="Pill navigation" inert={isActionsOpen}>
      <span className={styles.track} aria-hidden="true"><span className={styles.indicator} data-active={activeItem}>
        <span key={activeItem} className={styles.highlight} />
      </span></span>
      {destinations.map(({ id, label, icon }) => <IconButton key={id} label={label} variant="ghost" className={styles.destination}
        {...(id === 'assistant' && assistantRef ? { ref: assistantRef } : {})}
        icon={<Icon icon={icon} size="lg" />} aria-current={activeItem === id ? 'page' : undefined} onClick={() => onNavigate(id)} />)}
    </nav>
    <DockMenu label="Quick actions" items={QUICK_ACTIONS} isOpen={isActionsOpen} onOpenChange={onActionsOpenChange}
      onSelect={(id) => { if (isPillAction(id)) onAction(id); }} triggerIcon={PLUS_TRIGGER_ICON} alignment="end" />
    </div>
    </div>
  </Fragment>;
}
