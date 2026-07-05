export type { AnalyticsTotals } from './analytics/fetchAnalyticsTotals/AnalyticsTotals';
export type { CategoryTotals } from './analytics/fetchAnalyticsCategoryTotals/CategoryTotals';

export interface GAClient {
  clientId: string;
  timerId: string;
}

export interface UsageData {
  max: number;
  min: number;
  data: number[];
}
