import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../../BoardShare.messages';

interface ShareDialogTitleProps {
  intl: {
    formatMessage: (
      message: { id: string; defaultMessage: string },
      values?: Record<string, unknown>,
    ) => string;
  };
  onShareClose: () => void;
}

export const ShareDialogTitle: React.FC<ShareDialogTitleProps> = ({
  intl,
  onShareClose,
}) => (
  <DialogTitle className="ShareDialog__title">
    <FormattedMessage {...messages.title} />
    <Tooltip placement="bottom" title={intl.formatMessage(messages.close)}>
      <IconButton
        aria-label={intl.formatMessage(messages.close)}
        color="inherit"
        onClick={onShareClose}
        size="large"
      >
        <CloseIcon />
      </IconButton>
    </Tooltip>
  </DialogTitle>
);
