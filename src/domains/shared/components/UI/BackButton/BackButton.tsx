import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useIntl } from 'react-intl';


import messages from './BackButton.messages';
import IconButton from '../IconButton/IconButton';

function BackButton(props: Record<string, unknown>) {
  const intl = useIntl();
  const theme = useTheme();
  const { ...rest } = props;

  const direction = theme?.direction ?? 'ltr';
  const label = intl.formatMessage(messages.back);

  return (
    <IconButton label={label} {...rest} size="large">
      {direction === 'ltr' ? <ArrowBackIcon /> : <ArrowForwardIcon />}
    </IconButton>
  );
}

export default BackButton;
