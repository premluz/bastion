import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Selector } from '@astryxdesign/core/Selector';
import type { ReactNode } from 'react';
import { useStudio, type StudioPreset } from '../state/studioStore';
import styles from './overlay.module.css';
import { CameraSection } from './tuning/CameraSection';
import { IntelligenceSection } from './tuning/IntelligenceSection';
import { SectionTitle } from './tuning/SectionTitle';
import { SurfaceSection } from './tuning/SurfaceSection';
import { MaterialPicker } from './tuning/MaterialPicker';
import { OpticsSection } from './tuning/OpticsSection';

const PROFILE_OPTIONS: { value: StudioPreset; label: string }[] = [
  { value: 'light', label: 'Light mode' },
  { value: 'dark', label: 'Dark mode' },
  { value: 'web-light', label: 'Web light mode' },
  { value: 'web-dark', label: 'Web dark mode' },
];

const isStudioPreset = (value: string): value is StudioPreset => PROFILE_OPTIONS.some((option) => option.value === value);

export function TuningPanel({ children }: { readonly children?: ReactNode }) {
  const preset = useStudio((s) => s.preset);
  const setPreset = useStudio((s) => s.setPreset);
  return (
    <aside className={`${styles.panel} ${styles.tuning}`}>
      <Collapsible trigger={<SectionTitle title="Tuning" />} defaultIsOpen>
        <div className={styles.sections}>
          {children}
          <Selector label="Starting profile" size="sm" options={PROFILE_OPTIONS} value={preset} onChange={(value) => {
            if (isStudioPreset(value)) setPreset(value);
          }} />
          <MaterialPicker />
          <SurfaceSection />
          <OpticsSection />
          <IntelligenceSection />
          <CameraSection />
        </div>
      </Collapsible>
    </aside>
  );
}
