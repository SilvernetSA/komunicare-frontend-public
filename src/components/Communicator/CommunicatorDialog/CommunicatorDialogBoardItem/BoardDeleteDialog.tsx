import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

interface BoardDeleteDialogProps {
  open: boolean;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  onClose: () => void;
  onDelete: () => void;
}

const BoardDeleteDialog: React.FC<BoardDeleteDialogProps> = ({
  open,
  intl,
  messages,
  onClose,
  onDelete,
}) => {
  return (
    <Dialog onClose={onClose} aria-labelledby="board-delete-dialog" open={open}>
      <DialogTitle id="board-delete-title">
        {intl ? intl.formatMessage(messages.deleteBoard) : 'Delete Board'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {intl
            ? intl.formatMessage(messages.deleteBoardDescription)
            : 'Are you sure you want to delete this board?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl ? intl.formatMessage(messages.close) : 'Close'}
        </Button>
        <Button onClick={onDelete} variant="contained" color="primary">
          {intl ? intl.formatMessage(messages.accept) : 'Accept'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BoardDeleteDialog;
