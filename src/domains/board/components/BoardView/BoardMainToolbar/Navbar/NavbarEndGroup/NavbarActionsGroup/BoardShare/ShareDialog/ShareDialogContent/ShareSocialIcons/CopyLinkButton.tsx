import CopyIcon from '@mui/icons-material/FilterNone';
import Button from '@mui/material/Button';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../../../../BoardShare.messages';

interface CopyLinkButtonProps {
  isPublic?: boolean;
  onCopyLink: () => void;
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  isPublic,
  onCopyLink,
}) => (
  <Button disabled={!isPublic} onClick={onCopyLink} color="primary">
    <div className="ShareDialog__socialIcons__action">
      <div>
        <CopyIcon />
      </div>
      <span>
        <FormattedMessage {...messages.copyLink} />
      </span>
    </div>
  </Button>
);
