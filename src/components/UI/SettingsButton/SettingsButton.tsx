import React from 'react';
import { useIntl } from 'react-intl';
import SettingsIcon from '@mui/icons-material/Settings';

import IconButton from '../IconButton/IconButton';
import messages from './SettingsButton.messages';

interface SettingsButtonProps {
  component?: React.ElementType;
  disabled?: boolean;
  onClick?: () => void;
  to?: string;
  [key: string]: unknown;
}

const SettingsButton: React.FC<SettingsButtonProps> = (props) => {
  const intl = useIntl();
  const { ...other } = props;
  const label = intl.formatMessage(messages.settings);

  return (
    <IconButton label={label} {...other} size="large">
      <SettingsIcon />
    </IconButton>
  );
};

export default SettingsButton;
