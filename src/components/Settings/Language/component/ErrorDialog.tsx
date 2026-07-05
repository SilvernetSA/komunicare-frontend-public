import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import messages from '../Language.messages';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onClose,
  intl,
}) => (
  <Dialog
    onClose={onClose}
    aria-labelledby="tts-error-dialog"
    open={open}
    className="CommunicatorDialog__boardInfoDialog"
  >
    <DialogTitle id="tts-error-dialog-title">
      <WarningIcon />
      {intl ? intl.formatMessage(messages.ttsEngines) : 'TTS Engines'}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        {intl
          ? intl.formatMessage(messages.ttsEngineError)
          : 'TTS Engine Error'}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        {intl ? intl.formatMessage(messages.close) : 'Close'}
      </Button>
    </DialogActions>
  </Dialog>
);
