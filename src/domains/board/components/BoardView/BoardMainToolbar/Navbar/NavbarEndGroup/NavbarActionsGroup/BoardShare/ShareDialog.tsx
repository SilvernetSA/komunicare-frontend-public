import Dialog from '@mui/material/Dialog';
import React from 'react';

import { ShareDialogContent } from './ShareDialog/ShareDialogContent';
import { ShareDialogTitle } from './ShareDialog/ShareDialogTitle';

interface ShareDialogProps {
  open: boolean;
  fullScreen?: boolean;
  url: string;
  isOwnBoard: boolean;
  hasMinimumTiles: boolean;
  isLogged?: boolean;
  isPublic?: boolean;
  intl: {
    formatMessage: (
      message: { id: string; defaultMessage: string },
      values?: Record<string, unknown>,
    ) => string;
  };
  onShareClose: () => void;
  publishBoard: () => void;
  onCopyLink: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  fullScreen,
  url,
  isOwnBoard,
  hasMinimumTiles,
  isLogged,
  isPublic,
  intl,
  onShareClose,
  publishBoard,
  onCopyLink,
}) => (
  <Dialog
    open={open}
    onClose={onShareClose}
    fullScreen={fullScreen}
    className="ShareDialog__container"
    PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
  >
    <ShareDialogTitle intl={intl} onShareClose={onShareClose} />
    <ShareDialogContent
      url={url}
      isOwnBoard={isOwnBoard}
      hasMinimumTiles={hasMinimumTiles}
      isLogged={isLogged}
      isPublic={isPublic}
      intl={intl}
      publishBoard={publishBoard}
      onCopyLink={onCopyLink}
    />
  </Dialog>
);
