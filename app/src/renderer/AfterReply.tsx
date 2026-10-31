import type { ReactNode } from 'react';
import { useIsPrinting } from '../components/trail/StreamedText';

/** Holds a pane back until the words that introduce it have finished printing, so it comes in pushing the content (SceneRenderer). */
export function AfterReply({ text, children }: { text: string; children: ReactNode }) {
  return useIsPrinting(text) ? null : <>{children}</>;
}
