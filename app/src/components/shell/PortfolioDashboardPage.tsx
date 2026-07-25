import { DashboardPage } from './DashboardPage';
import { Panel } from '../nodes/Panel';
import { Metric } from '../nodes/Metric';
import { MetricGrid } from '../nodes/MetricGrid';
import { RingGauge } from '../nodes/RingGauge';
import { StatusGrid } from '../nodes/StatusGrid';
import { RingChart } from '../nodes/RingChart';
import { BarSeries } from '../nodes/BarSeries';
import { SignalFeed } from '../nodes/SignalFeed';
import { TimeSeries } from '../nodes/TimeSeries';
import { Text } from '@astryxdesign/core/Text';
import { StatusTag } from '../nodes/StatusTag';
import type { DataSet } from '../../contracts/data';
import datasetsJson from '../../../universe/datasets.json';

const datasets = datasetsJson as Record<string, DataSet>;
// Portfolio wiring order (2026-07-25): reuses the same 90-day generator
// pattern as every other series in this universe (scripts/generate-series
// .mjs, extended this order) — endpoint pinned to the real €21M aggregate
// exposure figure quoted elsewhere on this page, start value an authored
// extrapolation (logged in the generator script's own comment).
const portfolioExposureSeries = datasets['portfolio-exposure-90d'];

// Phase 13 WO-1: content is the existing risk-desk-dashboard fixture's
// own data, re-rendered through DashboardPage instead of via
// investigation — same facts, same figures, byte-for-byte, only the
// delivery mechanism differs (static page vs. trail → artifact). Confirms
// the DashboardPage/DashboardLayout reuse works before WO-2's Risk page.
// No SceneRenderer, no bind resolution — every prop below is authored
// directly, same values as risk-desk-dashboard.scene.json.
export function PortfolioDashboardPage() {
  return (
    <DashboardPage
      title="Portfolio"
      spans={['full', 'full', 2, 2, 2, 3, 3, 'full']}
      header={{
        recommendation:
          "Aggregate derivatives exposure sits at €21M against a €25M risk limit (84% utilized) — no breach, but the Kestrel-linked EUR/USD risk reversal concentrates nearly a third of that exposure with an unrated counterparty and warrants review.",
        confidence: 0.71,
        confidenceLabel: 'Aggregate risk confidence',
        sourceRefs: ['PortfolioAtlas', 'RiskLens'],
        caveat:
          "Kestrel Holdings is already flagged elsewhere on the venue for NordBond float accumulation — treat this counterparty's derivatives exposure as compounding risk, not an isolated flag.",
      }}
    >
      <Panel title="Book summary">
        <MetricGrid>
          <Metric label="Aggregate exposure" value="€21M" detail="84% of €25M limit" />
          <Metric label="Total notional" value="€170M" />
          <Metric label="Open positions" value={4} />
          <Metric label="Flagged positions" value={2} />
        </MetricGrid>
      </Panel>
      <Panel title="Portfolio exposure trend">
        {portfolioExposureSeries && portfolioExposureSeries.kind === 'series' ? (
          <TimeSeries
            data={portfolioExposureSeries}
            referenceLines={[{ value: 25, label: 'Risk limit (€25M)' }]}
          />
        ) : (
          <Text type="supporting" color="secondary">
            Exposure trend unavailable.
          </Text>
        )}
      </Panel>
      <Panel title="Risk limit">
        <RingGauge label="Risk limit utilization" value={21} max={25} unit="€M" tone="warn" />
      </Panel>
      <Panel title="Position status">
        <StatusGrid
          labelColumn="position"
          toneColumn="tone"
          data={{
            kind: 'table',
            columns: [
              { key: 'position', label: 'Position', type: 'string' },
              { key: 'tone', label: 'Tone', type: 'string' },
            ],
            rows: [
              { position: 'EUR/USD 3M Risk Reversal', tone: 'alert' },
              { position: '5Y EUR Interest Rate Swap', tone: 'ok' },
              { position: 'GBP/EUR 6M FX Forward', tone: 'ok' },
              { position: '10Y USD Interest Rate Swap', tone: 'warn' },
            ],
          }}
        />
      </Panel>
      <Panel title="Exposure by counterparty">
        <RingChart
          labelColumn="counterparty"
          valueColumn="exposure"
          valueSuffix="M"
          data={{
            kind: 'table',
            columns: [
              { key: 'counterparty', label: 'Counterparty', type: 'string' },
              { key: 'exposure', label: 'Exposure', type: 'number' },
            ],
            rows: [
              { counterparty: 'Fjellbank', exposure: 9 },
              { counterparty: 'Kestrel Holdings', exposure: 6 },
              { counterparty: 'Solent Markets Prime', exposure: 6 },
            ],
          }}
        />
      </Panel>
      <Panel title="Top contributors by exposure">
        {/* Entity-linked bars (Portfolio wiring order, 2026-07-25): every
            x-category here IS a real universe derivative entity — entityId
            wired through so a bar click browses to that position's own
            Entity Detail page (DashboardPage's delegated listener). */}
        <BarSeries
          valueSuffix="M"
          data={{
            kind: 'series',
            series: [
              {
                id: 'exposure',
                label: 'Exposure',
                points: [
                  { x: '5Y EUR IRS', y: 9, entityId: 'eur-5y-irs' },
                  { x: 'EUR/USD 3M RR', y: 6, entityId: 'eurusd-3m-risk-reversal' },
                  { x: '10Y USD IRS', y: 5, entityId: 'usd-10y-irs' },
                  { x: 'GBP/EUR 6M Fwd', y: 1, entityId: 'gbpeur-6m-forward' },
                ],
              },
            ],
          }}
        />
      </Panel>
      <Panel title="Flagged positions">
        {/* Entity-linked headline column (Portfolio wiring order,
            2026-07-25) — same "entity"-typed table cell signal-feed
            already supports for scene-driven content (Phase 8F), reused
            here for this static page's own literal data. */}
        <SignalFeed
          data={{
            kind: 'table',
            columns: [
              { key: 'date', label: 'Date', type: 'date' },
              { key: 'position', label: 'Position', type: 'entity' },
              { key: 'detail', label: 'Detail', type: 'string' },
            ],
            rows: [
              {
                date: '2026-07-16',
                position: { entityId: 'eurusd-3m-risk-reversal', label: 'EUR/USD 3M Risk Reversal' },
                detail: 'Counterparty Kestrel Holdings unrated — largest single exposure at 29% of aggregate',
              },
              {
                date: '2026-07-16',
                position: { entityId: 'usd-10y-irs', label: '10Y USD Interest Rate Swap' },
                detail: 'Long-dated tenor (10Y) carries elevated rate-sensitivity',
              },
            ],
          }}
        />
      </Panel>
      {/* Solent Markets repositioning order (2026-07-20, standalone STATE.md
          entry — independent of the queued, unbuilt Phase 15 "My Portfolio"
          multi-wallet mock-connect): proves the architecture generalizes
          beyond one venue at 1/50th Phase 15's scope — one honest,
          minimal, unreasoned row for a second venue's position, reusing
          Text + the existing status-tag node, zero new nodes, zero engine
          changes. No scene, no trail, no dossier — halberg-materials
          carries no `intent` in universe/entities.json, deliberately. */}
      <Panel title="Meridian Exchange">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="body">Halberg Materials AG</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
            <Text type="body" hasTabularNumbers>
              €1.2M
            </Text>
            <StatusTag label="Not yet analyzed" tone="neutral" />
          </div>
        </div>
      </Panel>
    </DashboardPage>
  );
}
