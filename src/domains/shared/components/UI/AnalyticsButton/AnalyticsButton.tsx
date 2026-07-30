import AnalyticsIcon from '@mui/icons-material/BarChart';
import React from 'react';
import { useIntl } from 'react-intl';

import messages from '@/domains/app/components/Analytics/Analytics.messages';
import IconButton from '../IconButton/IconButton';

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
