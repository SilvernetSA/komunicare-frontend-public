import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Button from '@mui/material/Button';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '../../EditToolbar.messages';

interface EditTilesButtonProps {
  isSelecting: boolean;
  isSaving: boolean;
  onSelectClick?: () => void;
  intl: IntlShape;
}

export const EditTilesButton: React.FC<EditTilesButtonProps> = ({
  isSelecting,
  isSaving,
  onSelectClick,
  intl,
}) => (
  <Button
    id="edit-board-tiles"
    aria-label="edit-board-tiles"
    data-tour-id="toolbar-organize-pictograms"
    onClick={onSelectClick}
    disabled={isSaving}
    className={'edit__board__ride'}
  >
    {isSelecting ? (
      <DashboardOutlinedIcon className="EditToolbar__group EditToolbar__group--start--button" />
    ) : (
      <DashboardIcon className="EditToolbar__group EditToolbar__group--start--button" />
    )}
    {!isSelecting ? intl.formatMessage(messages.editTilesButton) : ''}
  </Button>
);
