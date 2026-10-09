import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '@astryxdesign/theme-stone/theme.css';
import './theme/tokens.base.css';
import './theme/theme.default.css';
import './theme/theme.ops-dark.css';
import './theme/theme.glass.css';
import './theme/theme.glass-light.css';
import './theme/theme.safe-one.css';
import './theme/theme.bastion.css';
import './theme/shell.css';
import { MobileFrame } from './components/shell/MobileFrame';

// The app shell — the one place a screen is mounted from application code
// (CLAUDE.md §2.1). Theme is set statically on <html> in index.html
// (data-theme="bastion"); every other registered theme stays loaded so a
// theme switch remains a pure attribute change.
const root = document.getElementById('root');
if (!root) throw new Error('index.html is missing its #root mount point.');
createRoot(root).render(
  <StrictMode>
    <MobileFrame />
  </StrictMode>,
);
