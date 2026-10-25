import { Collapsible } from '@astryxdesign/core/Collapsible';
import type { ReactNode } from 'react';
import styles from './overlay.module.css';
import { CameraSection } from './tuning/CameraSection';
import { IntelligenceSection } from './tuning/IntelligenceSection';
import { SectionTitle } from './tuning/SectionTitle';
import { SurfaceSection } from './tuning/SurfaceSection';

export function TuningPanel({ children }: { readonly children?: ReactNode }) {
  return (
    <aside className={`${styles.panel} ${styles.tuning}`}>
      <Collapsible trigger={<SectionTitle title="Tuning" />} defaultIsOpen>
        <div className={styles.sections}>
          {children}
          <IntelligenceSection />
          <SurfaceSection />
          <CameraSection />
        </div>
      </Collapsible>
    </aside>
  );
}
