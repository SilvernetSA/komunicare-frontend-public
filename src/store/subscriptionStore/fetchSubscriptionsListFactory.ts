import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Subscription } from '../../types/subscription';

export const fetchSubscriptionsListFactory =
  () => async (): Promise<Subscription[]> => {
    try {
      const { data } = await apiClient.get<any>('/subscription/list');
      const subscriptions =
        data?.suscriptions ??
        data?.subscriptions ??
        data?.data?.suscriptions ??
        data?.data?.subscriptions ??
        [];
      return subscriptions as Subscription[];
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unexpected subscription error',
      );
      console.error('Failed to fetch subscriptions list', message);
      throw new Error(message);
    }
  };
