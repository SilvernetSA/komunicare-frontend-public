import { FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import React, { Fragment } from 'react';
import { IntlShape } from 'react-intl';

import messages from '../../EditToolbar.messages';

interface FixedBoardToggleProps {
  isSelecting: boolean;
  isFixed: boolean;
  onBoardTypeChange?: () => void;
  intl: IntlShape;
}

export const FixedBoardToggle: React.FC<FixedBoardToggleProps> = ({
  isSelecting,
  isFixed,
  onBoardTypeChange,
  intl,
}) => {
  if (!isSelecting) return null;

  return (
    <Fragment>
      <FormControlLabel
        control={
          <Switch
            checked={isFixed}
            onChange={onBoardTypeChange}
            name="switchFixedBoard"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#0d47a1',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#0d47a1',
              },
            }}
          />
        }
        label={intl.formatMessage(messages.fixedBoard)}
      />
    </Fragment>
  );
};
