import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import React from 'react';

import { Board } from '../../../../types/board';

interface BoardInfoDialogProps {
  open: boolean;
  board: Board;
  boardUrl: string;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  onClose: () => void;
}

const BoardInfoDialog: React.FC<BoardInfoDialogProps> = ({
  open,
  board,
  boardUrl,
  intl,
  messages,
  onClose,
}) => {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="board-info-title"
      open={open}
      className="CommunicatorDialog__boardInfoDialog"
    >
      <DialogTitle id="board-info-title">{board.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography variant="body1" gutterBottom>
            <b>{intl ? intl.formatMessage(messages.boardInfoName) : 'Name'}:</b>{' '}
            {board.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>
              {intl ? intl.formatMessage(messages.boardInfoAuthor) : 'Author'}:
            </b>{' '}
            {board.author}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>
              {intl
                ? intl.formatMessage(messages.boardDescription)
                : 'Description'}
              :
            </b>{' '}
            {board.description}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>{intl ? intl.formatMessage(messages.boardInfoDate) : 'Date'}:</b>{' '}
            {moment(board.lastEdited).format('DD/MM/YYYY')}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>
              {intl ? intl.formatMessage(messages.boardInfoTiles) : 'Tiles'}:
            </b>{' '}
            {board.tiles.length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>{intl ? intl.formatMessage(messages.boardInfoId) : 'ID'}:</b>{' '}
            {board.id}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>{intl ? intl.formatMessage(messages.boardInfoUrl) : 'URL'}:</b>{' '}
            <a href={boardUrl} target="_blank" rel="noopener noreferrer">
              {boardUrl}
            </a>
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl ? intl.formatMessage(messages.close) : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BoardInfoDialog;
