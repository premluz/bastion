import type { BastionMonolithHandle } from '@bastion/monolith';
import { createRef } from 'react';

/** The one monolith on the page; the header's export buttons and the camera reset reach it here. */
export const monolithRef = createRef<BastionMonolithHandle>();

export function monolithHandle(): BastionMonolithHandle {
  if (monolithRef.current === null) throw new Error('The monolith is not mounted yet');
  return monolithRef.current;
}
