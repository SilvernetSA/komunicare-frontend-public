import { Grid, SelectChangeEvent } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '../Analytics.messages';

interface AnalyticsHeaderProps {
  intl?: IntlShape;
  days: number;
  isFetching: boolean;
  onDaysChange: (days: number) => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  intl,
  days,
  isFetching,
  onDaysChange,
}) => {
  return (
    <Grid container direction="row" className="Analytics__Graph__Select">
      <Grid className="Analytics__Graph__Select__Item">
        <FormControl variant="outlined">
          <Select
            sx={{ color: 'white', padding: '0px' }}
            labelId="range-select-label"
            id="range-select"
            autoWidth={false}
            onChange={(event: SelectChangeEvent<number>) =>
              onDaysChange(event.target.value as number)
            }
            value={days}
          >
            <MenuItem value={10}>
              {intl ? intl.formatMessage(messages.tenDaysUsage) : '10 Days'}
            </MenuItem>
            <MenuItem value={20}>
              {intl ? intl.formatMessage(messages.twentyDaysUsage) : '20 Days'}
            </MenuItem>
            <MenuItem value={30}>
              {intl ? intl.formatMessage(messages.thirtyDaysUsage) : '30 Days'}
            </MenuItem>
            <MenuItem value={60}>
              {intl ? intl.formatMessage(messages.sixtyDaysUsage) : '60 Days'}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid className="Analytics__Graph__Select__Item">
        {isFetching && (
          <CircularProgress
            size={30}
            thickness={4}
            sx={{ color: 'white', padding: '0px' }}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default AnalyticsHeader;
