import React, { useCallback, useEffect, useRef } from 'react';

import { useAppStore } from '../../store/appStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
}) => {
  const userData = useAppStore((state) => state.userData);
  const userIsLogged = !!(userData as any)?.email;
  const prevIsLoggedRef = useRef<boolean>();
  const lastFetchRef = useRef<number>(0);

  const fetchSubscriptionStatus = useCallback(
    async (
      fallbackMessage: string,
      requestOrigin: string,
      options: { force?: boolean } = {},
    ): Promise<boolean> => {
      try {
        const now = Date.now();
        const elapsed = now - lastFetchRef.current;
        if (!options.force && elapsed < 1000) {
          return Boolean(useSubscriptionStore.getState().isSubscribed);
        }

        lastFetchRef.current = now;
        return await useSubscriptionStore
          .getState()
          .updateIsSubscribed(requestOrigin, options);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : fallbackMessage;
        throw new Error(message);
      }
    },
    [],
  );

  useEffect(() => {
    const errorMessage = 'Failed to refresh subscription status';
    const initializeSubscription = async () => {
      try {
        // Skip subscription check for backoffice users
        const ud = useAppStore.getState().userData as any;
        if (ud?.isByBackOffice) {
          useSubscriptionStore.getState().updateSubscription({
            status: 'active',
            isSubscribed: true,
            tryPeriode: false,
            isOnTrialPeriod: false,
            premiumRequiredModalState: {
              open: false,
              showTryPeriodFinishedMessages: false,
            },
          } as any);
          return;
        }
        await fetchSubscriptionStatus(
          errorMessage,
          'SubscriptionProvider:initialize',
        );
      } catch (statusError) {
        const message =
          statusError instanceof Error
            ? statusError.message
            : String(statusError);
        console.error(message);
      }
    };

    const onFocus = async () => {
      try {
        const ud = useAppStore.getState().userData as any;
        if (ud?.isByBackOffice) return;
        await fetchSubscriptionStatus(
          errorMessage,
          'SubscriptionProvider:focus',
          { force: true },
        );
      } catch (resumeError) {
        console.error(resumeError);
      }
    };

    initializeSubscription();
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchSubscriptionStatus]);

  useEffect(() => {
    const handleLoggedStateChange = async () => {
      if (
        prevIsLoggedRef.current !== undefined &&
        prevIsLoggedRef.current !== userIsLogged
      ) {
        const errorMessage = 'Failed to refresh subscription status';
        try {
          const ud = useAppStore.getState().userData as any;
          if (ud?.isByBackOffice) return;
          await fetchSubscriptionStatus(
            errorMessage,
            'SubscriptionProvider:logged-state-change',
          );
        } catch (statusError) {
          console.error(
            statusError instanceof Error ? statusError.message : statusError,
          );
        }
      }
      prevIsLoggedRef.current = userIsLogged;
    };

    handleLoggedStateChange();
  }, [userIsLogged, fetchSubscriptionStatus]);

  return React.Children.only(children) as React.ReactElement;
};

export default SubscriptionProvider;
