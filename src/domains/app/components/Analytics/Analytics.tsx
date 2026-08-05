import { useTheme } from '@mui/material/styles';
import isEmpty from 'lodash/isEmpty';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Fragment,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import messages from './Analytics.messages';
import AnalyticsChart from './components/AnalyticsChart';
import AnalyticsHeader from './components/AnalyticsHeader';
import AnalyticsMetrics from './components/AnalyticsMetrics';
import DetailsDialog from './components/DetailsDialog';
import {
  createAnalyticsService,
  AnalyticsService,
} from './container/AnalyticsDataService';
import {
  createInitialState,
  getTopUsed,
  AnalyticsState,
} from './container/AnalyticsStateManager';
import { useAnalyticsStore } from '@/domains/app/stores/analyticsStore';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';
import { UserData } from '@/types/app';
import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';
import { initializeClientId } from './container/service/GoogleAnalyticsClient';
import { getSymbolSources } from './container/SymbolSourcesHelper';
import FullScreenDialog from '@/domains/app/components/FullScreenDialog/FullScreenDialog';

import type {
  AnalyticsTotals,
  CategoryTotals as AnalyticsCategoryTotals,
} from '@/domains/app/stores/analyticsStore';

import './Analytics.css';

interface User extends UserData {
  [key: string]: unknown;
}

const Analytics: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const theme = useTheme();

  // ─── Store ────────────────────────────────────────────────────────────────
  const user = useAppStore((state) => state.userData as User);
  const isLoggedIn = !isEmpty(user);
  const boards = useBoardsStore((state) => state.boards);
  const analyticsStore = useAnalyticsStore();

  // ─── Local state ──────────────────────────────────────────────────────────
  const [state, setState] = useState<AnalyticsState>(() =>
    createInitialState(intl),
  );
  const stateRef = useRef(state);
  const [dataService] = useState<AnalyticsService>(() =>
    createAnalyticsService(),
  );
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsData, setDetailsData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Analytics data loading ───────────────────────────────────────────────
  const loadAnalyticsData = useCallback(
    async (
      days: number,
      currentTotals: AnalyticsState['totals'],
      currentCategoryTotals: AnalyticsState['categoryTotals'],
    ) => {
      const errorMessage = intl.formatMessage(messages.loadingError);
      let totals: AnalyticsTotals;
      let usage: AnalyticsState['usage'];
      let categoryTotals: AnalyticsCategoryTotals;

      try {
        totals = await analyticsStore.fetchAnalyticsTotals({
          gaClient: dataService.gaClient,
          days,
          currentTotals: currentTotals as any,
        });
        usage = await analyticsStore.fetchAnalyticsUsage({
          gaClient: dataService.gaClient,
          days,
        });
        categoryTotals = await analyticsStore.fetchAnalyticsCategoryTotals({
          gaClient: dataService.gaClient,
          days,
          currentCategoryTotals: currentCategoryTotals as any,
        });
      } catch {
        throw new Error(errorMessage);
      }

      const topUsed = getTopUsed(totals as any);

      return { totals, usage, categoryTotals, topUsed };
    },
    [analyticsStore, dataService, intl],
  );

  useEffect(() => {
    const loadAnalytics = async () => {
      setState((prev) => ({ ...prev, isFetching: true }));
      try {
        await initializeClientId(dataService.gaClient);
        const { totals, usage, categoryTotals, topUsed } =
          await loadAnalyticsData(
            stateRef.current.days,
            stateRef.current.totals,
            stateRef.current.categoryTotals,
          );

        setState((prev) => ({
          ...prev,
          totals: totals as any,
          categoryTotals: categoryTotals as any,
          usage: usage as any,
          topUsed,
          isFetching: false,
        }));
      } catch (err) {
        setState((prev) => ({ ...prev, isFetching: false }));
        useNotificationStore
          .getState()
          .showNotification(intl.formatMessage(messages.loadingError));
        console.error(err instanceof Error ? err.message : err);
      }
    };

    loadAnalytics();
  }, [dataService, intl, loadAnalyticsData]);

  const getSymbolSourcesData = useCallback(() => {
    return getSymbolSources(boards);
  }, [boards]);

  const onDaysChange = useCallback(
    async (days: number) => {
      setState((prev) => ({ ...prev, isFetching: true }));
      try {
        const { totals, usage, categoryTotals, topUsed } =
          await loadAnalyticsData(
            days,
            stateRef.current.totals,
            stateRef.current.categoryTotals,
          );

        setState((prev) => ({
          ...prev,
          days,
          totals: totals as any,
          categoryTotals: categoryTotals as any,
          usage: usage as any,
          topUsed,
          isFetching: false,
        }));
      } catch (err) {
        setState((prev) => ({ ...prev, isFetching: false }));
        useNotificationStore
          .getState()
          .showNotification(intl.formatMessage(messages.loadingError));
        console.error(err instanceof Error ? err.message : err);
      }
    },
    [intl, loadAnalyticsData],
  );

  // ─── Details dialog ───────────────────────────────────────────────────────
  const handleDetailsDialogOpen = (name: string) => () => {
    const totals = state.totals as any;
    switch (name) {
      case 'boards':
        setDetailsData(
          (totals?.boards?.rows ?? []) as Record<string, unknown>[],
        );
        break;
      case 'words':
        setDetailsData(
          (totals?.words?.rows ?? []) as Record<string, unknown>[],
        );
        break;
      case 'phrases':
        setDetailsData(
          (totals?.phrases?.rows ?? []) as Record<string, unknown>[],
        );
        break;
      case 'editions':
        setDetailsData(
          (totals?.editions?.rows ?? []) as Record<string, unknown>[],
        );
        break;
      default:
        setDetailsData([]);
        break;
    }
    setOpenDetailsDialog(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <PremiumFeature>
      <FullScreenDialog
        className="Analytics"
        open
        title={<FormattedMessage {...messages.analytics} />}
        onClose={() => navigate('/', { replace: true })}
        fullWidth={true}
      >
        <Fragment>
          <div className="Analytics__Graph">
            <AnalyticsHeader
              intl={intl}
              days={state.days}
              isFetching={state.isFetching}
              onDaysChange={onDaysChange}
            />
            <AnalyticsChart usage={state.usage} days={state.days} />
          </div>

          <AnalyticsMetrics
            intl={intl}
            totals={state.totals as any}
            categoryTotals={state.categoryTotals as any}
            topUsed={state.topUsed}
            symbolSources={getSymbolSourcesData()}
            theme={theme}
            onDetailsClick={handleDetailsDialogOpen}
          />

          <DetailsDialog
            intl={intl}
            open={openDetailsDialog}
            detailsData={detailsData}
            onClose={() => setOpenDetailsDialog(false)}
          />
        </Fragment>
      </FullScreenDialog>
    </PremiumFeature>
  );
};

export default Analytics;
