import { apiClient } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

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
