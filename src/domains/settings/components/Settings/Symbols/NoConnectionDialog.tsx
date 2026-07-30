import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { useIntl } from 'react-intl';

import messages from './Symbols.messages';

// 1. Definimos las props con una interfaz de TypeScript
interface NoConnectionDialogProps {
  open: boolean;
  onClose: () => void;
}

const NoConnectionDialog: React.FC<NoConnectionDialogProps> = ({
  open,
  onClose,
}) => {
  const intl = useIntl();

  return (
    <Dialog onClose={onClose} aria-labelledby="no-connection" open={open}>
      <DialogTitle id="no-connection-dialog-title">
        {intl.formatMessage(messages.noConnection)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="no-connection-dialog-description">
          {intl.formatMessage(messages.noConnectionDialogDesc)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl.formatMessage(messages.cancel)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoConnectionDialog;
