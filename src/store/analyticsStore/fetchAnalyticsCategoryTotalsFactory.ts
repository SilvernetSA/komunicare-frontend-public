import { apiClient } from '../apiClient';
import { getReportTotal } from './report';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { CategoryTotals, GAClient } from '../../types/analytics';

interface FetchAnalyticsCategoryTotalsArgs {
  gaClient: GAClient;
  days: number;
  currentCategoryTotals: CategoryTotals;
}

export const fetchAnalyticsCategoryTotalsFactory =
  () =>
  async ({
    gaClient,
    days,
    currentCategoryTotals,
  }: FetchAnalyticsCategoryTotalsArgs): Promise<CategoryTotals> => {
    const baseData = {
      mobileView: false,
      clientId: gaClient.clientId,
      startDate: `${days}daysago`,
      endDate: 'today',
      metric: 'totalEvents',
      dimension: 'eventCategory',
      filter: '',
    };
    const fullRequest = [
      {
        ...baseData,
        filter: { name: 'eventCategory', value: 'Navigation' },
      },
      {
        ...baseData,
        filter: { name: 'eventCategory', value: 'Speech' },
      },
      {
        ...baseData,
        filter: { name: 'eventCategory', value: 'Editing' },
      },
    ];

    try {
      const { data } = await apiClient.post('/analytics/batchGet', fullRequest);
      return {
        navigation: {
          ...currentCategoryTotals.navigation,
          value: getReportTotal(data, 0),
        },
        speech: {
          ...currentCategoryTotals.speech,
          value: getReportTotal(data, 1),
        },
        edit: {
          ...currentCategoryTotals.edit,
          value: getReportTotal(data, 2),
        },
      };
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Unexpected analytics error'));
      return currentCategoryTotals;
    }
  };
