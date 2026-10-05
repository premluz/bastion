import { ThinkingFindingsPropsSchema } from '../contracts/props/thinking-findings';
import { PaymentCardPropsSchema } from '../contracts/props/payment-card';
import { AssetRowPropsSchema } from '../contracts/props/asset-row';
import { ProminentAssetCardPropsSchema } from '../contracts/props/prominent-asset-card';
import { ContentGroupPropsSchema } from '../contracts/props/content-group';
import { LinkChipsPropsSchema } from '../contracts/props/link-chips';
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
import { ConfidenceMeterPropsSchema } from '../contracts/props/confidence-meter';
import { BarSeriesPropsSchema } from '../contracts/props/bar-series';
import { SparklinePropsSchema } from '../contracts/props/sparkline';
import { SceneSummaryPropsSchema } from '../contracts/props/scene-summary';
import { DashboardLayoutPropsSchema } from '../contracts/props/dashboard-layout';
import { NewsFeedPropsSchema } from '../contracts/props/news-feed';
import { AnalystConsensusPropsSchema } from '../contracts/props/analyst-consensus';
import { AssetPriceHeaderPropsSchema } from '../contracts/props/asset-price-header';
import { EarningsHistoryChartPropsSchema } from '../contracts/props/earnings-history-chart';
import { PriceMovementTimelinePropsSchema } from '../contracts/props/price-movement-timeline';
import { AiRationaleRailPropsSchema } from '../contracts/props/ai-rationale-rail';
import { TrendChartPropsSchema } from '../contracts/props/trend-chart';
import { KeyIssuesCardPropsSchema } from '../contracts/props/key-issues-card';
import { AssetCardGridPropsSchema } from '../contracts/props/asset-card-grid';
import { ContributionBarsPropsSchema } from '../contracts/props/contribution-bars';
import { RiskReturnScatterPropsSchema } from '../contracts/props/risk-return-scatter';
import { AssetTrendCardPropsSchema } from '../contracts/props/asset-trend-card';
import { ApprovalCardPropsSchema } from '../contracts/props/approval-card';
import { PurchaseCardPropsSchema, PurchaseDetailPropsSchema } from '../contracts/props/purchase-card';

interface RegistryEntry {
  component: ComponentType<never>;
  propSchema: ZodType<unknown>;
}

export const registry: Record<string, RegistryEntry> = {
  'thinking-findings': {
    component: lazy(() => import('../components/nodes/ThinkingFindings').then((m) => ({ default: m.ThinkingFindings }))),
    propSchema: ThinkingFindingsPropsSchema,
  },
  'payment-card': {
    component: lazy(() => import('../components/nodes/PaymentCard').then((m) => ({ default: m.PaymentCard }))),
    propSchema: PaymentCardPropsSchema,
  },
  'asset-row': {
    component: lazy(() => import('../components/nodes/AssetRow').then((m) => ({ default: m.AssetRow }))),
    propSchema: AssetRowPropsSchema,
  },
  'prominent-asset-card': {
    component: lazy(() => import('../components/nodes/ProminentAssetCard').then((m) => ({ default: m.ProminentAssetCard }))),
    propSchema: ProminentAssetCardPropsSchema,
  },
  'content-group': {
    component: lazy(() => import('../components/nodes/ContentGroup').then((m) => ({ default: m.ContentGroup }))),
    propSchema: ContentGroupPropsSchema,
  },
  'link-chips': {
    component: lazy(() => import('../components/nodes/LinkChips').then((m) => ({ default: m.LinkChips }))),
    propSchema: LinkChipsPropsSchema,
  },

  'approval-card': {
    component: lazy(() => import('../components/nodes/ApprovalCard').then((m) => ({ default: m.ApprovalCard }))),
    propSchema: ApprovalCardPropsSchema,
  },
  'purchase-card': {
    component: lazy(() => import('../components/nodes/PurchaseCard').then((m) => ({ default: m.PurchaseCard }))),
    propSchema: PurchaseCardPropsSchema,
  },
  'purchase-detail': {
    component: lazy(() => import('../components/nodes/PurchaseDetail').then((m) => ({ default: m.PurchaseDetail }))),
    propSchema: PurchaseDetailPropsSchema,
  },
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
  'confidence-meter': {
    component: lazy(() => import('../components/nodes/ConfidenceMeter').then((m) => ({ default: m.ConfidenceMeter }))),
    propSchema: ConfidenceMeterPropsSchema,
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
  'dashboard-layout': {
    component: lazy(() => import('../components/nodes/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))),
    propSchema: DashboardLayoutPropsSchema,
  },
  'news-feed': {
    component: lazy(() => import('../components/nodes/NewsFeed').then((m) => ({ default: m.NewsFeed }))),
    propSchema: NewsFeedPropsSchema,
  },
  'analyst-consensus': {
    component: lazy(() => import('../components/nodes/AnalystConsensus').then((m) => ({ default: m.AnalystConsensus }))),
    propSchema: AnalystConsensusPropsSchema,
  },
  'asset-price-header': {
    component: lazy(() => import('../components/nodes/AssetPriceHeader').then((m) => ({ default: m.AssetPriceHeader }))),
    propSchema: AssetPriceHeaderPropsSchema,
  },
  'earnings-history-chart': {
    component: lazy(() => import('../components/nodes/EarningsHistoryChart').then((m) => ({ default: m.EarningsHistoryChart }))),
    propSchema: EarningsHistoryChartPropsSchema,
  },
  'price-movement-timeline': {
    component: lazy(() => import('../components/nodes/PriceMovementTimeline').then((m) => ({ default: m.PriceMovementTimeline }))),
    propSchema: PriceMovementTimelinePropsSchema,
  },
  'ai-rationale-rail': {
    component: lazy(() => import('../components/nodes/AiRationaleRail').then((m) => ({ default: m.AiRationaleRail }))),
    propSchema: AiRationaleRailPropsSchema,
  },
  'trend-chart': {
    component: lazy(() => import('../components/nodes/TrendChart').then((m) => ({ default: m.TrendChart }))),
    propSchema: TrendChartPropsSchema,
  },
  'key-issues-card': {
    component: lazy(() => import('../components/nodes/KeyIssuesCard').then((m) => ({ default: m.KeyIssuesCard }))),
    propSchema: KeyIssuesCardPropsSchema,
  },
  'asset-card-grid': {
    component: lazy(() => import('../components/nodes/AssetCardGrid').then((m) => ({ default: m.AssetCardGrid }))),
    propSchema: AssetCardGridPropsSchema,
  },
  'contribution-bars': {
    component: lazy(() => import('../components/nodes/ContributionBars').then((m) => ({ default: m.ContributionBars }))),
    propSchema: ContributionBarsPropsSchema,
  },
  'risk-return-scatter': {
    component: lazy(() => import('../components/nodes/RiskReturnScatter').then((m) => ({ default: m.RiskReturnScatter }))),
    propSchema: RiskReturnScatterPropsSchema,
  },
  'asset-trend-card': {
    component: lazy(() => import('../components/nodes/AssetTrendCard').then((m) => ({ default: m.AssetTrendCard }))),
    propSchema: AssetTrendCardPropsSchema,
  },
};
