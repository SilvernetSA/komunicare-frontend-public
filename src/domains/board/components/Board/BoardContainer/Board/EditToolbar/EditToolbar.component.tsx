import AddBoxIcon from '@mui/icons-material/AddBox';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { FormControlLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { MdContentPaste } from 'react-icons/md';
import { useIntl } from 'react-intl';

import messages from './EditToolbar.messages';
import { Board } from '@/types/board';
import { getBoardDisplayTitle } from '@/utils/getBoardDisplayTitle';
import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';
import SelectedCounter from '@/domains/shared/components/UI/SelectedCounter/SelectedCounter.component';

import './EditToolbar.css';

interface EditToolbarProps {
  className?: string;
  classes?: object;
  isSelectAll?: boolean;
  isFixedBoard?: boolean;
  isSelecting?: boolean;
  isSaving?: boolean;
  isLoggedIn?: boolean;
  selectedItemsCount: number;
  onSelectClick?: () => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onSelectAllToggle?: () => void;
  onBoardTitleClick?: () => void;
  onSaveBoardClick?: () => void;
  board: Board;
  onAddClick?: () => void;
  onBoardTypeChange?: () => void;
  onCopyTiles?: () => void;
  onPasteTiles?: () => void;
  copiedTiles?: unknown[];
}

const EditToolbar: React.FC<EditToolbarProps> = ({
  board,
  className,
  classes: _classes,
  isSelectAll = false,
  isSelecting = false,
  isFixedBoard = false,
  isSaving = false,
  isLoggedIn = false,
  selectedItemsCount,
  onSelectClick,
  onDeleteClick,
  onEditClick,
  onSelectAllToggle,
  onBoardTitleClick,
  onSaveBoardClick: _onSaveBoardClick,
  onAddClick,
  onBoardTypeChange,
  onCopyTiles,
  onPasteTiles,
  copiedTiles = [],
}) => {
  const intl = useIntl();
  const isItemsSelected = !!selectedItemsCount;
  const isFixed = !!isFixedBoard;
  const boardTitle = getBoardDisplayTitle(board, intl as any);

  return (
    <div
      className={classNames('EditToolbar', className, {
        'EditToolbar--selecting': isSelecting,
      })}
    >
      {(isSaving || !isLoggedIn) && (
        <span className="EditToolbar__BoardTitle">{boardTitle}</span>
      )}
      {!isSaving && isLoggedIn && (
        <Button
          className={classNames('EditToolbar__BoardTitle', {
            'logged-in': isLoggedIn,
          })}
          onClick={onBoardTitleClick}
        >
          {boardTitle}
        </Button>
      )}
      <div className="EditToolbar__group EditToolbar__group--start">
        <Button
          id="edit-board-tiles"
          aria-label="edit-board-tiles"
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

        {isSelecting && (
          <Fragment>
            <FormControlLabel
              control={
                <Switch
                  checked={isFixed}
                  onChange={onBoardTypeChange}
                  name="switchFixedBoard"
                  color="secondary"
                />
              }
              label={intl.formatMessage(messages.fixedBoard)}
            />
          </Fragment>
        )}

        {isSaving && (
          <CircularProgress
            size={24}
            className="EditToolbar__Spinner"
            thickness={7}
          />
        )}
      </div>
      <div className="EditToolbar__group EditToolbar__group--end">
        {isSelecting && (
          <Fragment>
            <Checkbox checked={isSelectAll} onChange={onSelectAllToggle} />
            <SelectedCounter count={selectedItemsCount} />

            <IconButton
              label={intl.formatMessage(messages.deleteTiles)}
              disabled={!isItemsSelected}
              onClick={onDeleteClick}
              size="large"
            >
              <DeleteIcon />
            </IconButton>
            <PremiumFeature>
              <IconButton
                label={intl.formatMessage(messages.copyTiles)}
                disabled={!isItemsSelected}
                onClick={onCopyTiles}
                size="large"
              >
                <MdContentCopy />
              </IconButton>
              <IconButton
                label={intl.formatMessage(messages.pasteTiles)}
                disabled={!copiedTiles.length}
                onClick={onPasteTiles}
                size="large"
              >
                <MdContentPaste />
              </IconButton>
            </PremiumFeature>
            <IconButton
              label={intl.formatMessage(messages.editTiles)}
              disabled={!isItemsSelected}
              onClick={onEditClick}
              size="large"
            >
              <EditIcon />
            </IconButton>
          </Fragment>
        )}
        {!isSelecting && (
          <div className={'add__board__tile'}>
            <IconButton
              label={intl.formatMessage(messages.addTileButton)}
              onClick={onAddClick}
              disabled={isSaving}
              size="large"
            >
              <AddBoxIcon />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditToolbar;
