import DialogContent from '@mui/material/DialogContent';
import React from 'react';

import { SharePublishSection } from './ShareDialogContent/SharePublishSection';
import { ShareSocialIcons } from './ShareDialogContent/ShareSocialIcons';

interface ShareDialogContentProps {
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
  publishBoard: () => void;
  onCopyLink: () => void;
}

export const ShareDialogContent: React.FC<ShareDialogContentProps> = ({
  url,
  isOwnBoard,
  hasMinimumTiles,
  isLogged,
  isPublic,
  intl,
  publishBoard,
  onCopyLink,
}) => (
  <DialogContent className="ShareDialog__content">
    <SharePublishSection
      isOwnBoard={isOwnBoard}
      hasMinimumTiles={hasMinimumTiles}
      isLogged={isLogged}
      isPublic={isPublic}
      publishBoard={publishBoard}
    />
    <ShareSocialIcons
      url={url}
      isLogged={isLogged}
      isPublic={isPublic}
      intl={intl}
      onCopyLink={onCopyLink}
    />
  </DialogContent>
);
