/** GLSL injected into the ceramic material; identifiers prefixed `bs`, as in ceramicShader. */

/**
 * Smooth normals over faceted soft corners can point slightly away from the viewer right at the silhouette, which
 * the lighting reads as an unlit, black sliver. Every shaded normal is kept just facing the camera.
 */
export const FRAGMENT_FACING = /* glsl */ `
{
  vec3 bsView = normalize(vViewPosition);
  float bsFacing = dot(normal, bsView);
  if (bsFacing < 0.08) normal = normalize(normal + bsView * (0.08 - bsFacing));
}
`;

export const FRAGMENT_CLEARCOAT_FACING = /* glsl */ `
#ifdef USE_CLEARCOAT
{
  vec3 bsView = normalize(vViewPosition);
  float bsFacing = dot(clearcoatNormal, bsView);
  if (bsFacing < 0.08) clearcoatNormal = normalize(clearcoatNormal + bsView * (0.08 - bsFacing));
}
#endif
`;
