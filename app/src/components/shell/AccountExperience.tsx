import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFocusTrap } from '@astryxdesign/core/hooks';
import { AccountMenu } from './AccountMenu';
import { AccountSheet } from './AccountSheet';
import { AccountManagePage } from './AccountManagePage';
import { AccountAddPage } from './AccountAddPage';
import { AccountHistoryPage } from './AccountHistoryPage';
import { AccountInfoPage } from './AccountInfoPage';
import { ACCOUNT_TITLES, type AccountInitialView } from './accountTypes';
import { PREVIEW_HISTORY } from './accountPreviewData';
import { useAccountPreview } from './useAccountPreview';
import '../../theme/accounts.css';
import styles from './AccountExperience.module.css';

export function AccountExperience({ initialView = 'closed', children }: {
  initialView?: AccountInitialView; children: (open: () => void) => ReactNode;
}) {
  const state = useAccountPreview(initialView);
  const trigger = useRef<HTMLElement | null>(null);
  const [sheetPresent, setSheetPresent] = useState(state.sheetOpen);
  const close = () => { state.setMenuOpen(false); requestAnimationFrame(() => trigger.current?.focus()); };
  const active = state.menuOpen && !state.sheetOpen && !sheetPresent;
  const { containerRef, focusFirst } = useFocusTrap<HTMLDivElement>({ isActive: active, onEscape: close });
  useEffect(() => { if (active) focusFirst(); }, [active, focusFirst]);
  return <div ref={containerRef} className={styles.root} data-open={state.menuOpen}>
    <div inert={!state.menuOpen} aria-hidden={!state.menuOpen}>
      <AccountMenu name={state.account.name} onNavigate={state.navigate} />
    </div>
    <div className={styles.source} data-testid="account-source-page">
      <div className={styles.sourceBody} inert={state.menuOpen} aria-hidden={state.menuOpen}>
        {children(() => { trigger.current = document.activeElement as HTMLElement; state.setMenuOpen(true); })}
      </div>
      {state.menuOpen && <button className={styles.returnPage} aria-label="Return to previous page" onClick={close} />}
    </div>
    <AccountSheet isOpen={state.sheetOpen} title={ACCOUNT_TITLES[state.screen]} onPresenceChange={setSheetPresent}
      onClose={() => state.setSheetOpen(false)} onBack={state.back}>
      {(state.screen === 'accounts' || state.screen === 'edit') ? <AccountManagePage key={`${state.screen}-${state.account.id}`}
        accounts={state.accounts} account={state.account} screen={state.screen} navigate={state.navigate} select={state.select} update={state.update} />
      : (state.screen === 'add' || state.screen === 'setup') ? <AccountAddPage method={state.method} isSetup={state.screen === 'setup'}
        onMethod={(method) => { state.setMethod(method); state.navigate('setup'); }} onCreate={state.create} />
      : state.screen === 'history' ? <AccountHistoryPage entries={PREVIEW_HISTORY.filter((item) => item.accountId === state.account.id)}
        />
      : <AccountInfoPage screen={state.screen} account={state.account} entry={state.entry} update={state.update} />}
    </AccountSheet>
  </div>;
}
