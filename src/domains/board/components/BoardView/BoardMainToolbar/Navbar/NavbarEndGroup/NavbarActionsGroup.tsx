import isMobile from 'ismobilejs';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';

import BoardShare from './NavbarActionsGroup/BoardShare.component';
import { NavbarSettingsButton } from './NavbarActionsGroup/NavbarSettingsButton';
import { NavbarFullScreenButton } from './NavbarFullScreenButton';
import messages from '../../../../Messages/Board.messages';

import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { getBoardShareUrl } from '@/platform/browser';
import { Board } from '@/types/board';

interface NavbarActionsGroupProps {
  isLocked?: boolean;
  board: Board;
  isLogged: boolean;
  publishBoard?: () => void;
  showNotification: (message: string) => void;
  intl: IntlShape;
}

export const NavbarActionsGroup: React.FC<NavbarActionsGroupProps> = ({
  isLocked,
  board,
  isLogged,
  publishBoard,
  showNotification,
  intl,
}) => {
  const [boardShareOpen, setBoardShareOpen] = useState(false);

  const activeCommunicator = useCommunicatorsStore((s) =>
    s.communicators.find((c) => c.id === s.activeCommunicatorId),
  );

  const isCommunicatorCopy = activeCommunicator?.copySource === 'komunicare';
  const isCommunicatorRootBoard = board.id === activeCommunicator?.rootBoard;

  if (isLocked) return null;

  return (
    <>
      {board.id && !['komunicare'].includes(board.id) && (
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
      {!isMobile().any && <NavbarFullScreenButton />}
      <NavbarSettingsButton />
    </>
  );
};
