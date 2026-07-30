import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

export const getSubscriberByUserIdApi = async (
  userId: string,
  requestOrigin: string,
): Promise<any> => {
  try {
    const { useAppStore } = await import('@/domains/app/stores/appStore');
    const userData = useAppStore.getState().userData as any;
    if (userData?.isByBackOffice) {
      return { userId, status: 'active', isByBackOffice: true };
    }
    const { data } = await apiClient.get<any>(`/subscriber/${userId}`, {
      headers: { requestOrigin },
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
