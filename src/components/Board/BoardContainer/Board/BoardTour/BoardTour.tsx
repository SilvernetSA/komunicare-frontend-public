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
import './BoardTour.css';

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

const tobiiJoyrideStyles = {
  options: {
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    primaryColor: '#0084c8',
    textColor: '#1a2640',
    width: 560,
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0, 132, 200, 0.15)',
    padding: '28px 32px',
  },
  tooltipTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#1a2640',
    marginBottom: 8,
  },
  tooltipContent: {
    fontSize: '1rem',
    color: '#3d5068',
    lineHeight: 1.6,
  },
  buttonNext: {
    backgroundColor: '#0084c8',
    borderRadius: 8,
    fontSize: '0.95rem',
    fontWeight: 600,
    padding: '10px 24px',
  },
  buttonBack: {
    color: '#0084c8',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  buttonSkip: {
    color: '#6b7f96',
    fontSize: '0.9rem',
  },
  beaconInner: {
    backgroundColor: '#0084c8',
  },
  beaconOuter: {
    borderColor: '#b3d9f0',
    backgroundColor: 'rgba(0, 132, 200, 0.2)',
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
        <div className="BoardTour__step">
          <span className="BoardTour__step-icon">🎉</span>
          <h2 className="BoardTour__step-title">
            <FormattedMessage {...messages.walkthroughStart} />
          </h2>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.personal__account',
      content: (
        <div className="BoardTour__step">
          <FormattedMessage {...messages.walkthroughSignInUp} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.edit__board__ride',
      content: (
        <div className="BoardTour__step">
          <FormattedMessage {...messages.walkthroughEditBoard} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.EditToolbar__BoardTitle',
      content: (
        <div className="BoardTour__step">
          <FormattedMessage {...messages.walkthroughBoardName} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.add__board__tile',
      content: (
        <div className="BoardTour__step">
          <FormattedMessage {...messages.walkthroughAddTile} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.Communicator__title',
      content: (
        <div className="BoardTour__step">
          <FormattedMessage {...messages.walkthroughChangeBoard} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.edit__communicator',
      content: (
        <div className="BoardTour__step">
          <FormattedMessage {...messages.walkthroughBuildCommunicator} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.default__boards__selector',
      content: (
        <div className="BoardTour__step">
          <FormattedMessage {...messages.walkthroughDefaultBoardsSelector} />
        </div>
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
          width: '92vw',
          maxWidth: 740,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 16,
          padding: '32px 32px 24px',
          boxShadow: '0 16px 48px rgba(0, 132, 200, 0.2)',
        },
      },
      content: (
        <div className="BoardTour__onboarding">
          <div className="BoardTour__onboarding-header">
            <img
              className="BoardTour__onboarding-logo"
              src="/images/logo.svg"
              alt="Komunicare"
            />
            <div>
              <h1 className="BoardTour__onboarding-title">
                <FormattedMessage {...messages.walkthroughWelcome} />
              </h1>
              <p className="BoardTour__onboarding-subtitle">
                <FormattedMessage {...messages.walkthroughChooseABoard} />
              </p>
            </div>
          </div>

          <div className="BoardTour__onboarding-divider" />

          {selectorStep === 'custom' && (
            <CustomBoardsGallery
              boards={customBoards}
              intl={intl as any}
              onBoardClick={(boardId) =>
                handleDefaultBoardClick({ type: 'custom', boardId })
              }
              showIncludedOption={true}
              onIncludedOptionClick={() => setSelectorStep('defaults')}
            />
          )}

          {selectorStep === 'defaults' && (
            <div className="BoardTour__onboarding-defaults">
              <button
                className="BoardTour__onboarding-back"
                onClick={() => setSelectorStep('custom')}
              >
                ← <FormattedMessage {...toolbarMessages.back} />
              </button>
              <p className="BoardTour__onboarding-defaults-label">
                <FormattedMessage
                  {...toolbarMessages.selectDefaultBoardTitle}
                />
              </p>
              <DefaultBoardsGallery
                intl={intl as any}
                onOptionClick={handleDefaultBoardClick}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '.open__lock',
      content: (
        <div className="BoardTour__step">
          <span className="BoardTour__step-icon">🔓</span>
          <span>
            <FormattedMessage {...messages.walkthroughUnlock} />
          </span>
        </div>
      ),
    },
  ];

  const joyrideLocale = {
    last: <FormattedMessage {...messages.walkthroughEndTour} />,
    skip: <FormattedMessage {...messages.walkthroughCloseTour} />,
    next: <FormattedMessage {...messages.walkthroughNext} />,
    back: <FormattedMessage {...messages.walkthroughBack} />,
  };

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
          styles={tobiiJoyrideStyles}
          locale={joyrideLocale}
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
          styles={tobiiJoyrideStyles}
          locale={joyrideLocale}
        />
      )}
    </div>
  );
}

export default BoardTour;
