import { apiClient } from '@/store/apiClient';
import { getReportRows, getReportTotal } from './report';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { AnalyticsTotals, GAClient } from '@/types/analytics';

interface FetchAnalyticsTotalsArgs {
  gaClient: GAClient;
  days: number;
  currentTotals: AnalyticsTotals;
}

export const fetchAnalyticsTotalsFactory =
  () =>
  async ({
    gaClient,
    days,
    currentTotals,
  }: FetchAnalyticsTotalsArgs): Promise<AnalyticsTotals> => {
    const baseData = {
      mobileView: false,
      clientId: gaClient.clientId,
      startDate: `${days}daysago`,
      endDate: 'today',
      metric: 'totalEvents',
      dimension: 'eventLabel',
      filter: '',
    };
    const fullRequest = [
      {
        ...baseData,
        filter: { name: 'eventAction', value: 'Click Symbol' },
      },
      {
        ...baseData,
        filter: { name: 'eventAction', value: 'Click Output' },
      },
      {
        ...baseData,
        filter: { name: 'eventAction', value: 'Create Tile' },
      },
      {
        ...baseData,
        filter: { name: 'eventAction', value: 'Edit Tiles' },
      },
      {
        ...baseData,
        filter: { name: 'eventAction', value: 'Change Board' },
      },
    ];

    try {
      const { data } = await apiClient.post('/analytics/batchGet', fullRequest);
      return {
        words: {
          ...currentTotals.words,
          total: getReportTotal(data, 0),
          rows: getReportRows(data, 0, 'sound'),
        },
        phrases: {
          ...currentTotals.phrases,
          total: getReportTotal(data, 1),
          rows: getReportRows(data, 1, 'sound'),
        },
        editions: {
          ...currentTotals.editions,
          total:
            Number(getReportTotal(data, 2)) + Number(getReportTotal(data, 3)),
          rows: [...getReportRows(data, 2), ...getReportRows(data, 3)],
        },
        boards: {
          ...currentTotals.boards,
          total: getReportTotal(data, 4, 'rowCount'),
          rows: getReportRows(data, 4),
        },
      };
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Unexpected analytics error'));
      return currentTotals;
    }
  };
