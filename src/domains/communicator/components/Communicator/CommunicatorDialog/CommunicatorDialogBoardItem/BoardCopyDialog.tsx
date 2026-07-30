import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';

interface BoardCopyDialogProps {
  open: boolean;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  onClose: () => void;
  onCopy: () => void;
}

const BoardCopyDialog: React.FC<BoardCopyDialogProps> = ({
  open,
  intl,
  messages,
  onClose,
  onCopy,
}) => {
  return (
    <Dialog onClose={onClose} aria-labelledby="board-copy-dialog" open={open}>
      <DialogTitle id="board-copy-title">
        {intl ? intl.formatMessage(messages.copyBoard) : 'Copy Board'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {intl
            ? intl.formatMessage(messages.copyBoardDescription)
            : 'Copy this board to your account'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl ? intl.formatMessage(messages.close) : 'Close'}
        </Button>
        <PremiumFeature>
          <Button onClick={onCopy} variant="contained" color="primary">
            {intl ? intl.formatMessage(messages.accept) : 'Accept'}
          </Button>
        </PremiumFeature>
      </DialogActions>
    </Dialog>
  );
};

export default BoardCopyDialog;
