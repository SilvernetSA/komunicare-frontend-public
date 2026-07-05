import { Button } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Joyride, { STATUS } from 'react-joyride';

import { useAppStore } from '../../../../../store/appStore';
import { useBoardsStore } from '../../../../../store/boardsStore';
import { useCommunicatorsStore } from '../../../../../store/communicatorsStore';
import { DefaultBoardSelection } from '../../../../../utils/changeDefaultBoard';
import toolbarMessages from '../../../../Communicator/CommunicatorToolbar/CommunicatorToolbar.messages';
import {
  CustomBoardsGallery,
  default as DefaultBoardsGallery,
} from '../../../../Communicator/CommunicatorToolbar/DefaultBoardSelector/DefaultBoardsGallery';
import messages from '../../../Board.messages';
import './../Board.css';

const APP_DEFAULT_BOARD_IDS = new Set(['root', 'jjmlUcQs19', 'komunicare']);

interface BoardTourProps {
  isRootBoardTourEnabled?: boolean;
  isUnlockedTourEnabled?: boolean;
  isLocked?: boolean;
  disableTour: (options: Record<string, boolean>) => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  onDefaultBoardOptionClick: (
    selection: string | DefaultBoardSelection,
  ) => void;
}

interface CommunicatorLike {
  id?: string;
  rootBoard?: string;
  boards?: string[];
}

const joyRideStyles = {
  options: {
    arrowColor: '#eee',
    backgroundColor: '#eee',
    primaryColor: '#aa00ff',
    textColor: '#333',
    width: 500,
    zIndex: 1000,
  },
};

function BoardTour({
  isRootBoardTourEnabled,
  isUnlockedTourEnabled,
  isLocked,
  disableTour,
  intl,
  onDefaultBoardOptionClick,
}: BoardTourProps) {
  const [selectorStep, setSelectorStep] = useState<'custom' | 'defaults'>(
    'custom',
  );
  const boards = useBoardsStore((state) => state.boards);
  const activeBoardId = useBoardsStore((state) => state.activeBoardId);
  const userEmail = useAppStore((state) => state.userData.email);
  const communicators = useCommunicatorsStore(
    (state) => state.communicators,
  ) as CommunicatorLike[];
  const activeCommunicatorId = useCommunicatorsStore(
    (state) => state.activeCommunicatorId,
  );

  const currentRootBoardId = useMemo(() => {
    const activeCommunicator = communicators.find(
      (communicator) => communicator.id === activeCommunicatorId,
    );

    if (activeCommunicator?.rootBoard) {
      return activeCommunicator.rootBoard;
    }

    if (!activeBoardId) {
      return '';
    }

    const communicatorByRoot = communicators.find(
      (communicator) => communicator.rootBoard === activeBoardId,
    );
    if (communicatorByRoot?.rootBoard) {
      return communicatorByRoot.rootBoard;
    }

    const communicatorByBoard = communicators.find((communicator) =>
      communicator.boards?.includes(activeBoardId),
    );

    return communicatorByBoard?.rootBoard || '';
  }, [activeBoardId, activeCommunicatorId, communicators]);

  const customBoards = useMemo(() => {
    if (!userEmail) {
      return [];
    }

    const filteredBoards = boards.filter(
      (board) =>
        board.email === userEmail &&
        !board.hidden &&
        typeof board.id === 'string' &&
        board.id.length >= 14 &&
        !APP_DEFAULT_BOARD_IDS.has(board.id),
    );

    if (!currentRootBoardId) {
      return filteredBoards;
    }

    const currentRootBoard = filteredBoards.find(
      (board) => board.id === currentRootBoardId,
    );

    if (!currentRootBoard) {
      return filteredBoards;
    }

    return [
      currentRootBoard,
      ...filteredBoards.filter((board) => board.id !== currentRootBoardId),
    ];
  }, [boards, currentRootBoardId, userEmail]);

  const handleDefaultBoardClick = (
    selection: string | DefaultBoardSelection,
  ) => {
    setSelectorStep('custom');
    onDefaultBoardOptionClick(selection);
  };

  const unlockedHelpSteps: Array<{
    target: string;
    placement?: 'center';
    hideCloseButton: boolean;
    content: React.ReactNode;
    styles?: Record<string, unknown>;
  }> = [
    {
      target: 'body',
      placement: 'center' as const,
      hideCloseButton: true,
      content: (
        <h2>
          <FormattedMessage {...messages.walkthroughStart} />
        </h2>
      ),
    },
    {
      hideCloseButton: true,
      target: '.personal__account',
      content: <FormattedMessage {...messages.walkthroughSignInUp} />,
    },
    {
      hideCloseButton: true,
      target: '.edit__board__ride',
      content: <FormattedMessage {...messages.walkthroughEditBoard} />,
    },
    {
      hideCloseButton: true,
      target: '.EditToolbar__BoardTitle',
      content: <FormattedMessage {...messages.walkthroughBoardName} />,
    },
    {
      hideCloseButton: true,
      target: '.add__board__tile',
      content: <FormattedMessage {...messages.walkthroughAddTile} />,
    },
    {
      hideCloseButton: true,
      target: '.Communicator__title',
      content: <FormattedMessage {...messages.walkthroughChangeBoard} />,
    },
    {
      hideCloseButton: true,
      target: '.edit__communicator',
      content: <FormattedMessage {...messages.walkthroughBuildCommunicator} />,
    },
    {
      hideCloseButton: true,
      target: '.default__boards__selector',
      content: (
        <FormattedMessage {...messages.walkthroughDefaultBoardsSelector} />
      ),
    },
  ];

  const lockedHelpSteps: Array<{
    target: string;
    placement?: 'center';
    hideCloseButton: boolean;
    content: React.ReactNode;
    styles?: Record<string, unknown>;
  }> = [
    {
      target: 'body',
      placement: 'center' as const,
      hideCloseButton: true,
      styles: {
        tooltip: {
          width: '90vw',
          maxWidth: 700,
          maxHeight: '95vh',
          overflowY: 'auto' as const,
        },
      },
      content: (
        <>
          <h2>
            <FormattedMessage {...messages.walkthroughWelcome} />
          </h2>
          <p>
            <FormattedMessage {...messages.walkthroughChooseABoard} />
          </p>
          {selectorStep === 'custom' && (
            <CustomBoardsGallery
              boards={customBoards}
              intl={intl as any}
              onBoardClick={(boardId) =>
                handleDefaultBoardClick({
                  type: 'custom',
                  boardId,
                })
              }
              showIncludedOption={true}
              onIncludedOptionClick={() => setSelectorStep('defaults')}
            />
          )}
          {selectorStep === 'defaults' && (
            <>
              <Button onClick={() => setSelectorStep('custom')}>
                <FormattedMessage {...toolbarMessages.back} />
              </Button>
              <p>
                <FormattedMessage
                  {...toolbarMessages.selectDefaultBoardTitle}
                />
              </p>
              <DefaultBoardsGallery
                intl={intl as any}
                onOptionClick={handleDefaultBoardClick}
              />
            </>
          )}
        </>
      ),
    },
    {
      hideCloseButton: true,
      target: '.open__lock',
      content: <FormattedMessage {...messages.walkthroughUnlock} />,
    },
  ];

  return (
    <div>
      {isLocked && isRootBoardTourEnabled && (
        <Joyride
          callback={(data: { status: string }) => {
            const { status } = data;
            if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
              setSelectorStep('custom');
              if (isRootBoardTourEnabled) {
                disableTour({ isRootBoardTourEnabled: false });
              }
            }
          }}
          steps={lockedHelpSteps}
          continuous={true}
          showSkipButton={true}
          showProgress={true}
          disableOverlayClose={true}
          run={isRootBoardTourEnabled}
          styles={joyRideStyles}
          locale={{
            last: <FormattedMessage {...messages.walkthroughEndTour} />,
            skip: <FormattedMessage {...messages.walkthroughCloseTour} />,
            next: <FormattedMessage {...messages.walkthroughNext} />,
            back: <FormattedMessage {...messages.walkthroughBack} />,
          }}
        />
      )}
      {!isLocked && isUnlockedTourEnabled && (
        <Joyride
          callback={(data: { status: string }) => {
            const { status } = data;
            if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
              setSelectorStep('custom');
              if (isUnlockedTourEnabled) {
                disableTour({ isUnlockedTourEnabled: false });
              }
            }
          }}
          steps={unlockedHelpSteps}
          continuous={true}
          showSkipButton={true}
          showProgress={true}
          disableOverlayClose={true}
          run={isUnlockedTourEnabled}
          styles={joyRideStyles}
          locale={{
            last: <FormattedMessage {...messages.walkthroughEndTour} />,
            skip: <FormattedMessage {...messages.walkthroughCloseTour} />,
            next: <FormattedMessage {...messages.walkthroughNext} />,
            back: <FormattedMessage {...messages.walkthroughBack} />,
          }}
        />
      )}
    </div>
  );
}

export default BoardTour;
