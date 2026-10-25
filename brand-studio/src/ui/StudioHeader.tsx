import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import { isStagePage, navigate } from '../routing';
import { useAppearanceFade } from '../state/appearanceFade';
import type { StagePage } from '../scene/Stage';
import { useStudio } from '../state/studioStore';
import { ExportControls } from './ExportControls';
import styles from './overlay.module.css';

export function StudioHeader({ page }: { readonly page: StagePage }) {
  const appearance = useStudio((s) => s.appearance);
  const requestAppearance = useAppearanceFade((s) => s.request);

  return (
    <header className={styles.header}>
      <div className={`${styles.panel} ${styles.headerGroup}`}>
        <span className={styles.wordmark}>
          <Text type="label" weight="medium">
            BASTION
          </Text>
        </span>
        <TabList
          value={page}
          onChange={(value) => {
            if (isStagePage(value)) navigate(value);
          }}
          size="sm"
          aria-label="Studio pages"
        >
          <Tab value="monolith" label="Monolith" />
          <Tab value="assembly" label="Self-assembly" />
          <Tab value="cube" label="Cube assembly" />
          <Tab value="fractal" label="Fractal agents" />
        </TabList>
      </div>
      <div className={styles.headerGroup}>
        <ExportControls />
        <div className={styles.panel}>
          <SegmentedControl
            label="Appearance"
            size="sm"
            value={appearance}
            onChange={(value) => requestAppearance(value === 'light' ? 'light' : 'dark')}
          >
            <SegmentedControlItem value="dark" label="Dark" />
            <SegmentedControlItem value="light" label="Light" />
          </SegmentedControl>
        </div>
      </div>
    </header>
  );
}
