import { Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import React from 'react';
import { IntlShape } from 'react-intl';

import Barchart from '../../UI/Barchart/Barchart.component';
import DoughnutChart from '../../UI/Doughnut/Doughnut.component';
import StatCards from '../../UI/StatCards/StatCards.component';
import StatCards2 from '../../UI/StatCards2/StatCards2.component';
import TableCard from '../../UI/TableCard/TableCard.component';
import messages from '../Analytics.messages';

interface RawTotals {
  boards: { rows: unknown[] };
  words: { rows: unknown[] };
  phrases: { rows: unknown[] };
  editions: { rows: unknown[] };
}

interface StatData {
  title: string;
  total: number;
}

interface StatCardsData {
  words: StatData;
  phrases: StatData;
  boards: StatData;
  editions: StatData;
}

interface TopUsed {
  symbols: unknown[];
  boards: unknown[];
}

interface AnalyticsMetricsProps {
  intl?: IntlShape;
  totals: RawTotals;
  categoryTotals: Record<string, unknown>;
  topUsed: TopUsed;
  symbolSources: unknown[];
  theme?: Theme;
  onDetailsClick: (type: string) => () => void;
}

const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({
  intl,
  totals,
  categoryTotals,
  topUsed,
  symbolSources,
  theme,
  onDetailsClick,
}) => {
  const tablesHead = [
    intl ? intl.formatMessage(messages.name) : 'Name',
    intl ? intl.formatMessage(messages.timesClicked) : 'Times Clicked',
    intl ? intl.formatMessage(messages.action) : 'Action',
  ];

  // Transform totals data for StatCards
  const statCardsData: StatCardsData = {
    words: { title: 'Words', total: totals.words.rows?.length || 0 },
    phrases: { title: 'Phrases', total: totals.phrases.rows?.length || 0 },
    boards: { title: 'Boards', total: totals.boards.rows?.length || 0 },
    editions: { title: 'Editions', total: totals.editions.rows?.length || 0 },
  };

  return (
    <div className="Analytics__Metrics">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
          <StatCards onDetailsClick={onDetailsClick} data={statCardsData} />
          <TableCard
            data={topUsed.symbols as Record<string, unknown>[]}
            tableHead={tablesHead as any}
            title={
              intl
                ? intl.formatMessage(messages.topUsedButtons)
                : 'Top Used Buttons'
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
          <DoughnutChart
            data={symbolSources as any}
            title={
              intl
                ? intl.formatMessage(messages.symbolSources)
                : 'Symbol Sources'
            }
            height="300px"
            color={[
              theme?.palette?.primary?.dark || '#1976d2',
              theme?.palette?.primary?.main || '#2196f3',
              theme?.palette?.primary?.light || '#64b5f6',
            ]}
          />
          <StatCards2 categoryTotals={categoryTotals as any} />
          <Barchart
            data={topUsed.boards as any}
            title={
              intl
                ? intl.formatMessage(messages.mostUsedBoards)
                : 'Most Used Boards'
            }
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default AnalyticsMetrics;
