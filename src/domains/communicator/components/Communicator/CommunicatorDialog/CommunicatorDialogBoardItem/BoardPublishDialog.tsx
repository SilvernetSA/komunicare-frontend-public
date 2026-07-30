import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import React from 'react';

import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';

const Transition = React.forwardRef<unknown, { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

interface BoardPublishDialogProps {
  open: boolean;
  descriptionValue: string;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  onClose: () => void;
  onDescriptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
}

const BoardPublishDialog: React.FC<BoardPublishDialogProps> = ({
  open,
  descriptionValue,
  intl,
  messages,
  onClose,
  onDescriptionChange,
  onPublish,
}) => {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="board-publish-dialog"
      open={open}
      slots={{ transition: Transition }}
      aria-describedby="board-publish-desc"
    >
      <DialogTitle id="board-publish-title">
        {intl ? intl.formatMessage(messages.publishBoard) : 'Publish Board'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-publish-board-desc">
          {intl
            ? intl.formatMessage(messages.publishBoardDescription)
            : 'Publish board description'}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="description"
          label={
            intl ? intl.formatMessage(messages.publishBoard) : 'Publish Board'
          }
          type="text"
          fullWidth
          value={descriptionValue}
          onChange={onDescriptionChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl ? intl.formatMessage(messages.close) : 'Close'}
        </Button>
        <PremiumFeature>
          <Button onClick={onPublish} variant="contained" color="primary">
            {intl ? intl.formatMessage(messages.accept) : 'Accept'}
          </Button>
        </PremiumFeature>
      </DialogActions>
    </Dialog>
  );
};

export default BoardPublishDialog;
