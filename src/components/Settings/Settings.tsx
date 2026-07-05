import NavigationIcon from '@mui/icons-material/ChevronRight';
import DevicesIcon from '@mui/icons-material/Devices';
import LanguageIcon from '@mui/icons-material/Language';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import messages from './Settings.messages';
import SettingsSection from './SettingsSection.component';
import SettingsTour from './SettingsTour.component';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { UserData } from '../../types/app';
import FullScreenDialog from '../UI/FullScreenDialog/FullScreenDialog';
import IconButton from '../UI/IconButton/IconButton';
import UserIcon from '../UI/UserIcon/UserIcon';
import './Settings.css';

// ─── Component ─────────────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppStore((state) => state.userData) as UserData;
  const disableTour = useAppStore((state) => state.disableTour);
  const isLoggedIn = !!(user as any)?.email;
  const isSettingsTourEnabled = useAppStore(
    (state) => (state.liveHelp as any).isSettingsTourEnabled,
  );
  const isDownloadingLang = useLanguageStore(
    (state) => state.downloadingLang.isdownloading,
  );
  const handleLogOutClick = () => {
    void useAuthStore.getState().logout();
  };

  const handleGoBack = () => {
    if (isDownloadingLang) return;
    navigate('/', { replace: true });
  };

  const enableTour = () => {
    disableTour({ isSettingsTourEnabled: true });
  };

  const getSettingsSections = () => {
    const peopleSettings = [
      {
        icon: (
          <div className="Settings__UserIcon__Container">
            <UserIcon link={false} accountIcon={PersonIcon} />
          </div>
        ),
        secondary: isLoggedIn ? user.name : null,
        text: isLoggedIn ? messages.username : messages.guest,
        url: '/settings/people',
        rightContent: isLoggedIn ? (
          <Button
            color="primary"
            onClick={handleLogOutClick}
            variant="outlined"
          >
            <FormattedMessage {...messages.logout} />
          </Button>
        ) : (
          <Button
            color="primary"
            variant="outlined"
            component={Link}
            to="/login-signup"
          >
            <FormattedMessage {...messages.loginSignup} />
          </Button>
        ),
      },
    ];

    if (!(user as any)?.isByBackOffice) {
      const subscribeSection = {
        icon: <MonetizationOnIcon />,
        text: messages.subscribe,
        url: '/settings/subscribe',
        secondary: undefined,
        rightContent: undefined,
      };
      peopleSettings.push(subscribeSection);
    }

    return [
      {
        subheader: messages.people,
        layout: 'row' as const,
        settings: peopleSettings.map((item, i) => ({
          ...item,
          color: i === 0 ? '#5C6BC0' : '#26A69A',
        })),
      },
      {
        subheader: messages.language,
        layout: 'card' as const,
        settings: [
          {
            icon: <LanguageIcon />,
            text: messages.language,
            url: '/settings/language',
            color: '#1565C0',
          },
          {
            icon: <RecordVoiceOverIcon />,
            text: messages.speech,
            url: '/settings/speech',
            color: '#0288D1',
          },
        ],
      },
      {
        subheader: messages.system,
        layout: 'card' as const,
        settings: [
          {
            icon: <VisibilityIcon />,
            text: messages.display,
            url: '/settings/display',
            color: '#7B1FA2',
          },
          {
            icon: <DevicesIcon />,
            text: messages.devices,
            url: '/settings/devices',
            color: '#00838F',
          },
          {
            icon: <NavigationIcon />,
            text: messages.navigation,
            url: '/settings/navigation',
            color: '#4E342E',
          },
        ],
      },
    ];
  };

  const isSettingsLocation = location.pathname === '/settings';

  return (
    <FullScreenDialog
      className="Settings"
      open
      title={<FormattedMessage {...messages.settings} />}
      onClose={handleGoBack}
      buttons={
        isSettingsLocation &&
        !isSettingsTourEnabled &&
        !isDownloadingLang && (
          <div className="Settings_EnableTour_Button">
            <IconButton
              label={intl.formatMessage(messages.enableTour)}
              onClick={enableTour}
              size="large"
            >
              <LiveHelpIcon />
            </IconButton>
          </div>
        )
      }
    >
      {isDownloadingLang ? (
        <div className="Settings__spinner-container">
          <CircularProgress
            size={60}
            className="Settings__loading-Spinner"
            thickness={4}
          />
        </div>
      ) : (
        <div className="Settings__body">
          {getSettingsSections().map(
            ({ subheader, settings, layout }, index) => (
              <SettingsSection
                subheader={subheader}
                settings={settings}
                layout={layout}
                key={index}
              />
            ),
          )}
        </div>
      )}
      {isSettingsLocation && isSettingsTourEnabled && (
        <SettingsTour
          intl={intl}
          disableTour={disableTour}
          isSettingsTourEnabled={isSettingsTourEnabled}
        />
      )}
    </FullScreenDialog>
  );
};

export default Settings;
