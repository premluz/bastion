import type { Meta, StoryObj } from '@storybook/react-vite';
import { SceneRenderer } from './SceneRenderer';
import { SceneSchema } from '../contracts/scene';
import { hydrateScene, loadUniverse } from '../contracts/hydrate';
import assetDiscovery from '../../scenes/asset-discovery.scene.json';
import assetDiscoveryRefine from '../../scenes/asset-discovery-refine.scene.json';
import issuerDossier from '../../scenes/issuer-dossier.scene.json';
import settlementAnomaly from '../../scenes/settlement-anomaly.scene.json';
import auditStatusAlert from '../../scenes/audit-status-alert.scene.json';

const universe = loadUniverse();

// Fixtures are known-valid (Phase 2 contract tests already assert this) —
// a throw here would mean the fixture and the renderer's contract have
// drifted, which is a real regression worth surfacing loudly, not masking.
function FixtureScene({ raw }: { raw: unknown }) {
  const scene = SceneSchema.parse(raw);
  return <SceneRenderer scene={hydrateScene(scene, universe)} />;
}

// One node of each kind the renderer must survive, alongside a control
// node proving a broken sibling never takes down the rest of the scene
// (CLAUDE.md rule 7 / Phase 4 gate).
const brokenScene = {
  id: 'broken-demo',
  title: 'Deliberately Broken Scene',
  intents: ['broken demo'],
  thinking: [{ id: 'plan', kind: 'plan', label: 'Planning', durationMs: 500 }],
  data: {
    'dangling-ref-data': { $ref: 'does-not-exist-anywhere' },
  },
  layout: {
    id: 'root',
    type: 'scene-grid',
    reveal: 0,
    children: [
      { id: 'unknown-node', type: 'not-a-real-node-type', reveal: 1 },
      { id: 'dangling-ref-node', type: 'data-table', reveal: 2, bind: { data: 'dangling-ref-data' } },
      {
        id: 'invalid-props-node',
        type: 'status-tag',
        reveal: 3,
        props: { label: 'Bad tone', tone: 'not-a-real-tone' },
      },
      { id: 'valid-node', type: 'metric', reveal: 4, props: { label: 'Still works', value: 42 } },
    ],
  },
};

const meta: Meta<typeof FixtureScene> = {
  title: 'Renderer/Fixtures',
  component: FixtureScene,
};
export default meta;
type Story = StoryObj<typeof FixtureScene>;

export const AssetDiscovery: Story = { args: { raw: assetDiscovery } };
export const AssetDiscoveryRefine: Story = { args: { raw: assetDiscoveryRefine } };
export const IssuerDossier: Story = { args: { raw: issuerDossier } };
export const SettlementAnomaly: Story = { args: { raw: settlementAnomaly } };
export const AuditStatusAlert: Story = { args: { raw: auditStatusAlert } };
export const Broken: Story = { args: { raw: brokenScene } };
