import manifestJson from "../../scenes/manifest.json";

interface ManifestEntry {
  id: string;
  file: string;
  module: string;
  intents: string[];
}

const moduleById = new Map(
  (manifestJson as { scenes: ManifestEntry[] }).scenes.map((entry) => [entry.id, entry.module]),
);

// Module label for an artifact card (Phase 8B WO-2c) — an independent
// manifest lookup, not a resolver change; the engine invariant protects
// contracts/resolver/renderer/registry/nodes, not this orchestration-layer
// helper. HydratedScene carries no module of its own (Scene contract is
// unchanged), so this is the only place that fact lives.
export function getModuleForScene(sceneId: string): string {
  return moduleById.get(sceneId) ?? "scene";
}
