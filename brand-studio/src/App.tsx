import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import styles from './App.module.css';
import { AssemblyPage } from './pages/AssemblyPage';
import { CubePage } from './pages/CubePage';
import { FractalPage } from './pages/FractalPage';
import { MonolithPage } from './pages/MonolithPage';
import { usePage } from './routing';
import { Stage } from './scene/Stage';
import { useStudio } from './state/studioStore';
import { StudioHeader } from './ui/StudioHeader';

export function App() {
  const page = usePage();
  const appearance = useStudio((s) => s.appearance);

  return (
    <Theme theme={neutralTheme} mode={appearance}>
      <div className={styles.shell} data-appearance={appearance}>
        <Stage page={page} />
        <StudioHeader page={page} />
        {page === 'monolith' && <MonolithPage />}
        {page === 'assembly' && <AssemblyPage />}
        {page === 'cube' && <CubePage />}
        {page === 'fractal' && <FractalPage />}
      </div>
    </Theme>
  );
}
