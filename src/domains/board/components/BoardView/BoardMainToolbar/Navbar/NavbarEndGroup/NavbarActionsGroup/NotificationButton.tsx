import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

interface NotificationButtonProps {
  notificationsLabel: string;
  unreadNotificationsCount: number;
  pushEnabled: boolean;
  onToggle: (event: React.MouseEvent<HTMLElement>) => void;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  notificationsLabel,
  unreadNotificationsCount,
  pushEnabled,
  onToggle,
}) => (
  <span data-dwell="off">
    <Tooltip placement="bottom" title={notificationsLabel}>
      <IconButton
        aria-label={notificationsLabel}
        color="inherit"
        data-tour-id="toolbar-notifications"
        onClick={onToggle}
        size="large"
      >
        <Badge
          color="error"
          badgeContent={
            unreadNotificationsCount > 0 ? unreadNotificationsCount : 0
          }
          invisible={unreadNotificationsCount < 1}
          max={9}
        >
          <NotificationsOutlinedIcon
            color={pushEnabled ? 'primary' : 'inherit'}
          />
        </Badge>
      </IconButton>
    </Tooltip>
  </span>
);
