import React from 'react';
import { IntlShape } from 'react-intl';

import { NavbarActionsGroup } from './NavbarEndGroup/NavbarActionsGroup';
import { NavbarUserAccount } from './NavbarEndGroup/NavbarUserAccount';

import { Board } from '@/types/board';

interface NavbarEndGroupProps {
  isLocked?: boolean;
  board: Board;
  isLogged: boolean;
  publishBoard?: () => void;
  showNotification: (message: string) => void;
  onUserIconClick: () => void;
  intl: IntlShape;
}

export const NavbarEndGroup: React.FC<NavbarEndGroupProps> = ({
  isLocked,
  board,
  isLogged,
  publishBoard,
  showNotification,
  onUserIconClick,
  intl,
}) => (
  <div className="Navbar__group Navbar__group--end">
    <NavbarActionsGroup
      isLocked={isLocked}
      board={board}
      isLogged={isLogged}
      publishBoard={publishBoard}
      showNotification={showNotification}
      intl={intl}
    />
    <NavbarUserAccount onClick={onUserIconClick} />
  </div>
);
