import { useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import type { Group } from 'three';

interface TurningGroupProps {
  /** Yaw in radians, read every frame so a store can drive it without re-rendering. */
  readonly turn: () => number;
  readonly children: ReactNode;
}

/** Turns its content about the vertical axis — the formation rotating as one while it is apart. */
export function TurningGroup({ turn, children }: TurningGroupProps) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current !== null) group.current.rotation.y = turn();
  });
  return <group ref={group}>{children}</group>;
}
