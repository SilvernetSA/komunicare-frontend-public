import AddBoxIcon from '@mui/icons-material/AddBox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import messages from '../../EditToolbar.messages';

interface AddTileButtonProps {
  isSelecting: boolean;
  isSaving: boolean;
  onAddClick?: () => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

export const AddTileButton: React.FC<AddTileButtonProps> = ({
  isSelecting,
  isSaving,
  onAddClick,
  intl,
}) => {
  if (isSelecting) return null;

  const label = intl.formatMessage(messages.addTileButton);

  const button = (
    <IconButton
      aria-label={label}
      color="inherit"
      data-tour-id="toolbar-add-content"
      disabled={isSaving}
      onClick={onAddClick}
      size="large"
      style={isSaving ? { color: 'rgba(0, 0, 0, 0.26)' } : undefined}
    >
      <AddBoxIcon />
    </IconButton>
  );

  return (
    <div className={'add__board__tile'}>
      {isSaving ? (
        button
      ) : (
        <Tooltip placement="bottom" title={label}>
          {button}
        </Tooltip>
      )}
    </div>
  );
};
