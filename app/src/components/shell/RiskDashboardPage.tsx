import { DashboardPage } from './DashboardPage';
import { Panel } from '../nodes/Panel';
import { Metric } from '../nodes/Metric';
import { MetricGrid } from '../nodes/MetricGrid';
import { RingGauge } from '../nodes/RingGauge';
import { StatusGrid } from '../nodes/StatusGrid';
import { SignalFeed } from '../nodes/SignalFeed';

// Phase 13 WO-2: deliberately smaller and more focused than Portfolio's
// six-panel book-level view, per the order's own "don't over-design the
// distinction blind" — this is a PROVISIONAL split, flagged for Prem's
// review once WO-1 is visible alongside it. Portfolio = the aggregate
// book (exposure, notional, counterparty allocation, top contributors).
// Risk = limit/breach/escalation posture specifically: is anything
// actually breached, what's flagged, and where does each flag stand in
// its own review — no ring-chart/bar-series here, since counterparty
// allocation and per-position ranking are Portfolio's own questions, not
// this page's. Same underlying facts as risk-desk-dashboard (no new
// positions, no new counterparties) reframed around escalation rather
// than aggregate exposure — one new fact, flagged as extrapolation: the
// 5-business-day escalation review SLA and the EUR/USD position's 2
// elapsed days against it (a plausible, unauthored-elsewhere addition
// needed to give "escalation posture" its own real number to show).
export function RiskDashboardPage() {
  return (
    <DashboardPage
      title="Risk"
      spans={['full', 2, 2, 2]}
      header={{
        recommendation:
          'No positions are currently in breach of their risk limit. One position — the EUR/USD 3M Risk Reversal — carries an unrated counterparty and remains flagged for escalation review; recommend completing that review before the position\'s notional grows further.',
        confidence: 0.7,
        confidenceLabel: 'Escalation-posture confidence',
        sourceRefs: ['RiskLens', 'PortfolioAtlas'],
        caveat: 'The 10Y USD Interest Rate Swap is monitoring-only (tenor risk, not counterparty risk) — only the EUR/USD position has an open escalation.',
      }}
    >
      <Panel title="Limit posture">
        <MetricGrid>
          <Metric label="Positions in breach" value={0} />
          <Metric label="Flagged for escalation" value={1} />
          <Metric label="Open escalations" value={1} />
          <Metric label="Monitoring only" value={1} />
        </MetricGrid>
      </Panel>
      <Panel title="Escalation review SLA">
        <RingGauge label="EUR/USD 3M Risk Reversal — review window" value={2} max={5} unit=" days" tone="ok" />
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
      <Panel title="Escalation log">
        <SignalFeed
          data={{
            kind: 'table',
            columns: [
              { key: 'date', label: 'Date', type: 'date' },
              { key: 'position', label: 'Position', type: 'string' },
              { key: 'detail', label: 'Detail', type: 'string' },
            ],
            rows: [
              {
                date: '2026-07-16',
                position: 'EUR/USD 3M Risk Reversal',
                detail: 'Escalated for hedge review — counterparty Kestrel Holdings unrated',
              },
              {
                date: '2026-07-16',
                position: '10Y USD Interest Rate Swap',
                detail: 'Flagged for tenor risk — monitoring only, no escalation opened',
              },
            ],
          }}
        />
      </Panel>
    </DashboardPage>
  );
}
