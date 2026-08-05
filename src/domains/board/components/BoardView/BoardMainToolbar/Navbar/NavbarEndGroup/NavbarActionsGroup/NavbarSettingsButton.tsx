import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

const settingsMessage = {
  id: 'komunicare.components.SettingsButton.settings',
  defaultMessage: 'Settings',
};

export const NavbarSettingsButton: React.FC = () => {
  const intl = useIntl();
  const label = intl.formatMessage(settingsMessage);

  return (
    <span data-dwell="off">
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          color="inherit"
          component={Link}
          data-tour-id="toolbar-settings"
          size="large"
          to="/settings"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </span>
  );
};
