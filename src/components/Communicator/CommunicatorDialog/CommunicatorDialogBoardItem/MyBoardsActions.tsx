import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import KeyIcon from '@mui/icons-material/VpnKey';
import React from 'react';

import BoardDeleteDialog from './BoardDeleteDialog';
import BoardPublishDialog from './BoardPublishDialog';
import { useCommunicatorsStore } from '../../../../store/communicatorsStore';
import { Board } from '../../../../types/board';
import { Communicator } from '../../../../types/communicator';
import PremiumFeature from '../../../PremiumFeature/PremiumFeature';
import IconButton from '../../../UI/IconButton/IconButton';

interface MyBoardsActionsProps {
  communicator: Communicator;
  board: Board;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  openPublishBoard: boolean;
  openDeleteBoard: boolean;
  editBoardDescriptionDialogValue: string;
  addOrRemoveBoard: (board: Board) => void;
  setRootBoard: (board: Board) => void;
  onBoardPublishOpen: (board: Board) => void;
  onBoardDeleteOpen: (board: Board) => void;
  onDialogClose: () => void;
  onBoardDescriptionChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onBoardPublish: () => void;
  onBoardDelete: () => void;
}

const MyBoardsActions: React.FC<MyBoardsActionsProps> = ({
  communicator,
  board,
  intl,
  messages,
  openPublishBoard,
  openDeleteBoard,
  editBoardDescriptionDialogValue,
  addOrRemoveBoard: _addOrRemoveBoard,
  setRootBoard,
  onBoardPublishOpen,
  onBoardDeleteOpen,
  onDialogClose,
  onBoardDescriptionChange,
  onBoardPublish,
  onBoardDelete,
}) => {
  const isOfficialRootBoard = ['root', 'jjmlUcQs19', 'komunicare'].includes(
    board.id,
  );

  const allCommunicators = useCommunicatorsStore(
    (state) => state.communicators,
  );
  const isCommunicatorRootBoard = allCommunicators.some(
    (c) => c.rootBoard === board.id,
  );

  const shouldShowPublishButton =
    !isOfficialRootBoard && !isCommunicatorRootBoard;
  const shouldShowDeleteButton = Boolean(board?.id);

  const PublishBoardButton = shouldShowPublishButton ? (
    <IconButton
      label={
        board.isPublic
          ? intl
            ? intl.formatMessage(messages.menuUnpublishOption)
            : 'Unpublish'
          : intl
            ? intl.formatMessage(messages.menuPublishOption)
            : 'Publish'
      }
      onClick={() => onBoardPublishOpen(board)}
      size="large"
    >
      {board.isPublic ? <KeyIcon /> : <PublicIcon />}
    </IconButton>
  ) : null;

  return (
    <div>
      <IconButton
        disabled={communicator.rootBoard === board.id}
        label={
          intl
            ? intl.formatMessage(messages.menuRootBoardOption)
            : 'Set as Root Board'
        }
        onClick={() => setRootBoard(board)}
        size="large"
      >
        <HomeIcon />
      </IconButton>

      {board.description || board.isPublic ? (
        <PremiumFeature>{PublishBoardButton}</PremiumFeature>
      ) : (
        PublishBoardButton
      )}

      {shouldShowDeleteButton && (
        <IconButton
          label={
            intl ? intl.formatMessage(messages.deleteBoard) : 'Delete Board'
          }
          onClick={() => onBoardDeleteOpen(board)}
          size="large"
        >
          <DeleteIcon />
        </IconButton>
      )}

      <BoardPublishDialog
        open={openPublishBoard}
        descriptionValue={editBoardDescriptionDialogValue}
        intl={intl}
        messages={messages}
        onClose={onDialogClose}
        onDescriptionChange={onBoardDescriptionChange}
        onPublish={onBoardPublish}
      />

      <BoardDeleteDialog
        open={openDeleteBoard}
        intl={intl}
        messages={messages}
        onClose={onDialogClose}
        onDelete={onBoardDelete}
      />
    </div>
  );
};

export default MyBoardsActions;
