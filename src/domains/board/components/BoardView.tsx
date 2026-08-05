import classNames from 'classnames';
import keycode from 'keycode';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IntlShape } from 'react-intl';

import BoardHeader from './BoardView/BoardHeader.component';
import { BoardMainToolbar } from './BoardView/BoardMainToolbar';
import { BoardSideButtonsContainer } from './BoardView/BoardSideButtonsContainer';
import { BoardTitleDialog } from './BoardView/BoardTitleDialog';
import { setCommunicatorCopyDialogHandler } from '../hooks/useBoardSaveFlow/useBoardSaveFlow.copyOnWrite';

import BoardTour from '@/domains/board/components/BoardView/BoardTour';
import { NAVIGATION_BUTTONS_STYLE_SIDES } from '@/domains/settings/components/Settings/Navigation/Navigation.constants';
import { DisplaySettings, NavigationSettings, UserData } from '@/types/app';
import { Board as BoardType, Tile } from '@/types/board';
import { DefaultBoardSelection } from '@/utils/changeDefaultBoard';
import { getBoardDisplayTitle } from '@/utils/getBoardDisplayTitle';

import './Styles/Board.css';

interface BoardViewProps {
  board: BoardType;
  className?: string;
  disableBackButton?: boolean;
  canGoBack?: boolean;
  onDeleteClick?: () => void;
  onFocusTile?: (tileId: string, boardId: string) => void;
  onTileClick?: (tile: Tile) => void;
  onSaveBoardClick?: () => void;
  editBoardTitle?: (title: string) => Promise<void>;
  onLockNotify?: () => void;
  onRequestPreviousBoard?: () => void;
  onRequestToRootBoard?: () => void;
  selectedTileIds?: string[];
  displaySettings?: DisplaySettings;
  navigationSettings?: NavigationSettings;
  userData?: UserData;
  navHistory?: string[];
  emptyVoiceAlert?: boolean;
  offlineVoiceAlert?: boolean;
  onBoardTypeChange?: () => void;
  isFixedBoard?: boolean;
  onAddRemoveColumn?: () => void;
  onAddRemoveRow?: () => void;
  onLayoutChange?: () => void;
  isRootBoardTourEnabled?: boolean;
  isUnlockedTourEnabled?: boolean;
  disableTour?: () => void;
  copiedTiles?: Tile[];
  setIsScroll?: (isScroll: boolean, totalRows?: number) => void;
  isScroll?: boolean;
  canAccessToContent?: boolean;
  totalRows?: number;
  intl: IntlShape;
  isLocked?: boolean;
  isSaving?: boolean;
  isSelectAll?: boolean;
  isSelecting?: boolean;
  onAddClick?: () => void;
  onEditClick?: () => void;
  onSelectAllToggle?: () => void;
  onSelectClick?: () => void;
  onLockClick?: () => void;
  publishBoard?: () => void;
  onTileDrop?: (
    item: { id: string; type: string },
    position: { x: number; y: number },
  ) => void;
  onCopyTiles?: () => void;
  onPasteTiles?: () => void;
  changeDefaultBoard?: (selection: string | DefaultBoardSelection) => void;
  improvedPhrase?: string;
  speak?: (text: string) => void;
  showNotification?: (message: string) => void;
}

const BoardView: React.FC<BoardViewProps> = ({
  board,
  intl,
  userData,
  disableBackButton,
  canGoBack,
  isLocked,
  isSaving,
  isSelectAll,
  isSelecting,
  isFixedBoard,
  onAddClick,
  onDeleteClick,
  onEditClick,
  onSaveBoardClick,
  onSelectAllToggle,
  onSelectClick,
  onLockClick,
  onLockNotify,
  onRequestPreviousBoard,
  onRequestToRootBoard,
  onBoardTypeChange,
  selectedTileIds = [],
  navigationSettings = {},
  displaySettings = {
    uiSize: 'Standard',
    labelPosition: 'Below',
    shareShowActive: false,
    hideOutputActive: false,
  },
  publishBoard,
  emptyVoiceAlert = false,
  offlineVoiceAlert,
  onAddRemoveRow,
  onAddRemoveColumn,
  onTileDrop,
  onLayoutChange,
  isRootBoardTourEnabled,
  isUnlockedTourEnabled,
  disableTour,
  onCopyTiles,
  onPasteTiles,
  copiedTiles,
  setIsScroll,
  isScroll = false,
  totalRows,
  changeDefaultBoard,
  improvedPhrase,
  speak,
  canAccessToContent,
  onTileClick,
  onFocusTile,
  editBoardTitle,
  navHistory,
  showNotification,
}) => {
  const [openTitleDialog, setOpenTitleDialog] = useState(false);
  const [titleDialogValue, setTitleDialogValue] = useState(board?.name || '');

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const fixedBoardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Copy-on-write for official communicators is silent: when the user edits a
    // protected communicator without an existing personal copy, we create the
    // copy transparently using the auto-suggested name and redirect them to it.
    // No confirmation modal is shown here. The "you already have a copy" notice
    // is handled separately (existingCopyFound dialog) so the user still
    // understands when they are redirected to a pre-existing copy.
    setCommunicatorCopyDialogHandler((payload) =>
      Promise.resolve({
        name: payload.suggestedName,
        setAsStartup: false,
      }),
    );

    return () => {
      setCommunicatorCopyDialogHandler(null);
    };
  }, []);

  useEffect(() => {
    setTitleDialogValue(board?.name || '');
  }, [board?.name]);

  const handleTileClick = useCallback(
    (tile: Tile) => {
      if (tile.loadBoard && !isSelecting) {
        const ref = board.isFixed
          ? fixedBoardContainerRef.current
          : boardContainerRef.current;
        if (ref) {
          ref.scrollTop = 0;
        }
      }
      onTileClick?.(tile);
    },
    [onTileClick, isSelecting, board.isFixed],
  );

  const handleTileFocus = useCallback(
    (tileId: string) => {
      onFocusTile?.(tileId, board.id || '');
    },
    [onFocusTile, board.id],
  );

  const handleBoardKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.keyCode === keycode('esc')) {
        onRequestPreviousBoard?.();
      }
    },
    [onRequestPreviousBoard],
  );

  const handleBoardTitleClick = useCallback(() => {
    if (!userData?.email) {
      return false;
    }
    setOpenTitleDialog(true);
    setTitleDialogValue(board.name || '');
  }, [userData?.email, board.name]);

  const handleBoardTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitleDialogValue(event.target.value);
    },
    [],
  );

  const handleImprovedPhrase = useCallback((_improvedPhrase: string) => {}, []);

  const handleBoardTitleClose = useCallback(() => {
    setOpenTitleDialog(false);
    setTitleDialogValue(board.name || board.id || '');
  }, [board.name, board.id]);

  const handleBoardTitleSubmit = useCallback(async () => {
    if (titleDialogValue.length) {
      try {
        await editBoardTitle?.(titleDialogValue);
      } catch {}
    }
    handleBoardTitleClose();
  }, [titleDialogValue, editBoardTitle, handleBoardTitleClose]);

  const isLoggedIn = !!userData?.email;
  const isNavigationButtonsOnTheSide =
    navigationSettings?.navigationButtonsStyle === undefined ||
    navigationSettings?.navigationButtonsStyle ===
      NAVIGATION_BUTTONS_STYLE_SIDES;
  // `canGoBack` (from Board.tsx) covers cases where communicator-root
  // navigation is possible even if navHistory stayed shallow.
  const hasBackHistory = canGoBack ?? (navHistory?.length || 0) > 1;
  const hasRootHistory = canGoBack ?? (navHistory?.length || 0) > 2;

  // Use ?? true so that undefined values (missing from old localStorage) default
  // to enabled — only an explicit false disables them.
  const caBackButtonActive = navigationSettings?.caBackButtonActive ?? true;
  const bigScrollButtonsActive =
    navigationSettings?.bigScrollButtonsActive ?? true;

  // Navigation buttons: in side mode the bar always reserves its space (like the
  // scroll bar) and the arrows grey out at the root — so the tile grid never
  // shifts when entering/leaving folders. Other layouts keep show-on-demand.
  const shouldShowNavigationButtons = Boolean(
    caBackButtonActive &&
    !isSelecting &&
    (hasBackHistory || isNavigationButtonsOnTheSide) &&
    (!isSaving || isNavigationButtonsOnTheSide),
  );
  // Scroll buttons: always visible when enabled — the component itself
  // applies a 'disable' CSS class when at top/bottom edge.
  const shouldShowScrollButtons = Boolean(bigScrollButtonsActive && !isSaving);

  return (
    <>
      <div
        className={classNames('Board', {
          'is-locked': isLocked,
        })}
      >
        <BoardTour
          isLocked={isLocked}
          isRootBoardTourEnabled={isRootBoardTourEnabled}
          isUnlockedTourEnabled={isUnlockedTourEnabled}
          disableTour={disableTour}
          intl={intl}
          onDefaultBoardOptionClick={changeDefaultBoard}
        />
        <BoardMainToolbar
          board={board}
          isLocked={isLocked}
          isSelecting={isSelecting}
          isSaving={isSaving}
          isSelectAll={isSelectAll}
          isLoggedIn={isLoggedIn}
          isFixedBoard={isFixedBoard}
          disableBackButton={disableBackButton}
          shouldShowNavigationButtons={shouldShowNavigationButtons}
          isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
          userData={userData}
          selectedTileIds={selectedTileIds}
          copiedTiles={copiedTiles}
          onBoardTitleClick={handleBoardTitleClick}
          onRequestPreviousBoard={onRequestPreviousBoard}
          onLockClick={onLockClick}
          onLockNotify={onLockNotify}
          onAddClick={onAddClick}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
          onSaveBoardClick={onSaveBoardClick}
          onSelectAllToggle={onSelectAllToggle}
          onSelectClick={onSelectClick}
          onBoardTypeChange={onBoardTypeChange}
          onCopyTiles={onCopyTiles}
          onPasteTiles={onPasteTiles}
          publishBoard={publishBoard}
          showNotification={showNotification}
        />
        <BoardHeader
          intl={intl}
          displaySettings={displaySettings}
          emptyVoiceAlert={emptyVoiceAlert}
          offlineVoiceAlert={offlineVoiceAlert}
          improvedPhrase={improvedPhrase}
          speak={speak}
          onPhraseImproved={handleImprovedPhrase}
        />
        {isLocked && (
          <h2 className="Board__title-heading">
            {getBoardDisplayTitle(board, intl as any)}
          </h2>
        )}
        <BoardSideButtonsContainer
          board={board}
          intl={intl}
          caBackButtonActive={caBackButtonActive}
          shouldShowNavigationButtons={shouldShowNavigationButtons}
          shouldShowScrollButtons={shouldShowScrollButtons}
          isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
          hasBackHistory={hasBackHistory}
          hasRootHistory={hasRootHistory}
          isSelecting={isSelecting}
          isSaving={isSaving}
          isFixedBoard={isFixedBoard}
          isScroll={isScroll}
          isLocked={isLocked}
          totalRows={totalRows}
          selectedTileIds={selectedTileIds}
          navHistory={navHistory}
          displaySettings={displaySettings}
          navigationSettings={navigationSettings}
          canAccessToContent={canAccessToContent}
          boardContainerRef={boardContainerRef}
          fixedBoardContainerRef={fixedBoardContainerRef}
          onRequestPreviousBoard={onRequestPreviousBoard}
          onRequestToRootBoard={onRequestToRootBoard}
          onTileClick={handleTileClick}
          onTileFocus={handleTileFocus}
          onLayoutChange={onLayoutChange}
          onTileDrop={onTileDrop}
          onAddRemoveRow={onAddRemoveRow}
          onAddRemoveColumn={onAddRemoveColumn}
          setIsScroll={setIsScroll}
          onBoardKeyUp={handleBoardKeyUp}
          onLockNotify={onLockNotify}
          onLockClick={onLockClick}
        />
        <BoardTitleDialog
          open={openTitleDialog}
          titleDialogValue={titleDialogValue}
          intl={intl}
          onClose={handleBoardTitleClose}
          onChange={handleBoardTitleChange}
          onSubmit={handleBoardTitleSubmit}
        />
      </div>
    </>
  );
};

export default BoardView;
