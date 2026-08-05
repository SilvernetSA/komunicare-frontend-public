import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

export const reportCommunicatorToApi = async (
  reportData: Record<string, unknown>,
): Promise<void> => {
  try {
    await apiClient.post('/communicator/report', reportData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
