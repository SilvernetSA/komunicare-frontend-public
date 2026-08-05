import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { IntlShape } from 'react-intl';

import messages from '../components/Messages/Board.messages';

import { Board as BoardModel, Tile } from '@/types/board';

interface HandleSelectionConfirmDeleteParams {
  activeBoard: BoardModel | undefined;
  selectedTileIds: string[];
  userEmail?: string;
  deleteTilesAction: (payload: { boardId: string; tileIds: string[] }) => void;
  saveBoardChanges: (payload: {
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

export const handleSelectionConfirmDelete = async ({
  activeBoard,
  selectedTileIds,
  userEmail,
  deleteTilesAction,
  saveBoardChanges,
  setConfirmDeleteOpen,
  setSelectedTileIds,
  setIsSelecting,
  showNotification,
  intl,
}: HandleSelectionConfirmDeleteParams) => {
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

  const saved = await saveBoardChanges({
    tile: null,
    deletedTilesiIds: idsToDelete,
    editedTiles: null,
    processedBoard: null,
  });

  if (!saved) {
    showNotification(intl.formatMessage(messages.deleteTilesFailed));
    return;
  }

  setSelectedTileIds([]);
  setIsSelecting(false);
  showNotification(intl.formatMessage(messages.tilesDeleted));
};

interface UseBoardSelectionControllerParams {
  activeBoard?: BoardModel;
}

interface UseBoardSelectionControllerResult {
  isSelecting: boolean;
  isSelectAll: boolean;
  tileEditorOpen: boolean;
  selectedTileIds: string[];
  confirmDeleteOpen: boolean;
  editingTiles: Tile[];
  handleSelectClick: () => void;
  handleSelectAllToggle: () => void;
  handleDeleteClick: () => void;
  handleTileEditorCancel: () => void;
  closeTileEditorAndResetSelection: () => void;
  setIsSelecting: Dispatch<SetStateAction<boolean>>;
  setTileEditorOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedTileIds: Dispatch<SetStateAction<string[]>>;
  setConfirmDeleteOpen: Dispatch<SetStateAction<boolean>>;
}

export const useBoardSelectionController = ({
  activeBoard,
}: UseBoardSelectionControllerParams): UseBoardSelectionControllerResult => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [tileEditorOpen, setTileEditorOpen] = useState(false);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleSelectClick = useCallback(() => {
    setIsSelecting((prev) => !prev);
    setIsSelectAll(false);
    setSelectedTileIds([]);
  }, []);

  const handleSelectAllToggle = useCallback(() => {
    if (!activeBoard) return;

    if (isSelectAll) {
      setSelectedTileIds([]);
      setIsSelectAll(false);
      return;
    }

    setSelectedTileIds(activeBoard.tiles?.map((tile) => tile.id) ?? []);
    setIsSelectAll(true);
  }, [activeBoard, isSelectAll]);

  const handleDeleteClick = useCallback(() => {
    if (!activeBoard || selectedTileIds.length === 0) return;

    setConfirmDeleteOpen(true);
  }, [activeBoard, selectedTileIds]);

  const closeTileEditorAndResetSelection = useCallback(() => {
    setTileEditorOpen(false);
    setSelectedTileIds([]);
    setIsSelecting(false);
  }, []);

  const handleTileEditorCancel = useCallback(() => {
    closeTileEditorAndResetSelection();
  }, [closeTileEditorAndResetSelection]);

  const editingTiles = useMemo(
    () =>
      tileEditorOpen
        ? selectedTileIds
            .map((id) => activeBoard?.tiles?.find((tile) => tile.id === id))
            .filter((tile): tile is Tile => !!tile)
        : [],
    [activeBoard, selectedTileIds, tileEditorOpen],
  );

  return {
    isSelecting,
    isSelectAll,
    tileEditorOpen,
    selectedTileIds,
    confirmDeleteOpen,
    editingTiles,
    handleSelectClick,
    handleSelectAllToggle,
    handleDeleteClick,
    handleTileEditorCancel,
    closeTileEditorAndResetSelection,
    setIsSelecting,
    setTileEditorOpen,
    setSelectedTileIds,
    setConfirmDeleteOpen,
  };
};
