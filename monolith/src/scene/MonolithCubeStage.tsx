import { useMemo } from 'react';
import { FractalMonolith } from '../fractal/FractalMonolith';
import { bevelSize, cornerRadius } from '../fractal/geometry/bevel';
import { monolithCube } from '../fractal/geometry/monolithCube';
import type { LiveSettings } from '../live';
import { buildMonolith } from '../monolith/geometry/buildMonolith';
import type { VariantId } from '../monolith/geometry/types';
import { variantById } from '../monolith/variants';
import type { QualitySpec } from '../quality';
import type { AppearancePreset } from './appearance';

const SEARCH = { seed: 7, trials: 2 } as const;

interface MonolithCubeStageProps {
  readonly variant: VariantId;
  readonly settings: LiveSettings;
  readonly quality: QualitySpec;
  readonly preset: AppearancePreset;
  readonly progress: () => number;
}

export function MonolithCubeStage({ variant, settings, quality, preset, progress }: MonolithCubeStageProps) {
  const { cutWidth, softCorners, cornerRadius: explicitRadius } = settings.target.material;
  const round = cornerRadius(softCorners, explicitRadius);
  const bevel = bevelSize(softCorners, explicitRadius);
  const model = useMemo(
    () => monolithCube(buildMonolith(variantById(variant), { cutWidth, bevel, round })),
    [variant, cutWidth, bevel, round],
  );

  return <FractalMonolith model={model} search={SEARCH} settings={settings} quality={quality} preset={preset} progress={progress} />;
}
