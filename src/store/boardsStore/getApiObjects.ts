import { useAppStore } from '../appStore';
import { useCommunicatorsStore } from '../communicatorsStore';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

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
