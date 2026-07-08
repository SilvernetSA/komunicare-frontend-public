import ClearIcon from '@mui/icons-material/Clear';
import HomeIcon from '@mui/icons-material/Home';
import React from 'react';

import { UserData } from '../../../../types/app';
import { Board } from '../../../../types/board';
import { Communicator } from '../../../../types/communicator';
import IconButton from '../../../UI/IconButton/IconButton';

interface CommunicatorBoardsActionsProps {
  communicator: Communicator;
  board: Board;
  userData: UserData;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: {
    removeBoard: { id: string; defaultMessage: string };
    menuRootBoardOption: { id: string; defaultMessage: string };
  };
  addOrRemoveBoard: (board: Board) => void;
  setRootBoard: (board: Board) => void;
}

const CommunicatorBoardsActions: React.FC<CommunicatorBoardsActionsProps> = ({
  communicator,
  board,
  userData,
  intl,
  messages,
  addOrRemoveBoard,
  setRootBoard,
}) => {
  return (
    <div>
      <IconButton
        disabled={communicator.rootBoard === board.id || !userData.authToken}
        label={intl ? intl.formatMessage(messages.removeBoard) : 'Remove Board'}
        onClick={() => addOrRemoveBoard(board)}
        size="large"
      >
        <ClearIcon />
      </IconButton>
      <IconButton
        disabled={communicator.rootBoard === board.id}
        onClick={() => setRootBoard(board)}
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
};

export default CommunicatorBoardsActions;
