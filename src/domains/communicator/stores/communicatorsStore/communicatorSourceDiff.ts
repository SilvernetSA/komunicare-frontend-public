import { apiClient } from '@/store/apiClient';

export interface SourceDiffTile {
  id: string;
  label: string;
  image?: string;
}

export interface SourceDiffNewBoard {
  boardId: string;
  boardName: string;
  tileCount: number;
  parentBoardId?: string;
  parentBoardName?: string;
}

export interface SourceDiffRemovedBoard {
  boardId: string;
  boardName: string;
}

export type SourceDiffModifiedBoardChangeKind =
  | 'name'
  | 'caption'
  | 'description'
  | 'grid'
  | 'tiles';

export interface SourceDiffModifiedBoard {
  boardId: string;
  boardName: string;
  isRootBoard?: boolean;
  officialTileCount: number;
  userTileCount: number;
  addedTiles: SourceDiffTile[];
  removedTiles: SourceDiffTile[];
  changeKinds: SourceDiffModifiedBoardChangeKind[];
}

export interface SourceDiffResult {
  officialVersion: number;
  userSourceVersion?: number;
  hasUpdates: boolean;
  officialCommunicatorName: string;
  changes: {
    newBoards: SourceDiffNewBoard[];
    removedBoards: SourceDiffRemovedBoard[];
    modifiedBoards: SourceDiffModifiedBoard[];
  };
}

export interface ApplyUpdatesPayload {
  newBoardIds: string[];
  removedBoardIds: string[];
  modifiedBoardUpdates: Array<{ boardId: string; useOfficialTiles: boolean }>;
}

export async function getCommunicatorSourceDiff(
  communicatorId: string,
): Promise<SourceDiffResult> {
  const res = await apiClient.get<SourceDiffResult>(
    `/communicator/${communicatorId}/source-diff`,
  );
  return res.data;
}

export async function applySourceUpdates(
  communicatorId: string,
  payload: ApplyUpdatesPayload,
): Promise<void> {
  await apiClient.post(
    `/communicator/${communicatorId}/apply-source-updates`,
    payload,
  );
}
