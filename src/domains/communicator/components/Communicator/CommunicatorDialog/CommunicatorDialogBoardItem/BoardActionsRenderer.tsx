import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import InputIcon from '@mui/icons-material/Input';
import PublicIcon from '@mui/icons-material/Public';
import QueueIcon from '@mui/icons-material/Queue';
import KeyIcon from '@mui/icons-material/VpnKey';
import React from 'react';

import { UserData } from '@/types/app';
import { Board } from '@/types/board';
import { Communicator } from '@/types/communicator';
import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';
import { TAB_INDEXES } from '../CommunicatorDialog.constants';

type MessageDescriptor = { id: string; defaultMessage: string };

interface Messages {
  removeBoard: MessageDescriptor;
  menuRootBoardOption: MessageDescriptor;
  copyBoard: MessageDescriptor;
  boardInfo: MessageDescriptor;
  boardReport: MessageDescriptor;
  menuUnpublishOption: MessageDescriptor;
  menuPublishOption: MessageDescriptor;
  addBoard: MessageDescriptor;
  deleteBoard: MessageDescriptor;
}

interface CommunicatorBoardsActionsProps {
  communicator: Communicator;
  board: Board;
  userData: UserData;
  intl?: { formatMessage: (message: MessageDescriptor) => string };
  messages: Messages;
  onRemoveBoard: (board: Board) => void;
  onSetRootBoard: (board: Board) => void;
}

interface PublicBoardsActionsProps {
  communicator: Communicator;
  board: Board;
  userData: UserData;
  intl?: { formatMessage: (message: MessageDescriptor) => string };
  messages: Messages;
  onCopyBoard: () => void;
  onBoardInfo: () => void;
  onBoardReport: () => void;
}

interface MyBoardsActionsProps {
  communicator: Communicator;
  board: Board;
  intl?: { formatMessage: (message: MessageDescriptor) => string };
  messages: Messages;
  onAddRemoveBoard: (board: Board) => void;
  onPublishBoard: (board: Board) => void;
  onDeleteBoard: (board: Board) => void;
}

interface RenderBoardActionsProps {
  selectedTab: number;
  displayActions: boolean;
  [key: string]: unknown;
}

export const renderCommunicatorBoardsActions = ({
  communicator,
  board,
  userData,
  intl,
  messages,
  onRemoveBoard,
  onSetRootBoard,
}: CommunicatorBoardsActionsProps): JSX.Element => (
  <div>
    <IconButton
      disabled={communicator.rootBoard === board.id || !userData.authToken}
      label={intl ? intl.formatMessage(messages.removeBoard) : 'Remove Board'}
      onClick={() => onRemoveBoard(board)}
      size="large"
    >
      <ClearIcon />
    </IconButton>
    <IconButton
      disabled={communicator.rootBoard === board.id}
      onClick={() => onSetRootBoard(board)}
      label={
        intl
          ? intl.formatMessage(messages.menuRootBoardOption)
          : 'Set as Root Board'
      }
      size="large"
    >
      <HomeIcon />
    </IconButton>
  </div>
);

export const renderPublicBoardsActions = ({
  communicator,
  board,
  userData,
  intl,
  messages,
  onCopyBoard,
  onBoardInfo,
  onBoardReport,
}: PublicBoardsActionsProps): JSX.Element => (
  <div>
    <IconButton
      disabled={
        communicator.boards.includes(board.id) ||
        (userData && userData.email === board.email)
      }
      onClick={onCopyBoard}
      label={intl ? intl.formatMessage(messages.copyBoard) : 'Copy Board'}
      size="large"
    >
      <QueueIcon />
    </IconButton>
    <IconButton
      label={intl ? intl.formatMessage(messages.boardInfo) : 'Board Info'}
      onClick={onBoardInfo}
      size="large"
    >
      <InfoIcon />
    </IconButton>
    <IconButton
      label={intl ? intl.formatMessage(messages.boardReport) : 'Report Board'}
      onClick={onBoardReport}
      size="large"
    >
      <FlagIcon />
    </IconButton>
  </div>
);

export const renderMyBoardsActions = ({
  communicator,
  board,
  intl,
  messages,
  onAddRemoveBoard,
  onPublishBoard,
  onDeleteBoard,
}: MyBoardsActionsProps): JSX.Element => {
  const PublishBoardButton = (
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
      onClick={() => onPublishBoard(board)}
      size="large"
    >
      {board.isPublic ? <KeyIcon /> : <PublicIcon />}
    </IconButton>
  );

  return (
    <div>
      <IconButton
        disabled={communicator.rootBoard === board.id}
        label={
          communicator.boards.includes(board.id)
            ? intl
              ? intl.formatMessage(messages.removeBoard)
              : 'Remove Board'
            : intl
              ? intl.formatMessage(messages.addBoard)
              : 'Add Board'
        }
        onClick={() => onAddRemoveBoard(board)}
        size="large"
      >
        {communicator.boards.includes(board.id) ? <ClearIcon /> : <InputIcon />}
      </IconButton>
      {board.description || board.isPublic ? (
        <PremiumFeature>{PublishBoardButton}</PremiumFeature>
      ) : (
        PublishBoardButton
      )}
      <IconButton
        label={intl ? intl.formatMessage(messages.deleteBoard) : 'Delete Board'}
        onClick={() => onDeleteBoard(board)}
        size="large"
      >
        <DeleteIcon />
      </IconButton>
    </div>
  );
};

export const renderBoardActions = ({
  selectedTab,
  displayActions,
  ...props
}: RenderBoardActionsProps): JSX.Element | null => {
  if (!displayActions) return null;

  switch (selectedTab) {
    case TAB_INDEXES.COMMUNICATOR_BOARDS:
      return renderCommunicatorBoardsActions(props as any);
    case TAB_INDEXES.MY_BOARDS:
      return renderMyBoardsActions(props as any);
    default:
      return null;
  }
};
