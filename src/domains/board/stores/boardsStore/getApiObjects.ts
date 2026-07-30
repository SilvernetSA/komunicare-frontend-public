import { useAppStore } from '@/domains/app/stores/appStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

export const getApiObjects = async (
  fetchSystemBoards: () => Promise<void>,
  fetchUserBoards: () => Promise<unknown>,
): Promise<void> => {
  try {
    await Promise.all([
      fetchSystemBoards(),
      useCommunicatorsStore
        .getState()
        .fetchSystemCommunicators({ force: false }),
    ]);

    const userEmail = String(
      (useAppStore.getState().userData as any)?.email || '',
    );
    if (!userEmail) {
      return;
    }

    await Promise.all([
      fetchUserBoards(),
      useCommunicatorsStore.getState().fetchMyCommunicators(),
    ]);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load API objects'));
  }
};
