import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import React from 'react';

import './NavigationButtons.css';

interface NavigationButtonsProps {
  active: boolean;
  navHistory: string[];
  previousBoard: () => void;
  toRootBoard: () => void;
  isSaving: boolean;
  isNavigationButtonsOnTheSide: boolean;
  hasBackHistory?: boolean;
  hasRootHistory?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  active,
  navHistory,
  previousBoard,
  toRootBoard,
  isSaving,
  isNavigationButtonsOnTheSide,
  hasBackHistory = navHistory.length > 1,
  hasRootHistory = navHistory.length > 2,
}) => {
  if (!active) {
    return null;
  }

  const classPreviousBoardButton = isNavigationButtonsOnTheSide
    ? `SideNavigationButton SideButtonPreviousBoard ${
        !isSaving && hasBackHistory ? '' : 'disable'
      }`
    : `NavigationButton right`;

  const classToRootBoardButton = isNavigationButtonsOnTheSide
    ? `SideNavigationButton SideButtonToRootBoard ${
        !isSaving && hasRootHistory ? '' : 'disable'
      }`
    : 'NavigationButton left';

  return (
    <div
      className={
        isNavigationButtonsOnTheSide ? `SideNavigationButtonsContainer` : ''
      }
    >
      {(hasRootHistory || isNavigationButtonsOnTheSide) && (
        <div className={classToRootBoardButton}>
          <button onClick={toRootBoard} disabled={isSaving || !hasRootHistory}>
            <FirstPageIcon />
          </button>
        </div>
      )}
      {hasBackHistory && (
        <div className={classPreviousBoardButton}>
          <button
            onClick={previousBoard}
            disabled={isSaving || !hasBackHistory}
          >
            <ChevronLeftIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default NavigationButtons;
