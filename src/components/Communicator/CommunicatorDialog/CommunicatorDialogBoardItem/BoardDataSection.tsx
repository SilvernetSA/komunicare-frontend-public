import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import KeyIcon from '@mui/icons-material/VpnKey';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import moment from 'moment';
import React from 'react';

import { Board } from '../../../../types/board';
import { Communicator } from '../../../../types/communicator';
import IconButton from '../../../UI/IconButton/IconButton';
import { TAB_INDEXES } from '../CommunicatorDialog.constants';

interface BoardDataSectionProps {
  title: string;
  board: Board;
  selectedTab: number;
  intl?: {
    formatMessage: (
      message: { id: string; defaultMessage: string },
      values?: Record<string, unknown>,
    ) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  communicator: Communicator;
  activeBoardId: string;
  onEditTitleClick: () => void;
}

const BoardDataSection: React.FC<BoardDataSectionProps> = ({
  title,
  board,
  selectedTab,
  intl,
  messages,
  communicator,
  activeBoardId,
  onEditTitleClick,
}) => {
  return (
    <div className="CommunicatorDialog__boards__item__data">
      <div className="CommunicatorDialog__boards__item__data__title">
        <ListItem disableGutters={true}>
          <ListItemText
            primary={
              <div>
                {title}
                {selectedTab === TAB_INDEXES.MY_BOARDS && (
                  <div className="CommunicatorDialog__boards__item__edit-title">
                    <IconButton
                      aria-label="edit-title"
                      onClick={onEditTitleClick}
                      label={
                        intl
                          ? intl.formatMessage(messages.editBoardTitle)
                          : 'Edit Title'
                      }
                      size="large"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </div>
            }
            secondary={
              intl
                ? intl.formatMessage(messages.tilesQty, {
                    qty: board.tiles.length,
                  })
                : `${board.tiles.length} tiles`
            }
          />
        </ListItem>
      </div>
      <div className="CommunicatorDialog__boards__item__data__author">
        {intl
          ? intl.formatMessage(messages.author, { author: board.author })
          : `Author: ${board.author}`}
      </div>
      <div className="CommunicatorDialog__boards__item__data__date">
        {moment(board.lastEdited).format('DD/MM/YYYY')}
      </div>
      <div className="CommunicatorDialog__boards__item__data__extra">
        {board.isPublic && (
          <Tooltip
            title={
              intl ? intl.formatMessage(messages.publicBoard) : 'Public Board'
            }
          >
            <PublicIcon />
          </Tooltip>
        )}
        {!board.isPublic && (
          <Tooltip
            title={
              intl ? intl.formatMessage(messages.privateBoard) : 'Private Board'
            }
          >
            <KeyIcon />
          </Tooltip>
        )}
        {communicator.rootBoard === board.id && (
          <Tooltip
            title={intl ? intl.formatMessage(messages.rootBoard) : 'Root Board'}
          >
            <HomeIcon />
          </Tooltip>
        )}
        {activeBoardId === board.id && (
          <Tooltip
            title={
              intl ? intl.formatMessage(messages.activeBoard) : 'Active Board'
            }
          >
            <RemoveRedEyeIcon />
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default BoardDataSection;
