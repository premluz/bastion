import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Avatar } from '@astryxdesign/core/Avatar';

interface ProfileMenuProps {
  isCollapsed: boolean;
  onNewInvestigation: () => void;
}

// Sidebar's own footer row (Astryx's `footer` prop — a separate row from
// `footerIcons`, confirmed via SideNav's own source, not guessed: reported
// live that the collapse toggle and notifications bell were sharing a row
// with the avatar, which this split fixes structurally rather than with
// CSS). Chevron-triggered context menu (expanded) collapses to an
// icon-only avatar (collapsed) — same DropdownMenu instance, only its
// trigger button config changes, so both states stay in sync
// automatically rather than being two separately-authored components. No
// real account/settings system exists in this prototype
// (architect-confirmed, not assumed): the menu holds a static "Analyst"
// section header plus one real, already-existing action (session reset)
// — nothing invented. `tiny` (the smallest named Avatar size) per direct
// feedback that the default read too large for a footer row.
export function ProfileMenu({ isCollapsed, onNewInvestigation }: ProfileMenuProps) {
  return (
    <DropdownMenu
      button={{
        label: 'Analyst',
        icon: <Avatar name="Analyst" size="tiny" />,
        variant: 'ghost',
        ...(isCollapsed ? { isIconOnly: true } : {}),
      }}
      hasChevron={!isCollapsed}
      placement="above"
      items={[
        {
          type: 'section',
          title: 'Analyst',
          items: [{ label: 'New investigation', onClick: onNewInvestigation }],
        },
      ]}
    />
  );
}
