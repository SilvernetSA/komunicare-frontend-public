import { normalizeCommunicatorDefaultBoardsIncluded } from '@/utils/defaultBoardsIncluded';

import type { Communicator } from '@/types/communicator';

const LOCAL_DEFAULT_COMMUNICATOR_ID = 'komunicare_default';

export const mergeCommunicators = (
  currentCommunicators: Communicator[],
  apiCommunicators: Communicator[],
): Communicator[] => {
  const myCommunicators =
    apiCommunicators && apiCommunicators.length
      ? currentCommunicators.filter(
          (communicator) => communicator.id !== LOCAL_DEFAULT_COMMUNICATOR_ID,
        )
      : [...currentCommunicators];

  for (const apiCommunicator of apiCommunicators || []) {
    const normalizedCommunicator =
      normalizeCommunicatorDefaultBoardsIncluded(apiCommunicator);
    let found = false;
    for (let j = 0; j < myCommunicators.length; j++) {
      if (myCommunicators[j].id === normalizedCommunicator.id) {
        myCommunicators[j] = {
          ...myCommunicators[j],
          ...normalizedCommunicator,
        };
        found = true;
        break;
      }
    }
    if (!found) {
      myCommunicators.push(normalizedCommunicator);
    }
  }
  return myCommunicators;
};
