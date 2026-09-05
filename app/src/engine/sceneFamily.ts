// Session lineage — a refine turn's scene shares its parent's id with a
// `-refine` suffix (node-vocabulary.md's routing law names this "scene
// family"). Shared by ArtifactStack.tsx (version numbering within the
// stack's own list) and sessionStore.ts (thread lineage — architect-
// ordered: "reuse ArtifactStack's existing lineage key, do not invent a
// second lineage concept") — one function, not two independently-
// maintained copies of the same rule.
//
// Strips ALL trailing `-refine` suffixes, not just one (2026-09-01,
// direct feedback — "compare with peers" needed to append to the same
// thread as hottest-crypto-week / hottest-crypto-week-refine, a 3-deep
// chain the single-strip version couldn't collapse: 'foo-refine-refine'
// stripped once is 'foo-refine', which doesn't match 'foo'). A global
// anchored regex handles any chain depth, not just today's two.
export function sceneFamily(sceneId: string): string {
  return sceneId.replace(/(-refine)+$/, "");
}
