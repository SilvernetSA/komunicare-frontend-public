import React from 'react';

import LockToggle from '@/domains/board/components/LockToggle/LockToggle';

interface NavbarLockToggleProps {
  showLock: boolean;
  isLocked?: boolean;
  onLockNotify?: () => void;
  onLockClick?: () => void;
}

export const NavbarLockToggle: React.FC<NavbarLockToggleProps> = ({
  showLock,
  isLocked,
  onLockNotify,
  onLockClick,
}) => {
  if (!showLock) return null;

  return (
    <div className={'open__lock'} data-dwell="off">
      <LockToggle
        data-tour-id="toolbar-lock"
        locked={isLocked}
        onLockTick={onLockNotify}
        onClick={onLockClick}
      />
    </div>
  );
};
