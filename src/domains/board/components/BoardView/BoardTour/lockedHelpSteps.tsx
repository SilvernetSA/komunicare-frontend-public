import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../../Messages/Board.messages';

import {
  CustomBoardsGallery,
  default as DefaultBoardsGallery,
} from '@/domains/communicator/components/Communicator/CommunicatorToolbar/DefaultBoardSelector/DefaultBoardsGallery';
import toolbarMessages from '@/domains/communicator/components/Communicator/CommunicatorToolbar/CommunicatorToolbar.messages';
import { DefaultBoardSelection } from '@/utils/changeDefaultBoard';

type TourStep = {
  target: string;
  placement?: 'center';
  hideCloseButton: boolean;
  content: React.ReactNode;
  styles?: Record<string, unknown>;
};

interface LockedHelpStepsParams {
  selectorStep: 'custom' | 'defaults';
  setSelectorStep: (step: 'custom' | 'defaults') => void;
  customBoards: any[];
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  handleDefaultBoardClick: (selection: string | DefaultBoardSelection) => void;
}

export function getLockedHelpSteps({
  selectorStep,
  setSelectorStep,
  customBoards,
  intl,
  handleDefaultBoardClick,
}: LockedHelpStepsParams): TourStep[] {
  return [
    {
      target: 'body',
      placement: 'center' as const,
      hideCloseButton: true,
      styles: {
        tooltip: {
          width: '96vw',
          maxWidth: 1120,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 16,
          padding: '32px 36px 28px',
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
                <FormattedMessage {...messages.tourLockedWelcomeTitle} />
              </h1>
              <p className="BoardTour__onboarding-subtitle">
                <FormattedMessage {...messages.tourLockedWelcomeBody} />
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
                dedupeOfficialCommunicatorsByRootBoard={false}
                intl={intl as any}
                layout="grid"
                onOptionClick={handleDefaultBoardClick}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '[data-tour-id="toolbar-lock"]',
      content: (
        <div className="BoardTour__step">
          <span className="BoardTour__step-icon">🔓</span>
          <span>
            <FormattedMessage {...messages.tourLockedUnlock} />
          </span>
        </div>
      ),
    },
  ];
}
