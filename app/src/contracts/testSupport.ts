export { hydrateScene, loadUniverse } from "./hydrate";

const sceneModules = import.meta.glob<unknown>("../../scenes/*.scene.json", {
  eager: true,
  import: "default",
});

export function loadSceneFixtures(): { file: string; raw: unknown }[] {
  return Object.entries(sceneModules).map(([path, raw]) => ({
    file: path.split("/").pop() ?? path,
    raw,
  }));
}
