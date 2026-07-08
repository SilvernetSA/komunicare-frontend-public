import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React from 'react';
import { IntlShape } from 'react-intl';

import { Tile, Board } from '../../../../types/board';
import messages from '../TileEditor.messages';

interface TileFormFieldsProps {
  intl: IntlShape;
  currentTile: Tile;
  currentLabel: string;
  isEditing: boolean;
  boards: Board[];
  linkedBoard: Board | string;
  onLabelChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onVocalizationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ) => void;
  onBoardsChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
}

export const TileFormFields: React.FC<TileFormFieldsProps> = ({
  intl,
  currentTile,
  currentLabel,
  isEditing,
  boards,
  linkedBoard,
  onLabelChange,
  onVocalizationChange,
  onTypeChange,
  onBoardsChange,
}) => {
  const selectBoardElement = (
    <div>
      <FormControl fullWidth>
        <InputLabel id="boards-input-label">
          {intl.formatMessage(messages.existingBoards)}
        </InputLabel>
        <Select
          labelId="boards-select-label"
          id="boards-select"
          autoWidth={true}
          value={linkedBoard}
          onChange={onBoardsChange as any}
        >
          {!isEditing && (
            <MenuItem value="none">
              <em>{intl.formatMessage(messages.none)}</em>
            </MenuItem>
          )}
          {boards.map(
            (board) =>
              !board.hidden && (
                <MenuItem key={board.id} value={board.id}>
                  {board.name}
                </MenuItem>
              ),
          )}
        </Select>
      </FormControl>
    </div>
  );

  return (
    <div className="TileEditor__form-fields">
      <TextField
        id="label"
        label={
          currentTile.type === 'board'
            ? intl.formatMessage(messages.boardName)
            : intl.formatMessage(messages.label)
        }
        value={currentLabel}
        onChange={onLabelChange}
        fullWidth
        required
      />

      <TextField
        multiline
        id="vocalization"
        disabled={currentTile.type === 'board'}
        label={intl.formatMessage(messages.vocalization)}
        value={currentTile.vocalization || ''}
        onChange={onVocalizationChange}
        fullWidth
      />

      {!isEditing && (
        <div className="TileEditor__radiogroup">
          <FormControl fullWidth>
            <FormLabel>{intl.formatMessage(messages.type)}</FormLabel>
            <RadioGroup
              row={true}
              aria-label={intl.formatMessage(messages.type)}
              name="type"
              value={currentTile.type}
              onChange={onTypeChange}
              className="TileEditor__radiogroup__options"
            >
              <FormControlLabel
                value="button"
                control={<Radio />}
                label={intl.formatMessage(messages.button)}
              />
              <FormControlLabel
                className="TileEditor__radiogroup__formcontrollabel"
                value="folder"
                control={<Radio />}
                label={intl.formatMessage(messages.folder)}
              />
              <FormControlLabel
                className="TileEditor__radiogroup__formcontrollabel"
                value="board"
                control={<Radio />}
                label={intl.formatMessage(messages.board)}
              />
            </RadioGroup>
          </FormControl>
        </div>
      )}

      {currentTile.type === 'folder' && selectBoardElement}
    </div>
  );
};
