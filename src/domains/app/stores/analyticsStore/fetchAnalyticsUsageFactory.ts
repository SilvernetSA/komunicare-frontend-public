import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { GAClient, UsageData } from '@/types/analytics';

interface FetchAnalyticsUsageArgs {
  gaClient: GAClient;
  days: number;
}

export const fetchAnalyticsUsageFactory =
  () =>
  async ({ gaClient, days }: FetchAnalyticsUsageArgs): Promise<UsageData> => {
    const request = {
      mobileView: false,
      clientId: gaClient.clientId,
      startDate: `${days}daysago`,
      endDate: 'today',
      metric: 'avgSessionDuration',
      dimension: 'nthDay',
    };

    const template = Array.from({ length: days }, () => 0);
    const usage: UsageData = {
      max: 10,
      min: 0,
      data: template.slice(),
    };

    try {
      const { data } = await apiClient.post('/analytics/batchGet', [request]);
      const rows = data?.reports?.[0]?.data?.rows;
      if (Array.isArray(rows)) {
        rows
          .map((row: any) => ({
            index: parseInt(row.dimensions?.[1], 10),
            value: parseInt(row.metrics?.[0]?.values?.[0] ?? '0', 10) / 60,
          }))
          .forEach(({ index, value }) => {
            if (!Number.isNaN(index) && index >= 0 && index < template.length) {
              template[index] = value;
            }
          });

        const maximum = data.reports?.[0]?.data?.maximums?.[0]?.values?.[0];
        const max = maximum ? Math.ceil(parseInt(maximum, 10) / 60) : usage.max;

        return {
          max,
          min: 0,
          data: template,
        };
      }
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Unexpected analytics error'));
    }

    return usage;
  };
