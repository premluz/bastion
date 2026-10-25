import type { MaterialParams } from '../../state/studioStore';

/** The incandescence the glow-character control asks for; the driver eases toward it. */
export const incandescenceTarget = (m: Pick<MaterialParams, 'glowMode' | 'incandescence'>): number =>
  m.glowMode === 'incandescent' ? m.incandescence : 0;
