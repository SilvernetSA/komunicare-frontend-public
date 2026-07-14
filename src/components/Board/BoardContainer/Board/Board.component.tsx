import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import classNames from 'classnames';
import keycode from 'keycode';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IntlShape } from 'react-intl';

import messages from '../../Board.messages';
import BoardContent from './BoardContent/BoardContent.component';
import BoardHeader from './BoardHeader/BoardHeader.component';
import BoardTour from './BoardTour/BoardTour';
import EditToolbar from './EditToolbar/EditToolbar.component';
import Navbar from './Navbar/Navbar';
import NavigationButtons from './NavigationButtons/NavigationButtons';
import ScrollButtons from './ScrollButtons/ScrollButtons';
import {
  DisplaySettings,
  NavigationSettings,
  UserData,
} from '../../../../types/app';
import { Board as BoardType, Tile } from '../../../../types/board';
import { DefaultBoardSelection } from '../../../../utils/changeDefaultBoard';
import { getBoardDisplayTitle } from '../../../../utils/getBoardDisplayTitle';
import CommunicatorToolbar from '../../../Communicator/CommunicatorToolbar/CommunicatorToolbar';
import { NAVIGATION_BUTTONS_STYLE_SIDES } from '../../../Settings/Navigation/Navigation.constants';
import { setCommunicatorCopyDialogHandler } from '../../utils-simple/copyOnWrite';
import './Board.css';

interface BoardProps {
  board: BoardType;
  className?: string;
  disableBackButton?: boolean;
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
  showNotification?: (message: string) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  intl,
  userData,
  disableBackButton,
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
  const hasBackHistory = (navHistory?.length || 0) > 1;
  const hasRootHistory = (navHistory?.length || 0) > 2;

  // Use ?? true so that undefined values (missing from old localStorage) default
  // to enabled — only an explicit false disables them.
  const caBackButtonActive = navigationSettings?.caBackButtonActive ?? true;
  const bigScrollButtonsActive =
    navigationSettings?.bigScrollButtonsActive ?? true;

  // Navigation buttons: only visible when the user has navigated into a folder.
  const shouldShowNavigationButtons = Boolean(
    caBackButtonActive &&
    hasBackHistory &&
    !isSelecting &&
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
        <div className="Board__main-toolbar">
          <Navbar
            className="Board__navbar"
            disabled={disableBackButton || isSelecting || isSaving}
            showBackButton={!disableBackButton}
            isLocked={isLocked}
            onBackClick={onRequestPreviousBoard}
            onLockClick={onLockClick}
            onLockNotify={onLockNotify}
            title={getBoardDisplayTitle(board, intl as any)}
            board={board}
            userData={userData as any}
            showNotification={(showNotification || (() => {})) as any}
            publishBoard={publishBoard}
          />
          <CommunicatorToolbar
            className="Board__communicator-toolbar"
            isSelecting={isSelecting || isSaving}
          />
          <EditToolbar
            board={board}
            onBoardTitleClick={handleBoardTitleClick}
            className="Board__edit-toolbar"
            isSelectAll={isSelectAll}
            isSelecting={isSelecting}
            isSaving={isSaving}
            isLoggedIn={isLoggedIn}
            onAddClick={onAddClick}
            isFixedBoard={isFixedBoard}
            onDeleteClick={onDeleteClick}
            onEditClick={onEditClick}
            onSaveBoardClick={onSaveBoardClick}
            onSelectAllToggle={onSelectAllToggle}
            onSelectClick={onSelectClick}
            selectedItemsCount={selectedTileIds?.length || 0}
            onBoardTypeChange={onBoardTypeChange}
            onCopyTiles={onCopyTiles}
            onPasteTiles={onPasteTiles}
            copiedTiles={copiedTiles}
          />
        </div>
        <BoardHeader
          intl={intl}
          displaySettings={displaySettings}
          emptyVoiceAlert={emptyVoiceAlert}
          offlineVoiceAlert={offlineVoiceAlert}
        />
        <div className="BoardSideButtonsContainer">
          {caBackButtonActive && (
            <NavigationButtons
              active={shouldShowNavigationButtons}
              navHistory={navHistory}
              previousBoard={onRequestPreviousBoard}
              toRootBoard={onRequestToRootBoard}
              isSaving={isSaving}
              isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
              hasBackHistory={hasBackHistory}
              hasRootHistory={hasRootHistory}
            />
          )}

          <BoardContent
            board={board}
            intl={intl}
            isSelecting={isSelecting}
            isSaving={isSaving}
            isFixedBoard={isFixedBoard}
            selectedTileIds={selectedTileIds}
            displaySettings={displaySettings}
            navigationSettings={navigationSettings}
            onTileClick={handleTileClick}
            onTileFocus={handleTileFocus}
            onLayoutChange={onLayoutChange}
            onTileDrop={onTileDrop as any}
            onAddRemoveRow={onAddRemoveRow}
            onAddRemoveColumn={onAddRemoveColumn}
            setIsScroll={setIsScroll}
            boardContainerRef={boardContainerRef}
            fixedBoardContainerRef={fixedBoardContainerRef}
            onBoardKeyUp={handleBoardKeyUp}
            canAccessToContent={canAccessToContent}
          />

          <ScrollButtons
            active={shouldShowScrollButtons}
            isScroll={isScroll}
            isSaving={isSaving}
            boardContainer={
              board.isFixed ? fixedBoardContainerRef : boardContainerRef
            }
            totalRows={totalRows || 6}
            boardId={board.id || ''}
            isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
          />
        </div>
        <Dialog
          open={openTitleDialog}
          aria-labelledby="board-dialog-title"
          onClose={handleBoardTitleClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              minWidth: { xs: '90vw', sm: '420px' },
            },
          }}
        >
          <DialogTitle
            id="board-dialog-title"
            sx={{ fontWeight: 600, color: '#424242', pb: 0.5 }}
          >
            {intl.formatMessage(messages.editTitle)}
          </DialogTitle>
          <DialogContent sx={{ pt: '12px !important' }}>
            <TextField
              autoFocus
              margin="dense"
              id="board title"
              label={intl.formatMessage(messages.boardTitle)}
              type="text"
              fullWidth
              value={titleDialogValue}
              onChange={handleBoardTitleChange}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                  { borderColor: '#7b1fa2' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#7b1fa2' },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={handleBoardTitleClose}
              sx={{ color: '#666', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              {intl.formatMessage(messages.boardEditTitleCancel)}
            </Button>
            <Button
              onClick={handleBoardTitleSubmit}
              variant="contained"
              disabled={!titleDialogValue.trim()}
              sx={{
                bgcolor: '#7b1fa2',
                '&:hover': { bgcolor: '#6a1b9a' },
                borderRadius: '8px',
                px: 3,
                fontWeight: 600,
              }}
            >
              {intl.formatMessage(messages.boardEditTitleAccept)}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default Board;
