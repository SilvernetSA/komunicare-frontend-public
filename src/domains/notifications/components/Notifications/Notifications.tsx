// @ts-nocheck
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import React, { useRef, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { NOTIFICATION_DELAY } from './Notifications.constants';
import messages from './Notifications.messages';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';

type NotificationKind =
  | 'refresh'
  | 'cloudSpeakError'
  | 'cloudVoiceIsSeted'
  | string;

interface NotificationsProps {
  anchorOrigin?: {
    vertical: 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
  autoHideDuration?: number;
}

const Notifications: React.FC<NotificationsProps> = ({
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
  autoHideDuration = 5000,
  ...config
}) => {
  const { message, open, kind, showNotification, hideNotification } =
    useNotificationStore();

  const queuedNotificationsRef = useRef<string[]>([]);
  const previousPropsRef = useRef({ open: false, message: '' });

  const showQueuedNotificationIfAny = useCallback(() => {
    if (queuedNotificationsRef.current.length !== 0) {
      showNotification(queuedNotificationsRef.current[0]);
      queuedNotificationsRef.current.splice(0, 1);
    }
  }, [showNotification]);

  const handleNotificationDismissal = useCallback(
    (event: React.SyntheticEvent | Event, reason: string) => {
      if (reason === 'clickaway') return;
      hideNotification();
      showQueuedNotificationIfAny();
    },
    [hideNotification, showQueuedNotificationIfAny],
  );

  // Handle queuing logic
  useMemo(() => {
    const prevProps = previousPropsRef.current;
    if (prevProps.open && open && prevProps.message !== message) {
      queuedNotificationsRef.current.push(message);
      return null;
    }
    previousPropsRef.current = { open, message };
    return true;
  }, [open, message]);

  if (!message || message.length < 1) {
    return null;
  }

  const childrenDependKind = (notificationKind?: NotificationKind) => {
    const currentKind =
      typeof notificationKind === 'undefined' ? null : notificationKind;
    if (!currentKind) return null;

    if (currentKind === 'refresh')
      return (
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleNotificationDismissal}
          severity="info"
          action={
            <Button
              variant="outlined"
              onClick={() => {
                window.location.reload(true);
              }}
            >
              <FormattedMessage {...messages.refreshPage} />
            </Button>
          }
        >
          <span id="message-id">{message}</span>
        </Alert>
      );

    if (
      currentKind === 'cloudSpeakError' ||
      currentKind === 'cloudVoiceIsSeted'
    ) {
      const isCloudError = currentKind === 'cloudSpeakError';
      return (
        <Alert
          variant="filled"
          severity={isCloudError ? 'error' : 'info'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          action={
            isCloudError ? (
              <Button
                size="small"
                variant="outlined"
                style={{
                  color: 'white',
                  borderColor: 'white',
                  textAlign: 'center',
                }}
                component={Link}
                to="/settings/speech"
              >
                <FormattedMessage {...messages.changeVoiceOnError} />
              </Button>
            ) : null
          }
        >
          {isCloudError ? (
            <FormattedMessage {...messages.cloudSpeakErrorAlert} />
          ) : (
            <FormattedMessage {...messages.cloudVoiceIsSetedAlert} />
          )}
        </Alert>
      );
    }

    return null;
  };

  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      {...config}
      open={open}
      ContentProps={{
        variant: 'elevation',
        'aria-describedby': 'message-id',
      }}
      message={<span id="message-id">{message}</span>}
      onClose={handleNotificationDismissal}
    >
      {childrenDependKind(kind)}
    </Snackbar>
  );
};

export default Notifications;
