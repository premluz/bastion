import { useFrame } from '@react-three/fiber';
import { useAppearanceFade } from '../state/appearanceFade';
import { useStudio } from '../state/studioStore';

/** After the composer (priority 1) has drawn the frame, so the snapshot is exactly the old look. */
const AFTER_COMPOSER = 2;

/**
 * Applies a requested Dark/Light change only once the current frame has been captured: the old look
 * is handed to the page as a bitmap that fades out over the new one. The appearance is committed in
 * the same step the bitmap arrives, so the new look never shows before its cover is in place.
 */
export function AppearanceSnapshot() {
  useFrame(({ gl }) => {
    const next = useAppearanceFade.getState().take();
    if (next === null) return;
    createImageBitmap(gl.domElement).then(
      (bitmap) => {
        useAppearanceFade.getState().begin(bitmap);
        useStudio.getState().setAppearance(next);
      },
      (cause: unknown) => {
        useStudio.getState().setAppearance(next);
        throw new Error('Appearance crossfade: could not capture the current frame', { cause });
      },
    );
  }, AFTER_COMPOSER);
  return null;
}
