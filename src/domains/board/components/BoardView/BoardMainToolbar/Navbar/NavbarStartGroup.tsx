import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { useIntl } from 'react-intl';

const backMessage = {
  id: 'komunicare.components.BackButton.back',
  defaultMessage: 'Go back',
};

interface NavbarStartGroupProps {
  showBackButton: boolean;
  isBackButtonFocused: boolean;
  disabled?: boolean;
  onBackClick?: () => void;
}

export const NavbarStartGroup: React.FC<NavbarStartGroupProps> = ({
  showBackButton,
  isBackButtonFocused,
  disabled,
  onBackClick,
}) => {
  const intl = useIntl();
  const theme = useTheme();
  const label = intl.formatMessage(backMessage);
  const icon =
    theme.direction === 'ltr' ? <ArrowBackIcon /> : <ArrowForwardIcon />;

  const button = (
    <IconButton
      aria-label={label}
      color="inherit"
      disabled={disabled}
      onClick={onBackClick}
      size="large"
      sx={disabled ? { color: 'rgba(0, 0, 0, 0.26)' } : undefined}
    >
      {icon}
    </IconButton>
  );

  return (
    <div className="Navbar__group Navbar__group--start">
      {showBackButton && (
        <div className={isBackButtonFocused ? 'scanner__focused' : ''}>
          <div>
            {disabled ? button : <Tooltip title={label}>{button}</Tooltip>}
          </div>
        </div>
      )}
    </div>
  );
};
