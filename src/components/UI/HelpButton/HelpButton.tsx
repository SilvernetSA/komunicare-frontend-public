import React from 'react';
import { useIntl } from 'react-intl';
import HelpIcon from '@mui/icons-material/Help';

import IconButton from '../IconButton/IconButton';
import messages from '../../Settings/Settings.messages';

function HelpButton(props: Record<string, unknown>) {
  const intl = useIntl();
  const { ...other } = props;
  const label = intl.formatMessage(messages.userHelp);

  return (
    <IconButton label={label} {...other} size="large">
      <HelpIcon />
    </IconButton>
  );
}

export default HelpButton;
