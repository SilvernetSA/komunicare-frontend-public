import React from 'react';
import { Grid, Card, Fab } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import EditIcon from '@mui/icons-material/Edit';
import './StatCards2.css';

interface CategoryTotal {
  title: string;
  value: number;
}

interface CategoryTotals {
  navigation: CategoryTotal;
  speech: CategoryTotal;
  edit: CategoryTotal;
}

interface StatCards2Props {
  categoryTotals: CategoryTotals;
}

const StatCards2: React.FC<StatCards2Props> = ({ categoryTotals }) => {
  return (
    <Grid
      container
      spacing={2}
      direction="column"
      className="StatCards2__Container"
    >
      <Grid size={12}>
        <Card elevation={3} className="StatCards2__Card">
          <div className="StatCards2__Card__Items">
            <Fab size="medium" color="primary">
              <NavigationIcon />
            </Fab>
            <h4 className="StatCards2__Card__Items__text">
              {categoryTotals.navigation.title}
            </h4>
          </div>
          <h1 className="StatCards2__Card__Value">
            {categoryTotals.navigation.value}
          </h1>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card elevation={3} className="StatCards2__Card">
          <div className="StatCards2__Card__Items">
            <Fab size="medium" color="primary">
              <RecordVoiceOverIcon />
            </Fab>
            <h4 className="StatCards2__Card__Items__text">
              {categoryTotals.speech.title}
            </h4>
          </div>
          <h1 className="StatCards2__Card__Value">
            {categoryTotals.speech.value}
          </h1>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card elevation={3} className="StatCards2__Card">
          <div className="StatCards2__Card__Items">
            <Fab size="medium" color="primary">
              <EditIcon />
            </Fab>
            <h4 className="StatCards2__Card__Items__text">
              {categoryTotals.edit.title}
            </h4>
          </div>
          <h1 className="StatCards2__Card__Value">
            {categoryTotals.edit.value}
          </h1>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatCards2;
