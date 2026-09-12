import type { Meta, StoryObj } from '@storybook/react-vite';
import { SceneRenderer } from './SceneRenderer';
import { SceneSchema } from '../contracts/scene';
import { hydrateScene, loadUniverse } from '../contracts/hydrate';
import stressTest from '../../test-fixtures/stress-test.scene.json';
import stressTestBroken from '../../test-fixtures/stress-test-broken.scene.json';

// Bastion fork note: Merlin's eight real fixture scenes (asset-discovery,
// issuer-dossier, risk-desk-dashboard, etc.) were deleted per the fork
// spec's "prune, don't adapt" rule for universe/scene content — Bastion's
// own fixtures are Phase 1 work (see CLAUDE.md §10, scenes/manifest.json).
// The per-fixture stories that rendered them are removed below along with
// the imports; `stressTest`/`stressTestBroken` remain (synthetic,
// never-registered diagnostic fixtures, not part of the deleted universe)
// but now reference a few pruned node types (ring-chart/ring-gauge/
// signal-feed/status-grid) that will render as FallbackNode — still a
// valid exercise of rule 8 ("unknown never crashes"), just no longer
// "every family renders successfully" as originally documented.

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

export const Broken: Story = { args: { raw: brokenScene } };
// Scene scale stress test (diagnostic order, 2026-07-25): 25 nodes,
// scene-grid + a nested dashboard-layout, 8+ distinct node families —
// deliberately synthetic, not a real narrative scene, kept in
// app/test-fixtures/ rather than app/scenes/ (never registered in
// manifest.json, never reachable via keywordResolver or mcp-server's
// list_scenes) since it exists only to answer "does the contract hold at
// this density," not to be investigated. (Not colocated with this story
// under src/renderer/ either — new .json fixtures placed inside src/
// trip a real TS6307 "not listed within the file list of project" error
// under this tsconfig's composite+rootDir combination, found live; every
// existing scene fixture already lives outside src/ for the same reason,
// just never previously needed for a src-local fixture like this one.)
export const StressTestDense: Story = { args: { raw: stressTest } };
// Same 25-node shape, 6 broken nodes scattered through the tree (not
// clustered like Broken above) — every FallbackReason at least twice, to
// check FallbackNode isolation still holds once density is real, not
// just at the 4-node scale Broken already covers.
export const StressTestDenseBroken: Story = { args: { raw: stressTestBroken } };
