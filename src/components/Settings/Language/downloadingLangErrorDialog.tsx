import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { useIntl } from 'react-intl';

import messages from './Language.messages';

interface DownloadingLangData {
  [key: string]: unknown;
}

interface DownloadingLangError {
  ttsError?: boolean;
  [key: string]: unknown;
}

interface DownloadingLangState {
  firstClick?: boolean;
  continueOnline?: boolean;
  [key: string]: unknown;
}

interface DownloadingLangErrorDialogProps {
  open: boolean;
  onClose: () => void;
  onDialogAcepted: (data: DownloadingLangData) => void;
  downloadingLangData: DownloadingLangData;
  downloadingLangError: DownloadingLangError;
  downloadingLangState?: DownloadingLangState;
}

const DownloadingLangErrorDialog: React.FC<DownloadingLangErrorDialogProps> = ({
  open,
  onClose,
  onDialogAcepted,
  downloadingLangData,
  downloadingLangError,
  downloadingLangState = {},
}) => {
  const intl = useIntl();
  const { ttsError } = downloadingLangError;
  const { firstClick, continueOnline } = downloadingLangState;

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'backdropClick') {
      return false;
    }
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="alert-dialog-title">
        {intl.formatMessage(messages.downloadDialogTitle)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {ttsError
            ? intl.formatMessage(messages.ttsErrorAlert)
            : firstClick
              ? intl.formatMessage(messages.searchVoiceAlert)
              : intl.formatMessage(messages.langErrorAlert)}
        </DialogContentText>
        {continueOnline && (
          <DialogContentText id="continue-online-description">
            {intl.formatMessage(messages.continueOnlineLangAlert)}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl.formatMessage(messages.CancelInstalation)}
        </Button>
        <Button
          onClick={() => onDialogAcepted(downloadingLangData)}
          variant="contained"
          color="primary"
          autoFocus
        >
          {ttsError
            ? intl.formatMessage(messages.checkIt)
            : intl.formatMessage(messages.openApp)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadingLangErrorDialog;
