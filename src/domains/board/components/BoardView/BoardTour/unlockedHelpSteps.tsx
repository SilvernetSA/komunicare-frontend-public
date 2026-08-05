import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../../Messages/Board.messages';

type TourStep = {
  target: string;
  placement?: 'center';
  hideCloseButton: boolean;
  content: React.ReactNode;
  styles?: Record<string, unknown>;
};

const allUnlockedHelpSteps: TourStep[] = [
  {
    target: 'body',
    placement: 'center' as const,
    hideCloseButton: true,
    content: (
      <div className="BoardTour__step">
        <span className="BoardTour__step-icon">🧭</span>
        <h2 className="BoardTour__step-title">
          <FormattedMessage {...messages.tourIntroTitle} />
        </h2>
        <p>
          <FormattedMessage {...messages.tourIntroBody} />
        </p>
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-communicator-dialog"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarCommunicatorDialog} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-create-communicator"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarCreateCommunicator} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-my-boards"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarMyBoards} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-default-communicator-switcher"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarDefaultCommunicator} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-ask-ai"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarAskAI} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-organize-pictograms"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarOrganizePictograms} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-add-content"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarAddContent} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-fullscreen"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarFullscreen} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-notifications"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarNotifications} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-settings"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarSettings} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-account"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarAccount} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-share"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarShare} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="floating-play"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarPlay} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="floating-clear"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarClear} />
      </div>
    ),
  },
  {
    hideCloseButton: true,
    target: '[data-tour-id="toolbar-lock"]',
    content: (
      <div className="BoardTour__step">
        <FormattedMessage {...messages.tourToolbarLock} />
      </div>
    ),
  },
];

const targetExists = (target: string): boolean => {
  if (target === 'body' || typeof document === 'undefined') {
    return true;
  }

  return !!document.querySelector(target);
};

export const getUnlockedHelpSteps = (): TourStep[] => {
  return allUnlockedHelpSteps.filter((step) => targetExists(step.target));
};
