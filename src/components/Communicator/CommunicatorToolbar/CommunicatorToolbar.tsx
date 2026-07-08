import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LayersIcon from '@mui/icons-material/Layers';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import messages from './CommunicatorToolbar.messages';
import './CommunicatorToolbar.css';
import DefaultBoardSelector from './DefaultBoardSelector/DefaultBoardSelector';
import { useAppStore } from '../../../store/appStore';
import { useBoardsStore } from '../../../store/boardsStore';
import { useCommunicatorsStore } from '../../../store/communicatorsStore';
import { Board } from '../../../types/board';
import { Communicator as CommunicatorModel } from '../../../types/communicator';
import {
  changeDefaultBoard,
  type DefaultBoardSelection,
} from '../../../utils/changeDefaultBoard';
import { getBoardDisplayTitle } from '../../../utils/getBoardDisplayTitle';
import { switchCommunicatorNavigation } from '../../../utils/switchCommunicatorNavigation';
import boardMessages from '../../Board/Board.messages';
import FormDialog from '../../UI/FormDialog/FormDialog';
import CommunicatorDialog from '../CommunicatorDialog/CommunicatorDialog';
import CreateCommunicatorModal from '../CommunicatorDialog/CreateCommunicatorModal';

// ─── helpers ──────────────────────────────────────────────────────────────────

const findLatestCommunicatorByBoard = (
  communicators: CommunicatorModel[],
  boardId?: string,
): CommunicatorModel | undefined => {
  if (!boardId) return undefined;

  for (let i = communicators.length - 1; i >= 0; i -= 1) {
    if (communicators[i].rootBoard === boardId) return communicators[i];
  }
  for (let i = communicators.length - 1; i >= 0; i -= 1) {
    if (communicators[i].boards?.includes(boardId)) return communicators[i];
  }
  return undefined;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface CommunicatorToolbarProps {
  className?: string;
  isSelecting?: boolean;
}

const CommunicatorToolbar: React.FC<CommunicatorToolbarProps> = ({
  className = '',
  isSelecting = false,
}) => {
  // ── dialogs ─────────────────────────────────────────────────────────────────
  const [openDialog, setOpenDialog] = useState(false);
  const [boardsMenu, setBoardsMenu] = useState<HTMLElement | null>(null);
  const [openTitleDialog, setOpenTitleDialog] = useState(false);
  const [openCreateCommunicator, setOpenCreateCommunicator] = useState(false);

  // ── routing / i18n ───────────────────────────────────────────────────────────
  const navigate = useNavigate();
  const intl = useIntl();

  // ── store subscriptions ──────────────────────────────────────────────────────
  const boards = useBoardsStore((state) => state.boards);
  const activeBoardId = useBoardsStore((state) => state.activeBoardId);
  const communicators = useCommunicatorsStore(
    (state) => state.communicators,
  ) as CommunicatorModel[];
  const activeCommunicatorId = useCommunicatorsStore(
    (state) => state.activeCommunicatorId,
  );
  const displaySettings = useAppStore((state) => state.displaySettings);
  const userEmail = useAppStore((state) => state.userData?.email);

  // ── derived ──────────────────────────────────────────────────────────────────
  const emptyCommunicator: CommunicatorModel = {
    id: '',
    name: '',
    author: '',
    email: '',
    rootBoard: '',
    boards: [],
  };

  const currentCommunicator =
    findLatestCommunicatorByBoard(communicators, activeBoardId) ||
    communicators.find((c) => c.id === activeCommunicatorId) ||
    emptyCommunicator;

  // Keep activeCommunicatorId in sync with the active board.
  useEffect(() => {
    if (
      currentCommunicator.id &&
      currentCommunicator.id !== activeCommunicatorId
    ) {
      useCommunicatorsStore
        .getState()
        .changeCommunicator(currentCommunicator.id);
    }
  }, [activeCommunicatorId, currentCommunicator.id]);

  const lowerUserEmail = userEmail?.toLowerCase() ?? '';
  const userBoards = lowerUserEmail
    ? boards.filter((b) => (b.email ?? '').toLowerCase() === lowerUserEmail)
    : [];

  // Ensure user boards are in the store so the dropdown is populated.
  useEffect(() => {
    if (userEmail) {
      useBoardsStore.getState().fetchUserBoards();
    }
  }, [userEmail]);

  // ── title dialog state (depends on currentCommunicator) ───────────────────
  const [titleDialogValue, setTitleDialogValue] = useState(
    currentCommunicator.name || currentCommunicator.id || '',
  );

  // ── handlers ─────────────────────────────────────────────────────────────────
  const switchBoardHandler = (board: Board) => {
    setBoardsMenu(null);
    useBoardsStore.getState().switchBoard(board.id);
    navigate(`/board/${board.id}`, { replace: true });
  };

  const editCommunicatorTitle = async (name: string) => {
    if (!currentCommunicator.id) return;
    const updated = { ...currentCommunicator, name } as CommunicatorModel;
    try {
      const saved = await useCommunicatorsStore
        .getState()
        .updateRemoteCommunicator(updated);
      useCommunicatorsStore.getState().upsertCommunicator(saved);
      switchCommunicatorNavigation({
        communicator: saved,
        navigate,
        skipBoardNavigation: true,
      });
    } catch (error) {
      console.error('Failed to update communicator name', error);
    }
  };

  const handleCommunicatorTitleSubmit = async () => {
    if (titleDialogValue.length) {
      try {
        await editCommunicatorTitle(titleDialogValue);
      } catch {}
    }
    handleCommunicatorTitleClose();
  };

  const handleCommunicatorTitleClose = () => {
    setOpenTitleDialog(false);
    setTitleDialogValue(
      currentCommunicator.name || currentCommunicator.id || '',
    );
  };

  const handleChangeDefaultBoard = (
    selection: string | DefaultBoardSelection,
  ) =>
    changeDefaultBoard(
      selection,
      navigate,
      intl.formatMessage(boardMessages.originalCommunicatorCopyNamePrompt),
    );

  const isDark = displaySettings.darkThemeActive;

  return (
    <React.Fragment>
      <div className={classNames('CommunicatorToolbar', className)}>
        {/* Boards dropdown */}
        <Button
          className="Communicator__title"
          id="boards-button"
          disabled={isSelecting || !userEmail}
          onClick={(event) => setBoardsMenu(event.currentTarget)}
        >
          <ArrowDropDownIcon />
          <FormattedMessage {...messages.boards} />
        </Button>
        <Menu
          id="boards-menu"
          className="CommunicatorToolbar__menu"
          anchorEl={boardsMenu}
          open={Boolean(boardsMenu)}
          onClose={() => setBoardsMenu(null)}
        >
          {userBoards.map((board) => (
            <ListItem
              className="CommunicatorToolbar__menuitem"
              key={board.id}
              onClick={() => switchBoardHandler(board)}
            >
              <ListItemAvatar>
                {board.caption ? (
                  <Avatar src={board.caption} />
                ) : (
                  <Avatar>
                    <ViewModuleIcon />
                  </Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                inset
                primary={getBoardDisplayTitle(board, intl)}
                secondary={intl.formatMessage(messages.tiles, {
                  qty: board.tiles?.length || 0,
                })}
              />
            </ListItem>
          ))}
        </Menu>

        {/* Edit communicator title dialog */}
        <FormDialog
          open={openTitleDialog}
          title={<FormattedMessage {...messages.editTitle} />}
          onSubmit={handleCommunicatorTitleSubmit}
          onClose={handleCommunicatorTitleClose}
        >
          <TextField
            autoFocus
            margin="dense"
            label={<FormattedMessage {...messages.communicatorTitle} />}
            value={titleDialogValue}
            type="text"
            onChange={(event) => setTitleDialogValue(event.target.value)}
            fullWidth
            required
          />
        </FormDialog>

        {/* Open communicator selector */}
        <div className="CommunicatorToolbar__group CommunicatorToolbar__group--start">
          <Button
            className="edit__communicator"
            disabled={isSelecting}
            onClick={() => setOpenDialog(true)}
          >
            <LayersIcon className="CommunicatorToolbar__group CommunicatorToolbar__group--start--button" />
            {intl.formatMessage(messages.editCommunicator)}
          </Button>
          <Button
            className="edit__communicator"
            disabled={isSelecting || !userEmail}
            onClick={() => setOpenCreateCommunicator(true)}
            aria-label={intl.formatMessage(messages.createCommunicator)}
          >
            <LibraryAddIcon className="CommunicatorToolbar__group CommunicatorToolbar__group--start--button" />
          </Button>
        </div>

        {/* Default board picker */}
        <div className="CommunicatorToolbar__group CommunicatorToolbar__group--end">
          <DefaultBoardSelector
            isDarkMode={isDark}
            changeDefaultBoard={handleChangeDefaultBoard}
          />
        </div>
      </div>

      {/* Full communicator dialog (lazy-mounted) */}
      {openDialog && (
        <CommunicatorDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        />
      )}

      {/* Create communicator modal */}
      <CreateCommunicatorModal
        open={openCreateCommunicator}
        onClose={() => setOpenCreateCommunicator(false)}
        onCreated={(communicatorId) => {
          setOpenCreateCommunicator(false);
          useCommunicatorsStore.getState().changeCommunicator(communicatorId);
        }}
        createRemoteCommunicator={async (payload) => {
          return useCommunicatorsStore
            .getState()
            .createRemoteCommunicator(payload);
        }}
        createRemoteBoard={async (payload) => {
          return useBoardsStore.getState().createRemoteBoard(payload);
        }}
      />
    </React.Fragment>
  );
};

export default CommunicatorToolbar;
