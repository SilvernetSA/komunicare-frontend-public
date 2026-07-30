import { create } from 'zustand';

import { fetchAnalyticsCategoryTotalsFactory } from './analyticsStore/fetchAnalyticsCategoryTotalsFactory';
import { fetchAnalyticsTotalsFactory } from './analyticsStore/fetchAnalyticsTotalsFactory';
import { fetchAnalyticsUsageFactory } from './analyticsStore/fetchAnalyticsUsageFactory';

import type {
  AnalyticsTotals,
  CategoryTotals,
  GAClient,
  UsageData,
} from '@/types/analytics';

export interface AnalyticsStore {
  fetchAnalyticsUsage: (args: {
    gaClient: GAClient;
    days: number;
  }) => Promise<UsageData>;
  fetchAnalyticsTotals: (args: {
    gaClient: GAClient;
    days: number;
    currentTotals: AnalyticsTotals;
  }) => Promise<AnalyticsTotals>;
  fetchAnalyticsCategoryTotals: (args: {
    gaClient: GAClient;
    days: number;
    currentCategoryTotals: CategoryTotals;
  }) => Promise<CategoryTotals>;
}

export const useAnalyticsStore = create<AnalyticsStore>()(() => ({
  fetchAnalyticsUsage: fetchAnalyticsUsageFactory(),
  fetchAnalyticsTotals: fetchAnalyticsTotalsFactory(),
  fetchAnalyticsCategoryTotals: fetchAnalyticsCategoryTotalsFactory(),
}));

export type { AnalyticsTotals, CategoryTotals } from '@/types/analytics';
