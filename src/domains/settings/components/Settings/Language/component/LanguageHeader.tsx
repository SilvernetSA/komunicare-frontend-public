import { ListSubheader, Typography } from '@mui/material';
import React from 'react';

import messages from '../Language.messages';

interface LanguageHeaderProps {
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messageKey: string;
  defaultText: string;
}

export const LanguageHeader: React.FC<LanguageHeaderProps> = ({
  intl,
  messageKey,
  defaultText,
}) => (
  <ListSubheader color="primary">
    <div className="Settings__Language__download_Typography">
      <Typography variant="h6">
        {intl ? intl.formatMessage(messages[messageKey]) : defaultText}
      </Typography>
    </div>
  </ListSubheader>
);
