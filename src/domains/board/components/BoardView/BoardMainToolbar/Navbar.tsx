import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { NavbarEndGroup } from './Navbar/NavbarEndGroup';
import { NavbarLockToggle } from './Navbar/NavbarLockToggle';
import { NavbarStartGroup } from './Navbar/NavbarStartGroup';
import messages from '../../Messages/Board.messages';

import { UserData } from '@/types/app';
import { Board } from '@/types/board';

import './Navbar.css';

interface NavbarProps {
  className?: string;
  board: Board;
  userData: UserData;
  title?: string;
  disabled?: boolean;
  showBackButton?: boolean;
  isLocked?: boolean;
  showLock?: boolean;
  onBackClick?: () => void;
  onLockClick?: () => void;
  onLockNotify?: () => void;
  showNotification: (message: string) => void;
  publishBoard?: () => void;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const {
    className,
    board,
    userData,
    disabled,
    showBackButton = true,
    isLocked,
    showLock = true,
    onBackClick,
    onLockClick,
    onLockNotify,
    showNotification,
    publishBoard,
  } = props;

  const intl = useIntl();
  const navigate = useNavigate();
  const [isBackButtonFocused] = useState(false);

  const isLogged = !!(userData?.name && userData?.email);

  const onUserIconClick = () => {
    if (isLocked) {
      showNotification(intl.formatMessage(messages.userProfileLocked));
    } else {
      if (userData?.name && userData?.email) {
        navigate('/settings/people');
      } else {
        navigate('/login-signup');
      }
    }
  };

  return (
    <div className={classNames('Navbar', className)}>
      <NavbarStartGroup
        showBackButton={showBackButton}
        isBackButtonFocused={isBackButtonFocused}
        disabled={disabled}
        onBackClick={onBackClick}
      />
      <NavbarEndGroup
        isLocked={isLocked}
        board={board}
        isLogged={isLogged}
        publishBoard={publishBoard}
        showNotification={showNotification}
        onUserIconClick={onUserIconClick}
        intl={intl}
      />
      <NavbarLockToggle
        showLock={showLock}
        isLocked={isLocked}
        onLockNotify={onLockNotify}
        onLockClick={onLockClick}
      />
    </div>
  );
};

export default Navbar;
