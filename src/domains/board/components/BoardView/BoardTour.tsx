import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Joyride, { STATUS } from 'react-joyride';

import messages from '../Messages/Board.messages';
import { getLockedHelpSteps } from './BoardTour/lockedHelpSteps';
import { getUnlockedHelpSteps } from './BoardTour/unlockedHelpSteps';

import { useAppStore } from '@/domains/app/stores/appStore';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { DefaultBoardSelection } from '@/utils/changeDefaultBoard';
import '../Styles/Board.css';
import './Styles/BoardTour.css';

const APP_DEFAULT_BOARD_IDS = new Set(['komunicare']);

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

const BoardTour: React.FC<BoardTourProps> = ({
  isRootBoardTourEnabled,
  isUnlockedTourEnabled,
  isLocked,
  disableTour,
  intl,
  onDefaultBoardOptionClick,
}) => {
  const [selectorStep, setSelectorStep] = useState<'custom' | 'defaults'>(
    'defaults',
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
    const isCustomSelection =
      typeof selection !== 'string' && selection.type === 'custom';

    if (isRootBoardTourEnabled) {
      setSelectorStep('defaults');
      disableTour({ isRootBoardTourEnabled: false });
    } else {
      setSelectorStep(isCustomSelection ? 'custom' : 'defaults');
    }

    onDefaultBoardOptionClick(selection);
  };

  const lockedHelpSteps = getLockedHelpSteps({
    selectorStep,
    setSelectorStep,
    customBoards,
    intl,
    handleDefaultBoardClick,
  });
  const unlockedHelpSteps = getUnlockedHelpSteps();

  const joyrideLocale = {
    last: <FormattedMessage {...messages.tourButtonEnd} />,
    skip: <FormattedMessage {...messages.tourButtonClose} />,
    next: <FormattedMessage {...messages.tourButtonNext} />,
    back: <FormattedMessage {...messages.tourButtonBack} />,
  };

  return (
    <div>
      {isLocked && isRootBoardTourEnabled && (
        <Joyride
          callback={(data: { status: string }) => {
            const { status } = data;
            if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
              setSelectorStep('defaults');
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
              setSelectorStep('defaults');
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
};

export default BoardTour;
