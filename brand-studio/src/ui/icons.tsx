import type { ReactNode } from 'react';
import styles from './icons.module.css';

/** Transport glyphs Astryx's icon registry does not include. */
function Glyph({ children }: { readonly children: ReactNode }) {
  return (
    <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const PlayIcon = () => (
  <Glyph>
    <path d="M5 3.5v9l7-4.5z" className={styles.fill} />
  </Glyph>
);

export const PauseIcon = () => (
  <Glyph>
    <path d="M5 3.5h2v9H5zM9 3.5h2v9H9z" className={styles.fill} />
  </Glyph>
);

export const ReverseIcon = () => (
  <Glyph>
    <path d="M11 3.5v9L4 8z" className={styles.fill} />
  </Glyph>
);

export const ReplayIcon = () => (
  <Glyph>
    <path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.25" className={styles.stroke} />
    <path d="M3.5 2.75v2.5H6" className={styles.stroke} />
  </Glyph>
);

export const RecenterIcon = () => (
  <Glyph>
    <circle cx="8" cy="8" r="2" className={styles.fill} />
    <path d="M8 1.5v2.5M8 12v2.5M1.5 8H4M12 8h2.5" className={styles.stroke} />
  </Glyph>
);
