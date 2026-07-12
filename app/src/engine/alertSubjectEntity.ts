import type { HydratedScene, SceneNode } from "../contracts/scene";

function findEntityHeaderNode(node: SceneNode): SceneNode | undefined {
  if (node.type === "entity-header") return node;
  for (const child of node.children ?? []) {
    const found = findEntityHeaderNode(child);
    if (found) return found;
  }
  return undefined;
}

// A Monitor-module turn's "subject" for the watchlist's alert-append hook
// (presentScene.ts) — the entity its own entity-header node is bound to,
// found by walking the hydrated layout the same way SceneRenderer already
// does (this is engine-layer orchestration, not a renderer-layer import;
// it doesn't touch SceneRenderer.tsx itself). A scene with no
// entity-header, or a dangling/non-entity bind, has no watchable subject
// — returns undefined rather than guessing, same as a dangling $ref
// hydrating to a marked-missing DataSet rather than throwing.
export function getAlertSubjectEntity(scene: HydratedScene): { entityId: string; label: string } | undefined {
  const node = findEntityHeaderNode(scene.layout);
  const dataKey = node?.bind?.["data"];
  if (!dataKey) return undefined;
  const dataset = scene.data[dataKey];
  if (!dataset || dataset.kind !== "entity") return undefined;
  return { entityId: dataset.entity.id, label: dataset.entity.name };
}
