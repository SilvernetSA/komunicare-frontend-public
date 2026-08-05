import Button from '@mui/material/Button';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';

import messages from '../../../../BoardShare.messages';

interface WhatsappButtonProps {
  url: string;
  isPublic?: boolean;
  intl: {
    formatMessage: (
      message: { id: string; defaultMessage: string },
      values?: Record<string, unknown>,
    ) => string;
  };
}

export const WhatsappButton: React.FC<WhatsappButtonProps> = ({
  url,
  isPublic,
  intl,
}) => (
  <Button disabled={!isPublic} color="primary">
    <WhatsappShareButton title={intl.formatMessage(messages.subject)} url={url}>
      <div className="ShareDialog__socialIcons__action">
        <div>
          <WhatsappIcon round size={64} />
        </div>
        <span>
          <FormattedMessage id="whatsapp" {...messages.whatsapp} />
        </span>
      </div>
    </WhatsappShareButton>
  </Button>
);
