import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { Fragment } from 'react';
import { MdContentCopy, MdContentPaste } from 'react-icons/md';

import messages from '../../EditToolbar.messages';

import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';

interface SelectionActionsProps {
  isSelecting: boolean;
  isSelectAll: boolean;
  isItemsSelected: boolean;
  selectedItemsCount: number;
  copiedTiles: unknown[];
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onSelectAllToggle?: () => void;
  onCopyTiles?: () => void;
  onPasteTiles?: () => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

export const SelectionActions: React.FC<SelectionActionsProps> = ({
  isSelecting,
  isSelectAll,
  isItemsSelected,
  selectedItemsCount,
  copiedTiles,
  onDeleteClick,
  onEditClick,
  onSelectAllToggle,
  onCopyTiles,
  onPasteTiles,
  intl,
}) => {
  if (!isSelecting) return null;

  const selectedItemsLabel = intl.formatMessage({
    id: 'komunicare.components.SelectedCounter.items',
    defaultMessage: 'items',
  });

  const renderActionButton = ({
    icon,
    label,
    disabled,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    disabled: boolean;
    onClick?: () => void;
  }) => {
    const button = (
      <IconButton
        aria-label={label}
        color="inherit"
        disabled={disabled}
        onClick={onClick}
        size="large"
        style={disabled ? { color: 'rgba(0, 0, 0, 0.26)' } : undefined}
      >
        {icon}
      </IconButton>
    );

    return disabled ? (
      button
    ) : (
      <Tooltip placement="bottom" title={label}>
        {button}
      </Tooltip>
    );
  };

  return (
    <Fragment>
      <Checkbox checked={isSelectAll} onChange={onSelectAllToggle} />
      <div className="SelectedCounter">
        <span>
          {selectedItemsCount} {selectedItemsLabel}
        </span>
      </div>
      {renderActionButton({
        icon: <DeleteIcon />,
        label: intl.formatMessage(messages.deleteTiles),
        disabled: !isItemsSelected,
        onClick: onDeleteClick,
      })}
      <PremiumFeature>
        {renderActionButton({
          icon: <MdContentCopy />,
          label: intl.formatMessage(messages.copyTiles),
          disabled: !isItemsSelected,
          onClick: onCopyTiles,
        })}
        {renderActionButton({
          icon: <MdContentPaste />,
          label: intl.formatMessage(messages.pasteTiles),
          disabled: !copiedTiles.length,
          onClick: onPasteTiles,
        })}
      </PremiumFeature>
      {renderActionButton({
        icon: <EditIcon />,
        label: intl.formatMessage(messages.editTiles),
        disabled: !isItemsSelected,
        onClick: onEditClick,
      })}
    </Fragment>
  );
};
