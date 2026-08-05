import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import React from 'react';

import './EditGridButtons.css';

interface EditGridButtonsProps {
  active: boolean;
  rows: number;
  columns: number;
  onAddRemoveColumn?: (action: string) => void;
  onAddRemoveRow?: (action: string) => void;
  moveColsButtonToLeft?: boolean;
}

const EditGridButtons: React.FC<EditGridButtonsProps> = ({
  active,
  rows,
  columns,
  onAddRemoveColumn,
  onAddRemoveRow,
  moveColsButtonToLeft = false,
}) => {
  const handleAddRemoveColumn = (isAdd: boolean) => {
    onAddRemoveColumn?.(isAdd ? 'add' : 'remove');
  };

  const handleAddRemoveRow = (isAdd: boolean) => {
    onAddRemoveRow?.(isAdd ? 'add' : 'remove');
  };

  const renderButtons = (isVertical: boolean) => (
    <ButtonGroup
      orientation={isVertical ? 'vertical' : 'horizontal'}
      color="primary"
      aria-label="edit_grid_button_group"
      fullWidth={true}
      size="large"
      variant="contained"
    >
      {/* Stepper convention: up/right arrows increment, down/left decrement. */}
      <Button
        onClick={() =>
          isVertical ? handleAddRemoveColumn(true) : handleAddRemoveRow(false)
        }
        aria-label={isVertical ? 'add_column' : 'remove_row'}
      >
        {isVertical ? <KeyboardArrowRightIcon /> : <KeyboardArrowDownIcon />}
      </Button>
      <Button aria-label="edit_grid_value">
        {isVertical ? columns.toString() : rows.toString()}
      </Button>
      <Button
        onClick={() =>
          isVertical ? handleAddRemoveColumn(false) : handleAddRemoveRow(true)
        }
        aria-label={isVertical ? 'remove_column' : 'add_row'}
      >
        {isVertical ? <KeyboardArrowLeftIcon /> : <KeyboardArrowUpIcon />}
      </Button>
    </ButtonGroup>
  );

  if (!active) {
    return null;
  }

  return (
    <>
      <div
        className={`EditGridButtons ${moveColsButtonToLeft ? 'left' : 'right'}`}
      >
        {renderButtons(true)}
      </div>
      <div className="EditGridButtons bottom">{renderButtons(false)}</div>
    </>
  );
};

export default EditGridButtons;
