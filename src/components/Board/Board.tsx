import CircularProgress from '@mui/material/CircularProgress';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Fragment,
} from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import messages from './Board.messages';
import {
  handleLateBoardFallbackEffect,
  handleUrlBoardSyncEffect,
  runUserObjectsSyncEffect,
  runBoardInitializationEffect,
} from './BoardContainer/effects';
import BoardDialogs from './BoardDialogs/BoardDialogs';
import TileEditor from './TileEditor/TileEditor.refactored';
import {
  findExistingPersonalCopyForBoardWithRefresh,
  isProtectedBoard,
  isProtectedCommunicator,
} from './utils-simple/copyOnWrite';
import { handleApiUpdates } from './utils-simple/handleApiUpdates';
import { translateBoard } from './utils-simple/translateBoard';
import { EMPTY_VOICES } from '../../providers/SpeechProvider/SpeechProvider.constants';
import { useAppStore } from '../../store/appStore';
import { useBoardsStore } from '../../store/boardsStore';
import { useCommunicatorsStore } from '../../store/communicatorsStore';
import { useLanguageStore } from '../../store/languageStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useSpeechStore } from '../../store/voicesStore';
import Board from './BoardContainer/Board/Board.component';
import { uploadTileSound } from '../../store/uploadsStore/uploadTileSound';
import { Board as BoardModel, Tile } from '../../types/board';
import { Communicator } from '../../types/communicator';
import { changeDefaultBoard } from '../../utils/changeDefaultBoard';
import { DefaultBoardSelection } from '../../utils/changeDefaultBoard';
import { handleConfirmDelete as handleConfirmDeleteUtil } from './BoardContainer/handlers/handleConfirmDelete';
import { handleExistingCopyFound } from './BoardContainer/handlers/handleExistingCopyFound';
import { handleGoToExistingCopy as handleGoToExistingCopyUtil } from './BoardContainer/handlers/handleGoToExistingCopy';
import { handleTileClick as handleTileClickUtil } from './BoardContainer/handlers/handleTileClick';

export type ApiUpdatePayload = {
  tile: Tile | null;
  deletedTilesiIds: string[] | null;
  editedTiles: Tile[] | null;
  processedBoard: BoardModel | null;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function getFilteredBoards(boards: BoardModel[], communicator: Communicator) {
  return boards.filter(
    (b) => b !== null && b.id !== null && communicator?.boards?.includes(b.id),
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const BoardContainer: React.FC = () => {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();

  // ── stores ──────────────────────────────────────────────────────────────────
  const boards = useBoardsStore((s) => s.boards);
  const activeBoardId = useBoardsStore((s) => s.activeBoardId);
  // Select activeBoard directly so this component only re-renders when the
  // active board object itself changes, not on every boards-array replacement.
  const activeBoard = useBoardsStore(
    (s) => s.boards.find((b) => b.id === s.activeBoardId) as BoardModel,
  );
  const navHistory = useBoardsStore((s) => s.navHistory);
  const output = useBoardsStore((s) => s.output);

  const changeBoard = useBoardsStore((s) => s.changeBoard);
  const previousBoard = useBoardsStore((s) => s.previousBoard);
  const toRootBoard = useBoardsStore((s) => s.toRootBoard);
  const historyRemoveBoard = useBoardsStore((s) => s.historyRemoveBoard);
  const switchBoard = useBoardsStore((s) => s.switchBoard);
  const createBoard = useBoardsStore((s) => s.createBoard);
  const updateBoard = useBoardsStore((s) => s.updateBoard);
  const replaceBoard = useBoardsStore((s) => s.replaceBoard);
  const createTileAction = useBoardsStore((s) => s.createTile);
  const deleteTilesAction = useBoardsStore((s) => s.deleteTiles);
  const editTilesAction = useBoardsStore((s) => s.editTiles);
  const focusTileAction = useBoardsStore((s) => s.focusTile);
  const changeOutput = useBoardsStore((s) => s.changeOutput);
  const getApiObjects = useBoardsStore((s) => s.getApiObjects);
  const fetchBoardById = useBoardsStore((s) => s.fetchBoardById);
  const syncBoardsWithCommunicator = useBoardsStore(
    (s) => s.syncBoardsWithCommunicator,
  );
  const syncBoardWithCommunicator = useBoardsStore(
    (s) => s.syncBoardWithCommunicator,
  );

  const communicators = useCommunicatorsStore((s) => s.communicators);
  const activeCommunicatorId = useCommunicatorsStore(
    (s) => s.activeCommunicatorId,
  );
  const fetchMyCommunicators = useCommunicatorsStore(
    (s) => s.fetchMyCommunicators,
  );
  const upsertCommunicator = useCommunicatorsStore((s) => s.upsertCommunicator);
  const addBoardCommunicator = useCommunicatorsStore(
    (s) => s.addBoardCommunicator,
  );

  const userData = useAppStore((s) => s.userData) as any;
  const displaySettings = useAppStore((s) => s.displaySettings);
  const navigationSettings = useAppStore((s) => s.navigationSettings);
  const liveHelp = useAppStore((s) => s.liveHelp) as any;
  const isConnected = useAppStore((s) => s.isConnected);
  const disableTour = useAppStore((s) => s.disableTour);

  const lang = useLanguageStore((s) => s.lang);
  const { showNotification, hideNotification } =
    useNotificationStore.getState();
  const voices = useSpeechStore((s) => s.voices);
  const speechOptions = useSpeechStore((s) => s.options);

  // ── derived ─────────────────────────────────────────────────────────────────
  const communicator = communicators.find(
    (c) => c.id === activeCommunicatorId,
  ) as Communicator;
  const emptyVoiceAlert = !(
    voices.length > 0 && speechOptions.voiceURI !== EMPTY_VOICES
  );
  const offlineVoiceAlert = !isConnected && !!speechOptions.isCloud;

  // ── local state ──────────────────────────────────────────────────────────────
  const [translatedBoard, setTranslatedBoard] = useState<BoardModel | null>(
    null,
  );
  const [isLocked, setIsLocked] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isFixedBoard, setIsFixedBoard] = useState(false);
  const [tileEditorOpen, setTileEditorOpen] = useState(false);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [copyPublicBoard, setCopyPublicBoard] = useState<BoardModel | false>(
    false,
  );
  const [blockedPrivateBoard, setBlockedPrivateBoard] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [existingCopyFoundOpen, setExistingCopyFoundOpen] = useState(false);
  const [existingCopyCommunicatorId, setExistingCopyCommunicatorId] =
    useState('');
  const [existingCopyBoardId, setExistingCopyBoardId] = useState('');
  const [copiedTiles, setCopiedTiles] = useState<Tile[]>([]);
  const [isScroll, setIsScrollState] = useState(false);
  const [totalRows, setTotalRows] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncedUserEmailRef = useRef('');
  const loadingUrlBoardIdRef = useRef('');
  const lastNavigateTargetRef = useRef('');

  // ── Traducir el board activo cuando cambia ───────────────────────────────────
  useEffect(() => {
    if (activeBoard) {
      setTranslatedBoard(translateBoard(activeBoard, intl as any));
      setIsFixedBoard(!!activeBoard.isFixed);
    }
  }, [activeBoard, intl]);

  // ── Navegación: cuando la URL cambia, cargar el tablero ──────────────────────
  useEffect(() => {
    handleUrlBoardSyncEffect({
      urlId,
      activeBoardId,
      boards,
      changeBoard,
      fetchBoardById,
      userEmail: userData?.email,
      setBlockedPrivateBoard,
      historyRemoveBoard,
      navigate,
      pathname: location.pathname,
      lastNavigateTargetRef,
      loadingUrlBoardIdRef,
    });
  }, [urlId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Inicialización ───────────────────────────────────────────────────────────
  useEffect(() => {
    void runBoardInitializationEffect({
      isInitialized,
      userEmail: userData?.email,
      setSyncedUserEmail: (email) => {
        syncedUserEmailRef.current = email;
      },
      getApiObjects,
      urlId,
      fetchBoardById,
      historyRemoveBoard,
      changeBoard,
      navigate,
      pathname: location.pathname,
      lastNavigateTargetRef,
      setIsInitialized,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    runUserObjectsSyncEffect({
      isInitialized,
      userEmail: userData?.email,
      syncedUserEmailRef,
      getApiObjects,
    });
  }, [isInitialized, userData?.email, getApiObjects]);

  // ── Fallback: si el board llega tarde, activarlo automáticamente ────────────
  useEffect(() => {
    return handleLateBoardFallbackEffect({
      isInitialized,
      activeBoardId,
      boards,
      communicators: communicators as Communicator[],
      activeCommunicatorId,
      urlId,
      historyRemoveBoard,
      changeBoard,
      fetchBoardById,
      navigate,
      pathname: location.pathname,
      lastNavigateTargetRef,
    });
  }, [
    isInitialized,
    activeBoardId,
    communicators,
    activeCommunicatorId,
    urlId,
    boards,
    fetchBoardById,
    changeBoard,
    historyRemoveBoard,
    navigate,
    location.pathname,
  ]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleRequestPreviousBoard = useCallback(() => {
    if (navHistory.length >= 2) {
      const prevId = navHistory[navHistory.length - 2];
      if (!prevId) return;
      changeBoard(prevId);
      previousBoard();
      navigate(`/board/${prevId}`, { replace: true });
      return;
    }
    // No history (e.g. after a page refresh on a sub-board) — go to communicator root.
    const rootId = communicator?.rootBoard;
    if (rootId && rootId !== activeBoardId) {
      navigate(`/board/${rootId}`, { replace: true });
    }
  }, [
    navHistory,
    changeBoard,
    previousBoard,
    navigate,
    communicator,
    activeBoardId,
  ]);

  const handleRequestToRootBoard = useCallback(() => {
    toRootBoard();
    const rootId = navHistory[0];
    if (rootId) navigate(`/board/${rootId}`, { replace: true });
  }, [toRootBoard, navHistory, navigate]);

  const handleLockClick = useCallback(() => {
    setIsLocked((prev) => !prev);
  }, []);

  const handleLockNotify = useCallback(
    (countdown: number) => {
      if (countdown > 0) {
        showNotification(
          `${countdown} ${intl.formatMessage(messages.clicksToUnlock)}`,
        );
        return;
      }
      hideNotification();
    },
    [intl, showNotification, hideNotification],
  );

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

  const runApiUpdate = useCallback(
    (payload: ApiUpdatePayload) =>
      handleApiUpdates({
        ...payload,
        userData,
        communicator,
        board: activeBoard,
        intl,
        upsertCommunicator,
        syncBoardWithCommunicator,
        syncBoardsWithCommunicator,
        replaceBoard,
        updateBoard,
        switchBoard,
        lang,
        navigate,
        setSaving: (saving: boolean) => setIsSaving(saving),
        uploadTileSound: (tileToUpload: Tile) =>
          uploadTileSound(tileToUpload, userData),
        showNotification,
        communicators: communicators as any,
        onExistingCopyFound: (targetCommunicator: Communicator) =>
          handleExistingCopyFound({
            targetCommunicator,
            activeBoard,
            communicator,
            setExistingCopyCommunicatorId,
            setExistingCopyBoardId,
            setExistingCopyFoundOpen,
          }),
      }),
    [
      userData,
      communicator,
      activeBoard,
      intl,
      upsertCommunicator,
      syncBoardWithCommunicator,
      syncBoardsWithCommunicator,
      replaceBoard,
      updateBoard,
      switchBoard,
      lang,
      navigate,
      showNotification,
      communicators,
    ],
  );

  const handleTileClick = useCallback(
    (tile: Tile) => {
      handleTileClickUtil({
        tile,
        isSelecting,
        setSelectedTileIds,
        boards,
        changeBoard,
        navigate,
        fetchBoardById,
        showNotification,
        intl: intl as any,
        output,
        changeOutput,
      });
    },
    [
      isSelecting,
      boards,
      output,
      changeBoard,
      changeOutput,
      navigate,
      fetchBoardById,
      intl,
      showNotification,
    ],
  );

  const handleAddClick = useCallback(async () => {
    if (isProtectedCommunicator(communicator as any, userData)) {
      const existingCopy = await findExistingPersonalCopyForBoardWithRefresh({
        communicators: communicators as any,
        fallbackCommunicators: communicators as any,
        activeCommunicator: communicator as any,
        userEmail: userData?.email,
        boardId: activeBoard?.id,
        fetchMyCommunicators,
      });
      if (existingCopy) {
        handleExistingCopyFound({
          targetCommunicator: existingCopy as any,
          activeBoard: activeBoard as any,
          communicator: communicator as any,
          setExistingCopyCommunicatorId,
          setExistingCopyBoardId,
          setExistingCopyFoundOpen,
        });
        return;
      }
    }
    setTileEditorOpen(true);
    setIsSelecting(false);
  }, [
    activeBoard,
    communicator,
    communicators,
    fetchMyCommunicators,
    userData,
    setExistingCopyCommunicatorId,
    setExistingCopyBoardId,
    setExistingCopyFoundOpen,
  ]);

  const handleEditClick = useCallback(() => {
    setTileEditorOpen(true);
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (!activeBoard || selectedTileIds.length === 0) return;
    setConfirmDeleteOpen(true);
  }, [activeBoard, selectedTileIds]);

  const handleTileEditorCancel = useCallback(() => {
    setTileEditorOpen(false);
    setSelectedTileIds([]);
    setIsSelecting(false);
  }, []);

  const handleEditBoardTitle = useCallback(
    async (name: string) => {
      if (!activeBoard) return;
      const trimmedName = String(name || '').trim();
      if (!trimmedName || trimmedName === activeBoard.name) return;
      const processedBoard: BoardModel = { ...activeBoard, name: trimmedName };
      updateBoard(processedBoard);
      await runApiUpdate({
        tile: null,
        deletedTilesiIds: null,
        editedTiles: null,
        processedBoard,
      });
    },
    [activeBoard, updateBoard, runApiUpdate],
  );

  const handleBoardTypeChange = useCallback(() => {
    if (!activeBoard) return;
    updateBoard({ ...activeBoard, isFixed: !activeBoard.isFixed });
    setIsFixedBoard((prev) => !prev);
  }, [activeBoard, updateBoard]);

  const handleCloseDialog = useCallback(() => {
    setCopyPublicBoard(false);
    setBlockedPrivateBoard(false);
    setConfirmDeleteOpen(false);
    setExistingCopyFoundOpen(false);
    setExistingCopyCommunicatorId('');
    setExistingCopyBoardId('');
  }, []);

  const handleGoToExistingCopy = useCallback(() => {
    handleGoToExistingCopyUtil({
      communicators: communicators as Communicator[],
      existingCopyCommunicatorId,
      existingCopyBoardId,
      switchBoard,
      navigate,
      setExistingCopyFoundOpen,
      setSelectedTileIds,
      setIsSelecting,
    });
  }, [
    communicators,
    existingCopyBoardId,
    existingCopyCommunicatorId,
    navigate,
    switchBoard,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    await handleConfirmDeleteUtil({
      activeBoard,
      selectedTileIds,
      userEmail: userData?.email,
      deleteTilesAction,
      runApiUpdate,
      setConfirmDeleteOpen,
      setSelectedTileIds,
      setIsSelecting,
      showNotification,
      intl: intl as any,
    });
  }, [
    activeBoard,
    deleteTilesAction,
    intl,
    runApiUpdate,
    selectedTileIds,
    showNotification,
    userData,
  ]);

  const handleCopyRemoteBoard = useCallback(async () => {
    if (!copyPublicBoard || typeof copyPublicBoard === 'boolean') return;
    const copiedBoard: BoardModel = {
      ...copyPublicBoard,
      isPublic: false,
      email: userData?.email || copyPublicBoard.email,
      author: userData?.name || copyPublicBoard.author,
    };
    createBoard(copiedBoard);
    addBoardCommunicator(copiedBoard.id);
    switchBoard(copiedBoard.id);
    navigate(`/board/${copiedBoard.id}`, { replace: true });
    setCopyPublicBoard(false);
  }, [
    copyPublicBoard,
    createBoard,
    addBoardCommunicator,
    switchBoard,
    navigate,
    userData?.email,
    userData?.name,
  ]);

  const publishBoard = useCallback(() => {
    if (!activeBoard) return;
    updateBoard({ ...activeBoard, isPublic: !activeBoard.isPublic });
  }, [activeBoard, updateBoard]);

  const setIsScroll = useCallback((val: boolean, rows?: number) => {
    setIsScrollState(val);
    if (rows !== undefined) setTotalRows(rows);
  }, []);

  const handleAddTileEditorSubmit = useCallback(
    async (tile: Tile) => {
      if (!activeBoard) return;
      if (tile.loadBoard && !tile.linkedBoard) {
        const childBoard: BoardModel = {
          id: tile.loadBoard,
          name: tile.label || '',
          nameKey: tile.labelKey,
          hidden: false,
          tiles: [],
          isPublic: false,
          author: userData?.name || activeBoard.author,
          email: userData?.email || activeBoard.email,
          locale: lang || activeBoard.locale,
          caption: tile.image,
        };
        createBoard(childBoard);
        addBoardCommunicator(childBoard.id);
      }
      createTileAction({ boardId: activeBoard.id, tile });
      await runApiUpdate({
        tile,
        deletedTilesiIds: null,
        editedTiles: null,
        processedBoard: null,
      });
      setTileEditorOpen(false);
    },
    [
      activeBoard,
      addBoardCommunicator,
      createBoard,
      createTileAction,
      lang,
      runApiUpdate,
      userData?.email,
      userData?.name,
    ],
  );

  const handleEditTileEditorSubmit = useCallback(
    async (tiles: Tile[]) => {
      if (!activeBoard) return;
      editTilesAction({ boardId: activeBoard.id, tiles });
      await runApiUpdate({
        tile: null,
        deletedTilesiIds: null,
        editedTiles: tiles,
        processedBoard: null,
      });
      setTileEditorOpen(false);
      setSelectedTileIds([]);
      setIsSelecting(false);
    },
    [activeBoard, editTilesAction, runApiUpdate],
  );

  const handleFocusTile = useCallback(
    (tileId: string, boardId: string) => {
      focusTileAction({ boardId, tileId });
    },
    [focusTileAction],
  );

  // Debounced API save for grid size changes (rows / columns).
  // We keep a ref to the pending timeout so rapid button presses only
  // produce a single network request once the user stops clicking.
  const gridSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveGridToApi = useCallback(
    (board: BoardModel) => {
      if (gridSaveTimerRef.current) clearTimeout(gridSaveTimerRef.current);
      gridSaveTimerRef.current = setTimeout(() => {
        // Only save if the board belongs to the current user (already copied).
        if (
          userData?.email &&
          board.email === userData.email &&
          board.id.length >= 14
        ) {
          useBoardsStore
            .getState()
            .updateRemoteBoard(board)
            .catch((err: Error) => {
              console.warn(
                '[Board] Failed to save grid size to API:',
                err.message,
              );
            });
        }
      }, 600);
    },
    [userData?.email],
  );

  // When the user tries to change rows/columns on an official (protected) board,
  // route protected grid edits through the same copy-on-write save flow
  // used by the rest of the board mutations.
  const handleGridEditOnProtectedBoard = useCallback(
    async (nextBoard: BoardModel): Promise<void> => {
      await runApiUpdate({
        tile: null,
        deletedTilesiIds: null,
        editedTiles: null,
        processedBoard: nextBoard,
      });
    },
    [runApiUpdate],
  );

  const handleAddRemoveRow = useCallback(
    (isAdd: boolean) => {
      if (!activeBoard?.grid) return;
      const grid = activeBoard.grid as any;
      const newRows = isAdd ? grid.rows + 1 : Math.max(1, grid.rows - 1);
      const newBoard = { ...activeBoard, grid: { ...grid, rows: newRows } };

      if (isProtectedBoard(activeBoard as any, userData)) {
        void handleGridEditOnProtectedBoard(newBoard);
        return;
      }
      updateBoard(newBoard);
      saveGridToApi(newBoard);
    },
    [
      activeBoard,
      userData,
      handleGridEditOnProtectedBoard,
      updateBoard,
      saveGridToApi,
    ],
  );

  const handleAddRemoveColumn = useCallback(
    (isAdd: boolean) => {
      if (!activeBoard?.grid) return;
      const grid = activeBoard.grid as any;
      const newCols = isAdd ? grid.columns + 1 : Math.max(1, grid.columns - 1);
      const newBoard = { ...activeBoard, grid: { ...grid, columns: newCols } };

      if (isProtectedBoard(activeBoard as any, userData)) {
        void handleGridEditOnProtectedBoard(newBoard);
        return;
      }
      updateBoard(newBoard);
      saveGridToApi(newBoard);
    },
    [
      activeBoard,
      userData,
      handleGridEditOnProtectedBoard,
      updateBoard,
      saveGridToApi,
    ],
  );

  const handleCopyTiles = useCallback(() => {
    if (!selectedTileIds.length || !activeBoard) return;
    const tiles =
      activeBoard.tiles?.filter((tile) => selectedTileIds.includes(tile.id)) ??
      [];
    setCopiedTiles(tiles);
    showNotification(intl.formatMessage(messages.tilesCopied));
  }, [selectedTileIds, activeBoard, intl, showNotification]);

  const handlePasteTiles = useCallback(async () => {
    if (!copiedTiles.length || !activeBoard) return;
    for (const tile of copiedTiles) {
      createTileAction({
        boardId: activeBoard.id,
        tile: { ...tile, id: `${tile.id}_copy_${Date.now()}` },
      });
    }
    showNotification(intl.formatMessage(messages.tilesPastedSuccessfully));
  }, [copiedTiles, activeBoard, createTileAction, intl, showNotification]);

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!translatedBoard) {
    return (
      <div className="Board__loading">
        <CircularProgress size={60} thickness={5} color="inherit" />
      </div>
    );
  }

  const disableBackButton = activeBoardId === communicator?.rootBoard;
  const editingTiles = tileEditorOpen
    ? selectedTileIds
        .map((id) => activeBoard?.tiles?.find((t) => t.id === id))
        .filter((t): t is Tile => !!t)
    : [];

  return (
    <Fragment>
      <Board
        canAccessToContent
        board={translatedBoard}
        intl={intl as any}
        disableBackButton={disableBackButton}
        userData={userData}
        isLocked={isLocked}
        isSaving={isSaving}
        isSelecting={isSelecting}
        isSelectAll={isSelectAll}
        isFixedBoard={isFixedBoard}
        isRootBoardTourEnabled={liveHelp?.isRootBoardTourEnabled}
        isUnlockedTourEnabled={liveHelp?.isUnlockedTourEnabled}
        onAddClick={handleAddClick}
        onDeleteClick={handleDeleteClick}
        onEditClick={handleEditClick}
        onSelectAllToggle={handleSelectAllToggle}
        onFocusTile={handleFocusTile}
        onLockClick={handleLockClick}
        onLockNotify={handleLockNotify as any}
        onRequestPreviousBoard={handleRequestPreviousBoard}
        onRequestToRootBoard={handleRequestToRootBoard}
        onSelectClick={handleSelectClick}
        onTileClick={handleTileClick}
        onBoardTypeChange={handleBoardTypeChange}
        editBoardTitle={handleEditBoardTitle}
        selectedTileIds={selectedTileIds}
        displaySettings={displaySettings}
        navigationSettings={navigationSettings}
        navHistory={navHistory}
        publishBoard={publishBoard}
        showNotification={showNotification}
        emptyVoiceAlert={emptyVoiceAlert}
        offlineVoiceAlert={offlineVoiceAlert}
        onAddRemoveColumn={handleAddRemoveColumn as any}
        onAddRemoveRow={handleAddRemoveRow as any}
        onTileDrop={() => {}}
        onLayoutChange={() => {}}
        disableTour={disableTour as any}
        onCopyTiles={handleCopyTiles}
        onPasteTiles={handlePasteTiles}
        copiedTiles={copiedTiles}
        setIsScroll={setIsScroll}
        isScroll={isScroll}
        totalRows={totalRows ?? 6}
        changeDefaultBoard={(selection: string | DefaultBoardSelection) =>
          changeDefaultBoard(
            selection,
            navigate,
            String(messages.originalCommunicatorCopyNamePrompt.defaultMessage),
          )
        }
      />
      <BoardDialogs
        copyPublicBoard={copyPublicBoard}
        blockedPrivateBoard={blockedPrivateBoard}
        confirmDeleteOpen={confirmDeleteOpen}
        existingCopyFoundOpen={existingCopyFoundOpen}
        onClose={handleCloseDialog}
        onCopyRemoteBoard={handleCopyRemoteBoard}
        onConfirmDelete={handleConfirmDelete}
        onGoToExistingCopy={handleGoToExistingCopy}
        intl={intl as any}
      />
      <TileEditor
        editingTiles={editingTiles}
        open={tileEditorOpen}
        onClose={handleTileEditorCancel}
        onEditSubmit={handleEditTileEditorSubmit}
        onAddSubmit={handleAddTileEditorSubmit}
        boards={getFilteredBoards(boards, communicator)}
        userData={userData}
      />
    </Fragment>
  );
};

export default BoardContainer;
