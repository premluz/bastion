/**
 * Bastion brand colours — the single source for the WebGL scene.
 * styles/tokens.css mirrors the ground colours for the page around the canvas.
 */
export const PALETTE = {
  signal: '#FF8A29',
  graphite: '#22252A',
  ceramic: '#DFE0DD',
  groundLight: '#F7F6F3',
  groundDark: '#101113',
  edgeNeutralDark: '#8C939C',
  edgeNeutralLight: '#FFFFFF',
  /** Light-mode glass: warm depth absorbed inside the body, and the two tinted studio accents. */
  glassDepth: '#FFEADB',
  glassBody: '#E8EAEF',
  studioCool: '#DCDDFF',
  studioWarm: '#FFE2CC',
  pearl: '#EEF0FF',
} as const;
