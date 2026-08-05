import React from 'react';

import UserIcon from '@/domains/app/components/UserIcon/UserIcon';

interface NavbarUserAccountProps {
  onClick: () => void;
}

export const NavbarUserAccount: React.FC<NavbarUserAccountProps> = ({
  onClick,
}) => (
  <div className="personal__account" data-dwell="off">
    <UserIcon data-tour-id="toolbar-account" onClick={onClick} />
  </div>
);
