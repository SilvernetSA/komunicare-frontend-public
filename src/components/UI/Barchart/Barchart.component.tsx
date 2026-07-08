import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';

import './Barchart.css';

interface BarchartDataItem {
  name: string;
  total: number;
}

interface BarchartProps {
  data: BarchartDataItem[];
  title: string;
}

const Barchart: React.FC<BarchartProps> = ({ data, title }) => {
  let max = 0;
  if (data && data[0]) {
    max = data[0].total;
  }

  return (
    <div>
      <Card className="Barchart__Card">
        <div className="Barchart__Card__Title">{title}</div>
        <Grid container direction="column" spacing={3}>
          {data.map((board) => {
            return (
              <Grid
                size={12}
                className="Barchart__Item__Container"
                key={board.name}
              >
                <Typography className="Barchart__Item__Name">
                  {board.name}
                </Typography>
                <div className="Barchart__Bar__Container">
                  <LinearProgress
                    className="Barchart__Bar"
                    variant="determinate"
                    value={Math.ceil((board.total / max) * 100)}
                  />
                  <Typography>{board.total}</Typography>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </div>
  );
};

export default Barchart;
