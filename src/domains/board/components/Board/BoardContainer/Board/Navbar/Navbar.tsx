import classNames from 'classnames';
import isMobile from 'ismobilejs';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useNavigate } from 'react-router-dom';

import messages from '../../../Board.messages';
import BoardShare from '../BoardShare/BoardShare.component';

import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
// import PremiumFeature from '../../../../PremiumFeature/PremiumFeature';
// import AnalyticsButton from '@/domains/shared/components/UI/AnalyticsButton/AnalyticsButton';
import BackButton from '@/domains/shared/components/UI/BackButton/BackButton';
import FullScreenButton from '@/domains/shared/components/UI/FullScreenButton/FullScreenButton';
import LockToggle from '@/domains/board/components/LockToggle/LockToggle';
import SettingsButton from '@/domains/shared/components/UI/SettingsButton/SettingsButton';
import UserIcon from '@/domains/app/components/UserIcon/UserIcon';
import { getBoardShareUrl } from '@/platform/browser';
import { UserData } from '@/types/app';
import { Board } from '@/types/board';

import './Navbar.css';

// --- Tipos y Interfaces ---

// 2. Se crea una interfaz para todas las props, reemplazando PropTypes.
interface NavbarProps {
  className?: string;
  board: Board;
  userData: UserData;
  title?: string;
  disabled?: boolean;
  showBackButton?: boolean;
  isLocked?: boolean;
  onBackClick?: () => void;
  onLockClick?: () => void;
  onLockNotify?: () => void;
  showNotification: (message: string) => void;
  publishBoard?: () => void;
}

// --- Componente ---

const Navbar: React.FC<NavbarProps> = (props) => {
  const {
    className,
    board,
    userData,
    title,
    disabled,
    showBackButton = true,
    isLocked,
    onBackClick,
    onLockClick,
    onLockNotify,
    showNotification,
    publishBoard,
  } = props;

  const intl = useIntl();
  const navigate = useNavigate();
  const [isBackButtonFocused] = useState(false);
  const [boardShareOpen, setBoardShareOpen] = useState(false);

  const activeCommunicator = useCommunicatorsStore((s) =>
    s.communicators.find((c) => c.id === s.activeCommunicatorId),
  );
  const isCommunicatorCopy = activeCommunicator?.copySource === 'komunicare';
  const isCommunicatorRootBoard = board.id === activeCommunicator?.rootBoard;

  const onUserIconClick = () => {
    if (isLocked) {
      const userLockMessage = intl.formatMessage(messages.userProfileLocked);
      showNotification(userLockMessage);
    } else {
      if (userData?.name && userData?.email) {
        navigate('/settings/people');
      } else {
        navigate('/login-signup');
      }
    }
  };

  const isLogged = !!(userData?.name && userData?.email);

  return (
    <div className={classNames('Navbar', className)}>
      {isLocked && <h2 className="Navbar__title">{title}</h2>}
      <div className="Navbar__group Navbar__group--start">
        {showBackButton && (
          <div className={isBackButtonFocused ? 'scanner__focused' : ''}>
            <div>
              <BackButton disabled={disabled} onClick={onBackClick} />
            </div>
          </div>
        )}
      </div>
      <div className="Navbar__group Navbar__group--end">
        {!isLocked && (
          <>
            {board.id &&
              !['root', 'jjmlUcQs19', 'komunicare'].includes(board.id) && (
                <BoardShare
                  label={intl.formatMessage(messages.share)}
                  url={getBoardShareUrl(board.id)}
                  intl={intl}
                  isPublic={board.isPublic}
                  isLogged={isLogged}
                  isOwnBoard={
                    board.author !== 'Komunicare' &&
                    !(isCommunicatorCopy && isCommunicatorRootBoard)
                  }
                  tileCount={board.tiles?.length ?? 0}
                  open={boardShareOpen}
                  onShareClick={() => setBoardShareOpen(true)}
                  onShareClose={() => setBoardShareOpen(false)}
                  publishBoard={publishBoard as any}
                  onCopyLink={() => {
                    navigator.clipboard.writeText(getBoardShareUrl(board.id));
                    showNotification('Link copied');
                  }}
                />
              )}
            {!isMobile().any && <FullScreenButton />}
            {/* Analytics hidden temporarily
            {isLogged && (
              <PremiumFeature>
                <AnalyticsButton component={Link} to="/analytics" />
              </PremiumFeature>
            )}
            */}
            <SettingsButton component={Link} to="/settings" />
          </>
        )}
        <div className={'personal__account'}>
          <UserIcon onClick={onUserIconClick} />
        </div>
      </div>
      <div className={'open__lock'}>
        <LockToggle
          locked={isLocked}
          onLockTick={onLockNotify}
          onClick={onLockClick}
        />
      </div>
    </div>
  );
};

// 6. Se elimina el bloque de PropTypes, ahora es manejado por TypeScript.

export default Navbar;
