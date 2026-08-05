import AccountIcon from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useIntl } from 'react-intl';

import messages from './UserIcon.messages';
import { useAppStore } from '@/domains/app/stores/appStore';
import { UserData } from '@/types/app';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';

interface UserIconProps {
  /** Override the logged-in user. When omitted the component reads from the store. */
  user?: UserData | null;
  onClick?: () => void;
  [key: string]: unknown;
}

const StyledAvatar = styled(Avatar)({
  backgroundColor: green[500],
});

const UserIcon: React.FC<UserIconProps> = ({ user: userProp, ...other }) => {
  const intl = useIntl();
  const userData = useAppStore((state) => state.userData);
  const storeUser = userData.email ? (userData as UserData) : null;
  const user = userProp !== undefined ? userProp : storeUser;

  let avatar = null;
  let hasPhotos = false;

  if (user && user.name) {
    const fPhotos =
      (user as any).facebook &&
      (user as any).facebook.photos &&
      (user as any).facebook.photos.length
        ? (user as any).facebook.photos
        : null;
    const gPhotos =
      (user as any).google &&
      (user as any).google.photos &&
      (user as any).google.photos.length
        ? (user as any).google.photos
        : null;
    const uPhotos =
      (user as any).photos && (user as any).photos.length
        ? (user as any).photos
        : null;
    const photos = uPhotos || gPhotos || fPhotos || [];

    if (photos.length) {
      hasPhotos = true;
      avatar = photos[0];
    } else {
      const [first, second = ''] = user.name
        .toUpperCase()
        .split(' ')
        .slice(0, 2);
      avatar = `${first.slice(0, 1)}${second.slice(0, 1)}`;
    }
  }

  return (
    <IconButton
      label={user?.name || intl.formatMessage(messages.login)}
      {...other}
      size="large"
    >
      <React.Fragment>
        {!user && <AccountIcon />}
        {!!user && (
          <StyledAvatar className="UserIcon__Avatar">
            {!hasPhotos && avatar}
            {hasPhotos && <img src={avatar} alt={user.name || ''} />}
          </StyledAvatar>
        )}
      </React.Fragment>
    </IconButton>
  );
};

export default UserIcon;
