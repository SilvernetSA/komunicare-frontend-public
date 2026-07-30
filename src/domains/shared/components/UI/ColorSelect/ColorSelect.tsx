import CloseIcon from '@mui/icons-material/Close';
import { InputLabel, Select, SelectChangeEvent } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React, { useState } from 'react';

import IconButton from '../IconButton/IconButton';
import Circle from './Circle/Circle';
import messages from './ColorSelect.messages';

interface ColorScheme {
  name: string;
  colors: string[];
}

interface ColorSelectProps {
  onChange: (event?: React.ChangeEvent<HTMLInputElement>) => void;
  selectedColor: string;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

const colorSchemes: ColorScheme[] = [
  {
    name: 'Fitzgerald',
    colors: [
      '#2196F3',
      '#4CAF50',
      '#fff176',
      '#ff6600',
      '#ffffff',
      '#ffc0cb',
      '#800080',
      '#a52a2a',
      '#ff0000',
      '#808080',
    ],
  },
  {
    name: 'Goossens',
    colors: ['#ffc0cb', '#2196F3', '#4CAF50', '#fff176', '#ff6600'],
  },
];

const ColorSelect: React.FC<ColorSelectProps> = ({
  intl,
  onChange,
  selectedColor,
}) => {
  const [colorMenuIndex, setColorMenuIndex] = useState<number>(0);
  const colorMenu = colorSchemes[colorMenuIndex];

  const colorLabel = intl.formatMessage(messages.color);
  const radioGroupStyle = { flexDirection: 'row' as const };
  const radioItemStyle = { padding: '2px' };

  return (
    <FormControl className="ColorSelect">
      <div>
        <FormControl fullWidth id="color-scheme-menu">
          <InputLabel id="color-scheme-menu-label">
            {intl.formatMessage(messages.colorScheme)}
          </InputLabel>
          <Select
            id="color-scheme"
            labelId="color-scheme-menu-label"
            value={colorMenuIndex.toString()}
            onChange={(event: SelectChangeEvent<string>) =>
              setColorMenuIndex(Number(event.target.value))
            }
          >
            <MenuItem value="0">{colorSchemes[0].name}</MenuItem>
            <MenuItem value="1">{colorSchemes[1].name}</MenuItem>
          </Select>
        </FormControl>
      </div>
      <RadioGroup
        aria-label={colorLabel}
        name="color"
        value={selectedColor}
        style={radioGroupStyle}
        onChange={onChange}
      >
        {colorMenu.colors.map((color) => (
          <Radio
            key={color}
            value={color}
            style={radioItemStyle}
            icon={<Circle fill={color} />}
            checkedIcon={<Circle fill={color} />}
          />
        ))}
        {selectedColor && (
          <IconButton
            label={intl.formatMessage(messages.clearSelection)}
            onClick={() => {
              onChange();
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        )}
      </RadioGroup>
    </FormControl>
  );
};

export default ColorSelect;
