import type { VariantId, VariantSpec } from '../geometry/types';
import { angularSlideA } from './angularSlideA';
import { angularSlideB } from './angularSlideB';
import { chevronSlip } from './chevronSlip';
import { doubleStraight } from './doubleStraight';
import { stepAngle } from './stepAngle';

export const VARIANTS: readonly VariantSpec[] = [stepAngle, angularSlideA, angularSlideB, doubleStraight, chevronSlip];

export function variantById(id: VariantId): VariantSpec {
  const variant = VARIANTS.find((v) => v.id === id);
  if (variant === undefined) throw new Error(`Unknown monolith variant "${id}"`);
  return variant;
}

export function isVariantId(value: string): value is VariantId {
  return VARIANTS.some((v) => v.id === value);
}
