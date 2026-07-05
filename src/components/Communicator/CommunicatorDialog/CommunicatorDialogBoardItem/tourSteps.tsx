import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import InputIcon from '@mui/icons-material/Input';
import PublicIcon from '@mui/icons-material/Public';
import QueueIcon from '@mui/icons-material/Queue';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import KeyIcon from '@mui/icons-material/VpnKey';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../CommunicatorDialog.messages';

interface TourStep {
  target: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  hideCloseButton: boolean;
  content: React.ReactNode;
}

const tourHeadingStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#212121',
  lineHeight: 1.3,
};

const tourBodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.92rem',
  color: '#616161',
  lineHeight: 1.65,
};

const tourAccentBarStyle: React.CSSProperties = {
  height: '4px',
  background: 'linear-gradient(90deg, #7b1fa2, #ab47bc)',
  marginBottom: '0',
};

const tourItemListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: '12px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const tourItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  fontSize: '0.9rem',
  color: '#424242',
  lineHeight: 1.5,
};

const tourIconStyle: React.CSSProperties = {
  color: '#7b1fa2',
  flexShrink: 0,
  marginTop: '1px',
  fontSize: '20px',
};

const tourSectionTitleStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: '1rem',
  fontWeight: 600,
  color: '#212121',
};

const WelcomeStep = ({
  title,
  body,
}: {
  title: React.ReactNode;
  body: React.ReactNode;
}) => (
  <div>
    <div style={tourAccentBarStyle} />
    <div style={{ padding: '24px 28px 4px' }}>
      <p style={tourHeadingStyle}>{title}</p>
      <p style={tourBodyStyle}>{body}</p>
    </div>
  </div>
);

const ActionListStep = ({
  title,
  items,
}: {
  title: React.ReactNode;
  items: { icon: React.ReactNode; label: React.ReactNode }[];
}) => (
  <div>
    <p style={tourSectionTitleStyle}>{title}</p>
    <ul style={tourItemListStyle}>
      {items.map((item, i) => (
        <li key={i} style={tourItemStyle}>
          <span style={tourIconStyle}>{item.icon}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const getCommBoardsHelpSteps = (intl: {
  formatMessage: (message: { id: string; defaultMessage: string }) => string;
}): TourStep[] => [
  {
    target: 'body',
    placement: 'center',
    hideCloseButton: true,
    content: (
      <WelcomeStep
        title={<FormattedMessage {...messages.walkthroughCommunicatorTitle} />}
        body={<FormattedMessage {...messages.walkthroughCommunicator} />}
      />
    ),
  },
  {
    hideCloseButton: true,
    target: '#CommunicatorDialog__BoardBtn',
    content: (
      <p style={tourBodyStyle}>
        <FormattedMessage {...messages.walkthroughBoards} />
      </p>
    ),
  },
  {
    hideCloseButton: true,
    target: '#CommunicatorDialog__PublicBoardsBtn',
    content: (
      <p style={tourBodyStyle}>
        <FormattedMessage {...messages.walkthroughPublicBoards} />
      </p>
    ),
  },
  {
    hideCloseButton: true,
    target: '#CommunicatorDialog__AllMyBoardsBtn',
    content: (
      <p style={tourBodyStyle}>
        <FormattedMessage {...messages.walkthroughAllMyBoards} />
      </p>
    ),
  },
  {
    hideCloseButton: true,
    target: '.CommunicatorDialogButtons__searchButton',
    content: (
      <p style={tourBodyStyle}>
        <FormattedMessage {...messages.walkthroughSearch} />
      </p>
    ),
  },
  {
    hideCloseButton: true,
    target: '[name="CommunicatorDialog__PropertyOption"]',
    content: (
      <ActionListStep
        title={<FormattedMessage {...messages.walkthroughBoardProperties} />}
        items={[
          {
            icon: <PublicIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.publicBoard)
              : 'Public Board',
          },
          {
            icon: <KeyIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.privateBoard)
              : 'Private Board',
          },
          {
            icon: <HomeIcon fontSize="small" />,
            label: intl ? intl.formatMessage(messages.rootBoard) : 'Root Board',
          },
          {
            icon: <RemoveRedEyeIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.activeBoard)
              : 'Active Board',
          },
        ]}
      />
    ),
  },
  {
    hideCloseButton: true,
    target: '.CommunicatorDialog__boards__item__actions',
    placement: 'left',
    content: (
      <ActionListStep
        title={<FormattedMessage {...messages.walkthroughBoardActionButton} />}
        items={[
          {
            icon: <ClearIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.walkthroughBoardActionsRemove)
              : 'Remove Board',
          },
          {
            icon: <HomeIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(
                  messages.walkthroughBoardActionsSetBoardAsRoot,
                )
              : 'Set as Root Board',
          },
        ]}
      />
    ),
  },
];

export const getPublicBoardsHelpSteps = (intl: {
  formatMessage: (message: { id: string; defaultMessage: string }) => string;
}): TourStep[] => [
  {
    target: 'body',
    placement: 'center',
    hideCloseButton: true,
    content: (
      <WelcomeStep
        title={<FormattedMessage {...messages.allBoards} />}
        body={<FormattedMessage {...messages.walkthroughPublicBoards} />}
      />
    ),
  },
  {
    hideCloseButton: true,
    target: '.CommunicatorDialog__boards__item__actions',
    placement: 'left',
    content: (
      <ActionListStep
        title={<FormattedMessage {...messages.walkthroughBoardActionButton} />}
        items={[
          {
            icon: <QueueIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.walkthroughPublicBoardsCopy)
              : 'Copy Board',
          },
          {
            icon: <InfoIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.walkthroughPublicBoardsDetail)
              : 'Board Details',
          },
        ]}
      />
    ),
  },
];

export const getAllMyBoardsHelpSteps = (intl: {
  formatMessage: (message: { id: string; defaultMessage: string }) => string;
}): TourStep[] => [
  {
    target: 'body',
    placement: 'center',
    hideCloseButton: true,
    content: (
      <WelcomeStep
        title={<FormattedMessage {...messages.myBoards} />}
        body={<FormattedMessage {...messages.walkthroughAllMyBoards} />}
      />
    ),
  },
  {
    target: '#CommunicatorDialog__boards__item__image__Btn',
    hideCloseButton: true,
    content: (
      <p style={tourBodyStyle}>
        <FormattedMessage {...messages.walkthroughAllMyBoardsEditBoardImage} />
      </p>
    ),
  },
  {
    target: '.CommunicatorDialog__boards__item__edit-title',
    hideCloseButton: true,
    content: (
      <p style={tourBodyStyle}>
        <FormattedMessage {...messages.walkthroughAllMyBoardsEditBoardName} />
      </p>
    ),
  },
  {
    hideCloseButton: true,
    target: '.CommunicatorDialog__boards__item__actions',
    placement: 'left',
    content: (
      <ActionListStep
        title={<FormattedMessage {...messages.walkthroughBoardActionButton} />}
        items={[
          {
            icon: <ClearIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.walkthroughAllMyBoardsRemoveBoard)
              : '',
          },
          {
            icon: <InputIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.walkthroughAllMyBoardsAddBoard)
              : '',
          },
          {
            icon: <KeyIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(
                  messages.walkthroughAllMyBoardsUnpublishBoard,
                )
              : '',
          },
          {
            icon: <HomeIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.walkthroughAllMyBoardsPublishBoard)
              : '',
          },
          {
            icon: <DeleteIcon fontSize="small" />,
            label: intl
              ? intl.formatMessage(messages.walkthroughAllMyBoardsDeleteBoard)
              : '',
          },
        ]}
      />
    ),
  },
];
