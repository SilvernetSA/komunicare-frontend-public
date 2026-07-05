import FlagIcon from '@mui/icons-material/Flag';
import InfoIcon from '@mui/icons-material/Info';
import QueueIcon from '@mui/icons-material/Queue';
import React from 'react';

import BoardInfoDialog from './BoardInfoDialog';
import ReportBoardDialog from './ReportBoardDialog';
import { UserData } from '../../../../types/app';
import { Board } from '../../../../types/board';
import { Communicator } from '../../../../types/communicator';
import IconButton from '../../../UI/IconButton/IconButton';

interface PublicBoardsActionsProps {
  communicator: Communicator;
  board: Board;
  userData: UserData;
  intl?: { formatMessage: (message: unknown) => string };
  messages: Record<string, unknown>;
  boardUrl: string;
  reportDialogState: unknown;
  openBoardInfo: boolean;
  onBoardInfoOpen: () => void;
  onBoardReportOpen: () => void;
  onDialogClose: () => void;
  onReportReasonChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBoardReport: () => void;
  onBoardCopy: () => void | Promise<void>;
}

const PublicBoardsActions: React.FC<PublicBoardsActionsProps> = ({
  communicator,
  board,
  userData,
  intl,
  messages,
  boardUrl,
  reportDialogState,
  openBoardInfo,
  onBoardInfoOpen,
  onBoardReportOpen,
  onDialogClose,
  onReportReasonChange,
  onBoardReport,
  onBoardCopy,
}) => {
  return (
    <div>
      <IconButton
        disabled={
          communicator.boards.includes(board.id) ||
          (userData && userData.email === board.email)
        }
        onClick={onBoardCopy}
        label={intl ? intl.formatMessage(messages.copyBoard) : 'Copy Board'}
        size="large"
      >
        <QueueIcon />
      </IconButton>
      <IconButton
        label={intl ? intl.formatMessage(messages.boardInfo) : 'Board Info'}
        onClick={onBoardInfoOpen}
        size="large"
      >
        <InfoIcon />
      </IconButton>
      <IconButton
        label={intl ? intl.formatMessage(messages.boardReport) : 'Report Board'}
        onClick={onBoardReportOpen}
        size="large"
      >
        <FlagIcon />
      </IconButton>

      <ReportBoardDialog
        reportDialogState={reportDialogState as any}
        board={board}
        intl={intl}
        messages={messages as any}
        onClose={onDialogClose}
        onReportReasonChange={onReportReasonChange}
        onSubmitReport={onBoardReport}
        boardUrl={boardUrl}
      />

      <BoardInfoDialog
        open={openBoardInfo}
        board={board}
        boardUrl={boardUrl}
        intl={intl}
        messages={messages as any}
        onClose={onDialogClose}
      />
    </div>
  );
};

export default PublicBoardsActions;
