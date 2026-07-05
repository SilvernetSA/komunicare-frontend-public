import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef<unknown, { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

interface BoardEditTitleDialogProps {
  open: boolean;
  titleValue: string;
  descriptionValue: string;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  onClose: () => void;
  onTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAccept: () => void;
}

const BoardEditTitleDialog: React.FC<BoardEditTitleDialogProps> = ({
  open,
  titleValue,
  descriptionValue,
  intl,
  messages,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onAccept,
}) => {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="board-edit-title-dialog"
      open={open}
      TransitionComponent={Transition}
      aria-describedby="board-edit-title-desc"
    >
      <DialogTitle id="board-edit-title-title">
        {intl
          ? intl.formatMessage(messages.editBoardTitle)
          : 'Edit Board Title'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-board-edit-title-desc">
          {intl
            ? intl.formatMessage(messages.editBoardTitleDescription)
            : 'Edit the title and description of this board'}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="title"
          label={intl ? intl.formatMessage(messages.boardInfoName) : 'Name'}
          type="text"
          fullWidth
          value={titleValue}
          onChange={onTitleChange}
        />
        <TextField
          autoFocus
          margin="dense"
          id="description"
          label={
            intl ? intl.formatMessage(messages.publishBoard) : 'Publish Board'
          }
          type="text"
          multiline
          maxRows={6}
          fullWidth
          value={descriptionValue}
          onChange={onDescriptionChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl ? intl.formatMessage(messages.close) : 'Close'}
        </Button>
        <Button onClick={onAccept} variant="contained" color="primary">
          {intl ? intl.formatMessage(messages.accept) : 'Accept'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BoardEditTitleDialog;
