import { Dispatch, SetStateAction } from 'react';
import { IntlShape } from 'react-intl';

import { Board as BoardModel } from '@/types/board';
import messages from '../../Board.messages';

interface HandleConfirmDeleteParams {
  activeBoard: BoardModel | undefined;
  selectedTileIds: string[];
  userEmail?: string;
  deleteTilesAction: (payload: { boardId: string; tileIds: string[] }) => void;
  runApiUpdate: (payload: {
    tile: null;
    deletedTilesiIds: string[];
    editedTiles: null;
    processedBoard: null;
  }) => Promise<boolean>;
  setConfirmDeleteOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedTileIds: Dispatch<SetStateAction<string[]>>;
  setIsSelecting: Dispatch<SetStateAction<boolean>>;
  showNotification: (message: string) => void;
  intl: IntlShape;
}

/**
 * Deletes selected tiles with offline-safe behavior and API persistence when available.
 */
export const handleConfirmDelete = async ({
  activeBoard,
  selectedTileIds,
  userEmail,
  deleteTilesAction,
  runApiUpdate,
  setConfirmDeleteOpen,
  setSelectedTileIds,
  setIsSelecting,
  showNotification,
  intl,
}: HandleConfirmDeleteParams) => {
  if (!activeBoard) return;

  setConfirmDeleteOpen(false);
  const idsToDelete = [...selectedTileIds];
  if (!idsToDelete.length) {
    return;
  }

  if (!userEmail) {
    deleteTilesAction({ boardId: activeBoard.id, tileIds: idsToDelete });
    setSelectedTileIds([]);
    setIsSelecting(false);
    showNotification(intl.formatMessage(messages.tilesDeleted));
    return;
  }

  const saved = await runApiUpdate({
    tile: null,
    deletedTilesiIds: idsToDelete,
    editedTiles: null,
    processedBoard: null,
  });

  if (!saved) {
    return;
  }

  setSelectedTileIds([]);
  setIsSelecting(false);
  showNotification(intl.formatMessage(messages.tilesDeleted));
};
