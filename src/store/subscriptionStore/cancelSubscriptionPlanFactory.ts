import { apiClient } from '../apiClient';
import { useAppStore } from '../appStore';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

export const cancelSubscriptionPlanFactory = () => async (): Promise<void> => {
  try {
    const userId = (useAppStore.getState().userData as any)?.id;
    if (!userId) throw new Error('No user id');
    await apiClient.post(`/subscriber/${userId}/cancel`);
  } catch (error) {
    const message = getApiErrorMessage(error, 'Unexpected subscription error');
    console.error('Failed to cancel subscription', message);
    throw new Error(message);
  }
};
