import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type {
  Transaction,
  TransactionResponse,
} from '../../types/subscription';

export const postTransactionFactory =
  (getSubscriberId: () => string) =>
  async (transaction: Transaction): Promise<TransactionResponse> => {
    try {
      const subscriberId = getSubscriberId();
      if (!subscriberId) throw new Error('No subscriber id supplied');
      const { data } = await apiClient.post<TransactionResponse>(
        `/subscriber/${subscriberId}/transaction`,
        transaction,
      );
      return data;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unexpected subscription error',
      );
      console.error('Failed to post transaction', message);
      throw new Error(message);
    }
  };
