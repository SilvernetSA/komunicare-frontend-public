import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './FormDialog.messages';

import './FormDialog.css';

const withMobileDialog =
  () =>
  (WrappedComponent: React.ComponentType<Record<string, unknown>>) =>
  (props: Record<string, unknown>) => (
    <WrappedComponent {...props} width="lg" fullScreen={false} />
  );

interface FormDialogProps {
  disableSubmit?: boolean;
  open?: boolean;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
  classes?: string;
  className?: string;
  fullScreen?: boolean;
  children?: React.ReactNode;
}

function FormDialog({
  classes = '',
  children,
  open,
  title,
  description,
  disableSubmit,
  onClose = () => {},
  onSubmit,
  fullScreen,
}: FormDialogProps) {
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      className={`FormDialog__Container ${classes}`}
    >
      <DialogTitle className="FormDialog__Title">{title}</DialogTitle>
      <DialogContent className="FormDialog__Content">
        {!!description && <DialogContentText>{description}</DialogContentText>}
        <div className="FormDialog__Children">{children}</div>
      </DialogContent>
      <DialogActions className="FormDialog__Actions">
        <Button onClick={onClose} color="primary">
          <FormattedMessage {...messages.cancel} />
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          autoFocus
          disabled={disableSubmit}
        >
          <FormattedMessage {...messages.save} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default withMobileDialog()(FormDialog);
