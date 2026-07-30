import { normalizeDefaultBoardsIncluded } from './defaultBoardsIncluded';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { Communicator } from '../types/communicator';

function getActiveCommunicator(): Communicator | undefined {
  const { communicators, activeCommunicatorId } =
    useCommunicatorsStore.getState();
  return communicators.find(
    (communicator) => communicator.id === activeCommunicatorId,
  );
}

export function replaceDefaultHomeBoardIfIsNecessary(
  prev: string,
  current: string,
) {
  const activeCommunicator = getActiveCommunicator();
  if (!activeCommunicator) {
    return;
  }
  const defaultBoardsIncluded = activeCommunicator?.defaultBoardsIncluded;

  const updatedValue = defaultBoardsIncluded?.map((defaultBoard) => {
    if (defaultBoard.homeBoard === prev) defaultBoard.homeBoard = current;
    return defaultBoard;
  });

  if (defaultBoardsIncluded) {
    useCommunicatorsStore
      .getState()
      .updateDefaultBoardsIncluded(
        normalizeDefaultBoardsIncluded(updatedValue as any),
      );
  }
}
