import { lazy } from 'react';
import type { ComponentType } from 'react';
import type { ZodType } from 'zod';
import { SceneGridPropsSchema } from '../contracts/props/scene-grid';
import { PanelPropsSchema } from '../contracts/props/panel';
import { MetricPropsSchema } from '../contracts/props/metric';
import { MetricGridPropsSchema } from '../contracts/props/metric-grid';
import { DataTablePropsSchema } from '../contracts/props/data-table';
import { TimeSeriesPropsSchema } from '../contracts/props/time-series';
import { TextBlockPropsSchema } from '../contracts/props/text-block';
import { StatusTagPropsSchema } from '../contracts/props/status-tag';
import { RecommendationPropsSchema } from '../contracts/props/recommendation';
import { EntityHeaderPropsSchema } from '../contracts/props/entity-header';
import { FilterSummaryPropsSchema } from '../contracts/props/filter-summary';
import { EntityGraphPropsSchema } from '../contracts/props/entity-graph';
import { GeoPanelPropsSchema } from '../contracts/props/geo-panel';
import { SignalFeedPropsSchema } from '../contracts/props/signal-feed';
import { ComparisonPropsSchema } from '../contracts/props/comparison';
import { ConfidenceMeterPropsSchema } from '../contracts/props/confidence-meter';
import { ConcentrationMapPropsSchema } from '../contracts/props/concentration-map';
import { BarSeriesPropsSchema } from '../contracts/props/bar-series';
import { SparklinePropsSchema } from '../contracts/props/sparkline';
import { SceneSummaryPropsSchema } from '../contracts/props/scene-summary';
import { RingGaugePropsSchema } from '../contracts/props/ring-gauge';
import { DashboardLayoutPropsSchema } from '../contracts/props/dashboard-layout';
import { StatusGridPropsSchema } from '../contracts/props/status-grid';
import { RingChartPropsSchema } from '../contracts/props/ring-chart';
import { NewsFeedPropsSchema } from '../contracts/props/news-feed';

interface RegistryEntry {
  component: ComponentType<never>;
  propSchema: ZodType<unknown>;
  // Phase 18: additive, optional — a node's own legibility floor, wider
  // than the generic pane floor (Frame.module.css/ArtifactStack.tsx).
  // Absent means "the generic floor is fine," true for nearly every node;
  // only set where a node's own known-cramped-narrow issue is already on
  // record (comparison, Phase 8B WO-2's parked 480px finding; concentration
  // -map, Phase 8D's ~353px label-clipping finding, already reworked but
  // still worth a real floor rather than trusting reflow alone). Consumed
  // by engine/sceneMinWidth.ts, never read by the renderer/registry lookup
  // itself — a shell-layer concern layered on top of the same map.
  minWidth?: number;
}

export const registry: Record<string, RegistryEntry> = {
  'scene-grid': {
    component: lazy(() => import('../components/nodes/SceneGrid').then((m) => ({ default: m.SceneGrid }))),
    propSchema: SceneGridPropsSchema,
  },
  panel: {
    component: lazy(() => import('../components/nodes/Panel').then((m) => ({ default: m.Panel }))),
    propSchema: PanelPropsSchema,
  },
  metric: {
    component: lazy(() => import('../components/nodes/Metric').then((m) => ({ default: m.Metric }))),
    propSchema: MetricPropsSchema,
  },
  'metric-grid': {
    component: lazy(() => import('../components/nodes/MetricGrid').then((m) => ({ default: m.MetricGrid }))),
    propSchema: MetricGridPropsSchema,
  },
  'data-table': {
    component: lazy(() => import('../components/nodes/DataTable').then((m) => ({ default: m.DataTable }))),
    propSchema: DataTablePropsSchema,
  },
  'time-series': {
    component: lazy(() => import('../components/nodes/TimeSeries').then((m) => ({ default: m.TimeSeries }))),
    propSchema: TimeSeriesPropsSchema,
  },
  'text-block': {
    component: lazy(() => import('../components/nodes/TextBlock').then((m) => ({ default: m.TextBlock }))),
    propSchema: TextBlockPropsSchema,
  },
  'status-tag': {
    component: lazy(() => import('../components/nodes/StatusTag').then((m) => ({ default: m.StatusTag }))),
    propSchema: StatusTagPropsSchema,
  },
  recommendation: {
    component: lazy(() => import('../components/nodes/Recommendation').then((m) => ({ default: m.Recommendation }))),
    propSchema: RecommendationPropsSchema,
  },
  'entity-header': {
    component: lazy(() => import('../components/nodes/EntityHeader').then((m) => ({ default: m.EntityHeader }))),
    propSchema: EntityHeaderPropsSchema,
  },
  'filter-summary': {
    component: lazy(() => import('../components/nodes/FilterSummary').then((m) => ({ default: m.FilterSummary }))),
    propSchema: FilterSummaryPropsSchema,
  },
  'entity-graph': {
    component: lazy(() => import('../components/nodes/EntityGraph').then((m) => ({ default: m.EntityGraph }))),
    propSchema: EntityGraphPropsSchema,
  },
  'geo-panel': {
    component: lazy(() => import('../components/nodes/GeoPanel').then((m) => ({ default: m.GeoPanel }))),
    propSchema: GeoPanelPropsSchema,
  },
  'signal-feed': {
    component: lazy(() => import('../components/nodes/SignalFeed').then((m) => ({ default: m.SignalFeed }))),
    propSchema: SignalFeedPropsSchema,
  },
  comparison: {
    component: lazy(() => import('../components/nodes/Comparison').then((m) => ({ default: m.Comparison }))),
    propSchema: ComparisonPropsSchema,
    // Astryx's Table gives every `proportional(1)` column a ~120px floor;
    // the only fixture using this node (asset-discovery) has 4 columns
    // (label + 3 candidates) → 480 is the verified true minimum, not a
    // round guess. Confirmed live (Phase 18 gate): the earlier 560 was
    // padded 80px past that, which forced the artifact pane to collapse
    // at a standard 1280px viewport where the panel used to fit — a real
    // regression against shell.spec.ts, root-caused to this over-padded
    // constant rather than a bug in the collapse trigger itself.
    minWidth: 480,
  },
  'confidence-meter': {
    component: lazy(() => import('../components/nodes/ConfidenceMeter').then((m) => ({ default: m.ConfidenceMeter }))),
    propSchema: ConfidenceMeterPropsSchema,
  },
  'concentration-map': {
    component: lazy(() => import('../components/nodes/ConcentrationMap').then((m) => ({ default: m.ConcentrationMap }))),
    propSchema: ConcentrationMapPropsSchema,
    minWidth: 400,
  },
  'bar-series': {
    component: lazy(() => import('../components/nodes/BarSeries').then((m) => ({ default: m.BarSeries }))),
    propSchema: BarSeriesPropsSchema,
  },
  sparkline: {
    component: lazy(() => import('../components/nodes/Sparkline').then((m) => ({ default: m.Sparkline }))),
    propSchema: SparklinePropsSchema,
  },
  'scene-summary': {
    component: lazy(() => import('../components/nodes/SceneSummary').then((m) => ({ default: m.SceneSummary }))),
    propSchema: SceneSummaryPropsSchema,
  },
  'ring-gauge': {
    component: lazy(() => import('../components/nodes/RingGauge').then((m) => ({ default: m.RingGauge }))),
    propSchema: RingGaugePropsSchema,
  },
  'dashboard-layout': {
    component: lazy(() => import('../components/nodes/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))),
    propSchema: DashboardLayoutPropsSchema,
  },
  'status-grid': {
    component: lazy(() => import('../components/nodes/StatusGrid').then((m) => ({ default: m.StatusGrid }))),
    propSchema: StatusGridPropsSchema,
  },
  'ring-chart': {
    component: lazy(() => import('../components/nodes/RingChart').then((m) => ({ default: m.RingChart }))),
    propSchema: RingChartPropsSchema,
  },
  'news-feed': {
    component: lazy(() => import('../components/nodes/NewsFeed').then((m) => ({ default: m.NewsFeed }))),
    propSchema: NewsFeedPropsSchema,
  },
};
