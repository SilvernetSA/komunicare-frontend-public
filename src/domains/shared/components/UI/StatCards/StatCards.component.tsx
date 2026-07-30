import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import EditIcon from '@mui/icons-material/Edit';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SpellCheckIcon from '@mui/icons-material/Spellcheck';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Grid, Card, IconButton, Tooltip } from '@mui/material';
import React from 'react';

import './StatCards.css';

interface StatData {
  title: string;
  total: number;
}

interface Data {
  words: StatData;
  phrases: StatData;
  boards: StatData;
  editions: StatData;
}

interface StatCardsProps {
  onDetailsClick: (type: string) => () => void;
  data: Data;
}

const StatCards: React.FC<StatCardsProps> = ({ data, onDetailsClick }) => (
  <div className="StatCards">
    <Grid container spacing={3} className="StatCards__Container">
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className="StatCards__Card" elevation={3}>
          <div className="StatCards__Card__Items">
            <SpellCheckIcon
              sx={{ fontSize: '44px', opacity: 0.6, color: 'primary.main' }}
            />
            <div className="StatCards__Card__Items__Text">
              <small className="StatCards__Card__Items__Text__Label">
                {data.words.title}
              </small>
              <h6 className="StatCards__Card__Items__Text__Value">
                {data.words.total}
              </h6>
            </div>
          </div>
          <Tooltip title="View Details" placement="top">
            <IconButton onClick={onDetailsClick('words')} size="large">
              <ArrowRightAltIcon />
            </IconButton>
          </Tooltip>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className="StatCards__Card" elevation={3}>
          <div className="StatCards__Card__Items">
            <RecordVoiceOverIcon
              sx={{ fontSize: '44px', opacity: 0.6, color: 'primary.main' }}
            />
            <div className="StatCards__Card__Items__Text">
              <small className="StatCards__Card__Items__Text__Label">
                {data.phrases.title}
              </small>
              <h6 className="StatCards__Card__Items__Text__Value">
                {data.phrases.total}
              </h6>
            </div>
          </div>
          <Tooltip title="View Details" placement="top">
            <IconButton onClick={onDetailsClick('phrases')} size="large">
              <ArrowRightAltIcon />
            </IconButton>
          </Tooltip>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className="StatCards__Card" elevation={3}>
          <div className="StatCards__Card__Items">
            <ViewModuleIcon
              sx={{ fontSize: '44px', opacity: 0.6, color: 'primary.main' }}
            />
            <div className="StatCards__Card__Items__Text">
              <small className="StatCards__Card__Items__Text__Label">
                {data.boards.title}
              </small>
              <h6 className="StatCards__Card__Items__Text__Value">
                {data.boards.total}
              </h6>
            </div>
          </div>
          <Tooltip title="View Details" placement="top">
            <IconButton onClick={onDetailsClick('boards')} size="large">
              <ArrowRightAltIcon />
            </IconButton>
          </Tooltip>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className="StatCards__Card" elevation={3}>
          <div className="StatCards__Card__Items">
            <EditIcon
              sx={{ fontSize: '44px', opacity: 0.6, color: 'primary.main' }}
            />
            <div className="StatCards__Card__Items__Text">
              <small className="StatCards__Card__Items__Text__Label">
                {data.editions.title}
              </small>
              <h6 className="StatCards__Card__Items__Text__Value">
                {data.editions.total}
              </h6>
            </div>
          </div>
          <Tooltip title="View Details" placement="top">
            <IconButton onClick={onDetailsClick('editions')} size="large">
              <ArrowRightAltIcon />
            </IconButton>
          </Tooltip>
        </Card>
      </Grid>
    </Grid>
  </div>
);

export default StatCards;
