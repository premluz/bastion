import { describe, expect, it } from 'vitest';
import { resolveExploreScene } from './exploreScenes';
import { ownedAssetsScene } from './ownedAssetsScene';
import { registry } from '../registry/registry';
import type { SceneNode } from '../contracts/scene';

function validate(node: SceneNode) {
  const entry = registry[node.type];
  expect(entry, node.type).toBeDefined();
  expect(entry!.propSchema.safeParse(node.props ?? {}).success, node.id).toBe(true);
  node.children?.forEach(validate);
}
describe('Explore scene composition', () => {
  it('validates every category and perpetual subcategory through the registry', () => {
    for (const category of ['all', 'crypto', 'stocks', 'perps', 'commodities']) {
      for (const perps of ['stocks', 'forex', 'indices', 'etfs']) validate(resolveExploreScene(category, perps).layout);
    }
  });
  it('resolves every linked group, list and asset in All', () => {
    function follow(node: SceneNode) {
      const href = node.props?.href;
      if (typeof href === 'string' && /^#explore\/(group|asset)\//.test(href)) validate(resolveExploreScene('all', 'stocks', href).layout);
      node.children?.forEach(follow);
    }
    follow(resolveExploreScene().layout);
    for (const id of ['blue-chips', 'defi', 'hyperevm', 'top-volume', 'memes', 'z500']) {
      validate(resolveExploreScene('all', 'stocks', `#explore/list/${id}`).layout);
    }
  });
  it('keeps owned quantities and total values separate from market metadata', () => {
    const scene = ownedAssetsScene([
      { entityId: 'eth', name: 'Ethereum', symbol: 'ETH', value: 5370, quantity: 2, deltaPercent: -2.2 },
      { entityId: 'usdt', name: 'Tether', symbol: 'USDT', value: 12.34, quantity: 12.34, deltaPercent: 0 },
    ], 'eth');
    validate(scene.layout);
    expect(scene.layout.children?.map((node) => node.props?.value)).toEqual(['$5,370.00', '$12.34']);
    expect(scene.layout.children?.map((node) => node.props?.selected)).toEqual([true, false]);
  });
});
