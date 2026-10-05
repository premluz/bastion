import allJson from '../../scenes/explore.scene.json';
import categoriesJson from '../../scenes/explore-categories.scene.json';
import { HydratedSceneSchema, type HydratedScene, type SceneNode } from '../contracts/scene';

const all = HydratedSceneSchema.parse(allJson);
const catalogue = HydratedSceneSchema.parse(categoriesJson);
const groups = [...all.layout.children ?? [], ...catalogue.layout.children ?? []];
const categories: Record<string, string[]> = {
  all: ['trending', 'perp-cards', 'earn', 'stocks', 'equity-perps', 'lists'],
  crypto: ['trending', 'earn', 'lists'], stocks: ['stocks'],
  perps: ['perp-cards', 'equity-perps'], commodities: ['commodities'],
};
const lists: Record<string, { title: string; ids: string[] }> = {
  'blue-chips': { title: 'Blue Chips', ids: ['btc-perp', 'eth-perp'] },
  defi: { title: 'DeFi', ids: ['hype-perp', 'juno-earn'] },
  hyperevm: { title: 'HyperEVM', ids: ['hype-perp'] },
  'top-volume': { title: 'Top Volume', ids: ['btc-perp', 'eth-perp', 'hype-perp'] },
  memes: { title: 'Memes', ids: ['flame'] },
  z500: { title: 'Z500', ids: ['bwts', 'hpe', 'dell'] },
};
const assets = groups.flatMap((group) => group.children ?? []).filter((node) => ['asset-row', 'prominent-asset-card'].includes(node.type));
const back: SceneNode = { id: 'explore-back', type: 'link-chips', props: { label: 'Explore navigation',
  links: [{ id: 'back', label: 'Back to Explore', href: '#explore/back' }] } };

function requireGroup(id: string): SceneNode {
  const group = groups.find((item) => item.id === id);
  if (!group) throw new Error(`Unknown Explore group: ${id}`);
  return group;
}
function withPerps(group: SceneNode, filter: string): SceneNode {
  if (group.id !== 'equity-perps') return group;
  const tabs = group.children?.[0];
  if (!tabs) throw new Error('Explore perpetual filters are missing');
  const rows = filter === 'stocks' ? group.children?.slice(1) : requireGroup(filter).children;
  return { ...group, children: [{ ...tabs, props: { ...tabs.props, active: filter } }, ...rows ?? []] };
}
function drilldown(route: string): SceneNode[] {
  const [, kind, id] = route.split('/');
  if (kind === 'group' && id) return [back, requireGroup(id)];
  if (kind === 'list' && id && lists[id]) {
    const list = lists[id];
    return [back, { id: `list-${id}`, type: 'content-group', props: { title: list.title, layout: 'stack' },
      children: assets.filter((asset) => list.ids.includes(asset.id)) }];
  }
  if (kind === 'asset' && id) {
    const asset = assets.find((item) => item.props?.entityId === id);
    if (!asset) throw new Error(`Unknown Explore asset: ${id}`);
    return [back, { id: 'asset-preview', type: 'content-group', props: { title: String(asset.props?.name ?? asset.props?.symbol) },
      children: [asset, { id: 'preview-note', type: 'text-block', props: { text: 'Simulated market preview. Prices and yields are illustrative.' } }] }];
  }
  throw new Error(`Unknown Explore route: ${route}`);
}

export function resolveExploreScene(category = 'all', perpFilter = 'stocks', route = ''): HydratedScene {
  const ids = categories[category];
  if (!ids) throw new Error(`Unknown Explore category: ${category}`);
  const tabs = requireGroup('explore-categories');
  const children = route ? drilldown(route) : [
    { ...tabs, props: { ...tabs.props, active: category } }, ...ids.map(requireGroup),
  ];
  return { ...all, layout: { ...all.layout, children: children.map((group) => withPerps(group, perpFilter)) } };
}
