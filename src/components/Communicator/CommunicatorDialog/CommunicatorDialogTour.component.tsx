import React from 'react';
import Joyride, { STATUS } from 'react-joyride';

import { TAB_INDEXES } from './CommunicatorDialog.constants';
import {
  getCommBoardsHelpSteps,
  getPublicBoardsHelpSteps,
  getAllMyBoardsHelpSteps,
} from './CommunicatorDialogBoardItem/tourSteps';
import {
  joyrideStyles,
  getJoyrideLocale,
} from './CommunicatorDialogBoardItem/tourConfig';
import messages from './CommunicatorDialog.messages';
import './CommunicatorDialog.css';

interface CommunicatorTour {
  isPublicBoardsEnabled?: boolean;
  isAllMyBoardsEnabled?: boolean;
  isCommBoardsEnabled?: boolean;
  [key: string]: unknown;
}

interface Props {
  communicatorTour: CommunicatorTour;
  selectedTab: number;
  disableTour: (tour: { communicatorTour: CommunicatorTour }) => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
    locale: string;
  };
}

const CommunicatorDialogTour: React.FC<Props> = ({
  communicatorTour,
  selectedTab,
  disableTour,
  intl,
}) => {
  const commBoardsHelpSteps = getCommBoardsHelpSteps(intl);
  const publicBoardsHelpSteps = getPublicBoardsHelpSteps(intl);
  const allMyBoardsHelpSteps = getAllMyBoardsHelpSteps(intl);
  const joyrideLocale = getJoyrideLocale(intl, messages);

  return (
    <div>
      {selectedTab === TAB_INDEXES.PUBLIC_BOARDS &&
        communicatorTour.isPublicBoardsEnabled && (
          <Joyride
            callback={(data) => {
              const { status } = data;
              if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
                disableTour({
                  communicatorTour: {
                    ...communicatorTour,
                    isPublicBoardsEnabled: false,
                  },
                });
              }
            }}
            steps={publicBoardsHelpSteps as any}
            continuous={true}
            showSkipButton={true}
            disableScrollParentFix={true}
            disableScrolling={true}
            showProgress={false}
            disableOverlayClose={true}
            run={communicatorTour.isPublicBoardsEnabled}
            styles={joyrideStyles}
            locale={joyrideLocale}
          />
        )}
      {selectedTab === TAB_INDEXES.MY_BOARDS &&
        communicatorTour.isAllMyBoardsEnabled && (
          <Joyride
            callback={(data) => {
              const { status } = data;
              if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
                disableTour({
                  communicatorTour: {
                    ...communicatorTour,
                    isAllMyBoardsEnabled: false,
                  },
                });
              }
            }}
            steps={allMyBoardsHelpSteps as any}
            continuous={true}
            showSkipButton={true}
            showProgress={false}
            disableScrollParentFix={true}
            disableOverlayClose={true}
            scrollOffset={250}
            run={communicatorTour.isAllMyBoardsEnabled}
            styles={joyrideStyles}
            locale={joyrideLocale}
          />
        )}
      {selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS &&
        communicatorTour.isCommBoardsEnabled && (
          <Joyride
            callback={(data) => {
              const { status } = data;
              if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
                disableTour({
                  communicatorTour: {
                    ...communicatorTour,
                    isCommBoardsEnabled: false,
                  },
                });
              }
            }}
            steps={commBoardsHelpSteps as any}
            continuous={true}
            showSkipButton={true}
            showProgress={false}
            disableOverlayClose={true}
            disableScrolling={true}
            disableScrollParentFix={true}
            run={communicatorTour.isCommBoardsEnabled}
            styles={joyrideStyles}
            locale={joyrideLocale}
          />
        )}
    </div>
  );
};

export default CommunicatorDialogTour;
