import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Avatar } from '@astryxdesign/core/Avatar';

interface ProfileMenuProps {
  isCollapsed: boolean;
  onNewInvestigation: () => void;
}

// Sidebar footer control, next to NotificationBell in footerIcons.
// Chevron-triggered context menu (expanded) collapses to an icon-only
// avatar (collapsed) — same DropdownMenu instance, only its trigger
// button config changes, so both states stay in sync automatically
// rather than being two separately-authored components. No real
// account/settings system exists in this prototype (architect-confirmed,
// not assumed): the menu holds a static "Analyst" section header plus
// one real, already-existing action (session reset) — nothing invented.
export function ProfileMenu({ isCollapsed, onNewInvestigation }: ProfileMenuProps) {
  return (
    <DropdownMenu
      button={{
        label: 'Analyst',
        icon: <Avatar name="Analyst" size="small" />,
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
