import React from 'react';
import { useIntl } from 'react-intl';
import AnalyticsIcon from '@mui/icons-material/BarChart';

import IconButton from '../IconButton/IconButton';
import messages from '../../Analytics/Analytics.messages';

function AnalyticsButton(props: Record<string, unknown>) {
  const intl = useIntl();
  const { ...other } = props;
  const label = intl.formatMessage(messages.analytics);

  return (
    <IconButton label={label} {...other} size="large">
      <AnalyticsIcon />
    </IconButton>
  );
}

export default AnalyticsButton;
