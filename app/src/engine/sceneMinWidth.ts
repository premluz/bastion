import type { HydratedScene, SceneNode } from "../contracts/scene";
import { registry } from "../registry/registry";

// Phase 18: walks a scene's layout tree and returns the widest floor any
// node in it declares (registry.ts's own new, optional minWidth) — or
// `fallback` if none declare one, which is the common case. Consumed by
// the artifact pane (ArtifactStack.tsx/ArtifactStackMount.tsx) so a
// scene containing `comparison`/`concentration-map` gets a real, wider
// floor instead of the generic one, rather than trusting reflow alone.
export function getSceneMinWidth(scene: HydratedScene | undefined, fallback: number): number {
  if (!scene) return fallback;
  let widest = fallback;
  const visit = (node: SceneNode): void => {
    const declared = registry[node.type]?.minWidth;
    if (declared !== undefined && declared > widest) widest = declared;
    node.children?.forEach(visit);
  };
  visit(scene.layout);
  return widest;
}
