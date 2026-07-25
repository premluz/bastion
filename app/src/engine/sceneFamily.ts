// Session lineage — a refine turn's scene shares its parent's id with a
// `-refine` suffix (the only chain in the fixture data today;
// node-vocabulary.md's routing law names this "scene family"). Shared by
// ArtifactStack.tsx (version numbering within the stack's own list) and
// sessionStore.ts (thread lineage — architect-ordered: "reuse
// ArtifactStack's existing lineage key, do not invent a second lineage
// concept") — one function, not two independently-maintained copies of
// the same rule.
export function sceneFamily(sceneId: string): string {
  return sceneId.replace(/-refine$/, "");
}
