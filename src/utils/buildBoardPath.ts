import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';

export function buildBoardPath(boardId: string, communicatorId?: string): string {
  const cId =
    communicatorId ?? useCommunicatorsStore.getState().activeCommunicatorId;
  return `/communicator/${cId}/board/${boardId}`;
}
