import { IntlShape } from 'react-intl';

interface UsageData {
  max: number;
  min: number;
  data: number[];
}

interface TotalItem {
  title: string;
  total?: number;
  rows?: unknown[];
  [key: string]: unknown;
}

interface Totals {
  words: TotalItem;
  phrases: TotalItem;
  boards: TotalItem;
  editions: TotalItem;
}

interface CategoryTotal {
  value: number;
  title: string;
  [key: string]: unknown;
}

interface CategoryTotals {
  navigation: CategoryTotal;
  speech: CategoryTotal;
  edit: CategoryTotal;
}

interface TopUsed {
  symbols: unknown[];
  boards: unknown[];
}

export interface AnalyticsState {
  days: number;
  isFetching: boolean;
  usage: UsageData;
  totals: Totals;
  categoryTotals: CategoryTotals;
  topUsed: TopUsed;
}

export const createInitialState = (intl: IntlShape): AnalyticsState => ({
  days: 30,
  isFetching: false,
  usage: {
    max: 100,
    min: 0,
    data: Array.from(Array(30), () => 0),
  },
  totals: {
    words: {
      title: intl.formatMessage({
        id: 'analytics.totalWords',
        defaultMessage: 'Total Words',
      }),
    },
    phrases: {
      title: intl.formatMessage({
        id: 'analytics.totalPhrases',
        defaultMessage: 'Total Phrases',
      }),
    },
    boards: {
      title: intl.formatMessage({
        id: 'analytics.boardsUsed',
        defaultMessage: 'Boards Used',
      }),
    },
    editions: {
      title: intl.formatMessage({
        id: 'analytics.tilesEdited',
        defaultMessage: 'Tiles Edited',
      }),
    },
  },
  categoryTotals: {
    navigation: {
      value: 0,
      title: intl.formatMessage({
        id: 'analytics.navigationEvents',
        defaultMessage: 'Navigation Events',
      }),
    },
    speech: {
      value: 0,
      title: intl.formatMessage({
        id: 'analytics.speechEvents',
        defaultMessage: 'Speech Events',
      }),
    },
    edit: {
      value: 0,
      title: intl.formatMessage({
        id: 'analytics.editingEvents',
        defaultMessage: 'Editing Events',
      }),
    },
  },
  topUsed: { symbols: [], boards: [] },
});

export const getTopUsed = (totals: Totals): TopUsed => ({
  symbols: totals['words']['rows'] || [],
  boards: totals['boards']['rows'] || [],
});
