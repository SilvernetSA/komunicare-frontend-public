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
  continueOnline?: boolean;
  [key: string]: unknown;
}

interface DownloadDialogProps {
  open: boolean;
  onClose: () => void;
  onDialogAcepted: (data: DownloadingLangData) => void;
  downloadingLangData: DownloadingLangData;
}

const DownloadDialog: React.FC<DownloadDialogProps> = ({
  open,
  onClose,
  onDialogAcepted,
  downloadingLangData,
}) => {
  const intl = useIntl();
  const { continueOnline } = downloadingLangData;

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="redirect-to-playstore"
      open={open}
    >
      <DialogTitle id="playstore-dialog-title">
        {intl.formatMessage(messages.downloadDialogTitle)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="playstore-dialog-description">
          {intl.formatMessage(messages.downloadDialogSubtitle)}
        </DialogContentText>
        {continueOnline && (
          <DialogContentText id="continue-online-description">
            {intl.formatMessage(messages.continueOnlineLangAlert)}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl.formatMessage(messages.cancel)}
        </Button>
        <Button
          onClick={() => onDialogAcepted(downloadingLangData)}
          variant="contained"
          color="primary"
          autoFocus
        >
          {intl.formatMessage(messages.download)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadDialog;
