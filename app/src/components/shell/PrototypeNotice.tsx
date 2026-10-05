import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react';
import { LayerProvider, Tooltip, useToast } from '@astryxdesign/core';
import styles from './PrototypeNotice.module.css';

export const PROTOTYPE_NOTICE = 'This section is not available in the prototype yet.';
const NOTICE_EVENT = 'bastion:prototype-notice';
type PrototypeNotice = () => void;
const NoticeContext = createContext<PrototypeNotice | null>(null);

export function notifyPrototypeUnavailable() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTICE_EVENT));
}

function NoticeListener({ children }: { children: ReactNode }) {
  const toast = useToast();
  const notify = useCallback(() => {
    toast({ body: PROTOTYPE_NOTICE, type: 'info', autoHideDuration: 3600, uniqueID: NOTICE_EVENT });
  }, [toast]);
  useEffect(() => {
    window.addEventListener(NOTICE_EVENT, notify);
    return () => window.removeEventListener(NOTICE_EVENT, notify);
  }, [notify]);
  return <NoticeContext.Provider value={notify}>{children}</NoticeContext.Provider>;
}

export function PrototypeNoticeProvider({ children }: { children: ReactNode }) {
  const existing = useContext(NoticeContext);
  if (existing) return <>{children}</>;
  return <LayerProvider toast={{ position: 'topStart', maxVisible: 2 }}><NoticeListener>{children}</NoticeListener></LayerProvider>;
}

export function PrototypeHint({ children }: { children: ReactNode }) {
  const notify = useContext(NoticeContext) ?? notifyPrototypeUnavailable;
  return <Tooltip content={PROTOTYPE_NOTICE} placement="above" hasHoverIndication={false}>
    <span className={styles.target} onClick={notify}>{children}</span>
  </Tooltip>;
}
