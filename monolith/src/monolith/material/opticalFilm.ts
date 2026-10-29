export const OPTICAL_FILM_HEADER = /* glsl */ `
uniform float uFilmVariation;
`;

/** Native thin-film colour follows viewing angle and nearby light, not a noise-painted rainbow map. */
export const OPTICAL_FILM = /* glsl */ `
#ifdef USE_IRIDESCENCE
  const float bsFilmDepth = 0.32;
  const float bsPearlTint = 0.38;
  const float bsOpticalScatter = 0.75;
  float bsViewCos = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
  float bsGrazing = pow(1.0 - bsViewCos, 2.0);
  vec3 bsIncident = bsOpeningLight(vMonoPos);
  float bsIncidentPower = max(bsIncident.r, max(bsIncident.g, bsIncident.b));
  float bsLocalOptics = bsIncidentPower / (1.0 + bsIncidentPower) * exp(-bsCutDistance(vMonoPos) / (bsFilmDepth * mix(1.0, 0.2, uOpen)));
  #ifdef BS_WALL
    bsLocalOptics *= bsWallBeam(vMonoPos);
  #endif
  float bsFilmThickness = mix(iridescenceThicknessMinimum, iridescenceThicknessMaximum, clamp(0.25 + 0.5 * bsGrazing + 0.25 * bsLocalOptics, 0.0, 1.0));
  material.iridescenceThickness = mix(material.iridescenceThickness, bsFilmThickness, uFilmVariation);
  material.iridescence *= mix(1.0, clamp(0.12 + 0.6 * bsGrazing + 0.7 * bsLocalOptics, 0.0, 1.0), uOpticalProfile.x);
  vec3 bsFilmFresnel = evalIridescence(1.0, material.iridescenceIOR, bsViewCos, material.iridescenceThickness, material.specularColor);
  vec3 bsPearlChroma = bsFilmFresnel / max(max(bsFilmFresnel.r, max(bsFilmFresnel.g, bsFilmFresnel.b)), 1e-4);
  material.diffuseContribution *= mix(vec3(1.0), bsPearlChroma, bsPearlTint * material.iridescence * bsLocalOptics * uOpticalProfile.x);
  // A bounded single-scatter approximation carries the film response beneath the milky surface.
  totalEmissiveRadiance += bsPearlChroma * bsOpticalScatter * material.iridescence * bsLocalOptics * uOpticalProfile.x;
#endif
`;
