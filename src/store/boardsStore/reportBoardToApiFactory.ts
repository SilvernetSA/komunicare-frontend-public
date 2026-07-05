import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

export const reportBoardToApiFactory =
  () =>
  async (reportData: Record<string, unknown>): Promise<void> => {
    try {
      await apiClient.post('/board/report', reportData);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  };
