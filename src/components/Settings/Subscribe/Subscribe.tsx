import LogoutIcon from '@mui/icons-material/Logout';
import { CircularProgress } from '@mui/material';
import { IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

import messages from './Subscribe.messages';
import SubscriptionInfo from './SubscriptionInfo';
import SubscriptionPlans from './SubscriptionPlans';
import { openExternalUrl } from '../../../platform/browser';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { useSubscriptionStore } from '../../../store/subscriptionStore';
import { Product } from '../../../types/subscription';
import FullScreenDialog from '../../UI/FullScreenDialog/FullScreenDialog';
import './Subscribe.css';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ContainerState {
  cancelSubscriptionStatus: string;
  updatingStatus: boolean;
  subscriptions: unknown[];
}

const KNOWN_SUBSCRIBE_ERRORS: Record<
  string,
  typeof messages.activeSubscriptionExists
> = {
  'El usuario ya tiene una suscripción vigente.':
    messages.activeSubscriptionExists,
  'User already has an active subscription.': messages.activeSubscriptionExists,
  'Error saving subscription': messages.errorSavingSubscription,
  'Error getting subscriber': messages.errorGettingSubscriber,
  'Plan configuration missing for PayPal subscription':
    messages.planConfigMissing,
  'Subscription request failed': messages.subscriptionRequestFailed,
  'Unexpected subscription error': messages.unexpectedSubscriptionError,
};

// ─── Component ─────────────────────────────────────────────────────────────────

const Subscribe: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const subscription = useSubscriptionStore((state) => state);
  const user = useAppStore((state) => state.userData) as any;
  const logout = useAuthStore((s) => s.logout);
  const userIsLogged = Boolean(user?.email);

  const [state, setState] = useState<ContainerState>({
    cancelSubscriptionStatus: '',
    updatingStatus: true,
    subscriptions: [],
  });

  const loadSubscriptions = async () => {
    try {
      const subscriptions = await useSubscriptionStore
        .getState()
        .fetchSubscriptionsList();
      setState((prev) => ({ ...prev, subscriptions }));
      return subscriptions;
    } catch (error) {
      console.error('Failed to load subscriptions', error);
      setState((prev) => ({ ...prev, subscriptions: [] }));
      return [];
    }
  };

  useEffect(() => {
    const initializeSubscription = async () => {
      const queryParams = new URLSearchParams(routerLocation.search);
      const paypalSubscriptionId = queryParams.get('subscription_id');
      const mercadoPagoSubscriptionId = queryParams.get('preapproval_id');
      const fromPaypalCheckout = Boolean(paypalSubscriptionId);
      const fromMercadoPagoCheckout = Boolean(mercadoPagoSubscriptionId);
      const fromProviderCheckout =
        fromPaypalCheckout || fromMercadoPagoCheckout;
      const requestOrigin =
        'Function: componentDidMount - Component: Subscribe Container';

      useSubscriptionStore.getState().hidePremiumRequired();
      setState((prev) => ({ ...prev, updatingStatus: true }));
      try {
        if (fromPaypalCheckout && paypalSubscriptionId) {
          try {
            await useSubscriptionStore
              .getState()
              .confirmPaypalSubscription(paypalSubscriptionId);
          } catch (error) {
            console.error('Failed to confirm PayPal subscription', error);
          }
        }

        if (fromMercadoPagoCheckout && mercadoPagoSubscriptionId) {
          try {
            await useSubscriptionStore
              .getState()
              .confirmMercadoPagoSubscription(mercadoPagoSubscriptionId);
          } catch (error) {
            console.error('Failed to confirm Mercado Pago subscription', error);
          }
        }

        await Promise.all([
          useSubscriptionStore.getState().updateIsSubscribed(requestOrigin, {
            silent: true,
            force: fromProviderCheckout,
          }),
          useSubscriptionStore.getState().updatePlans(),
          loadSubscriptions(),
        ]);

        if (fromProviderCheckout) {
          navigate('/settings/subscription', { replace: true });
        }
      } finally {
        setState((prev) => ({ ...prev, updatingStatus: false }));
      }
    };

    void initializeSubscription();
  }, [routerLocation.search, navigate]);

  const handleRefreshSubscription = (): void => {
    const requestOrigin =
      'Fuction: handleRefreshSubscription() - Component: subscribeContainer';
    void Promise.all([
      useSubscriptionStore
        .getState()
        .updateIsSubscribed(requestOrigin, { force: true }),
      useSubscriptionStore.getState().updatePlans({ force: true }),
      loadSubscriptions(),
    ]);
  };

  const handleCancelSubscription = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, cancelSubscriptionStatus: 'cancelling' }));
      await useSubscriptionStore.getState().cancelSubscriptionPlan();
      await Promise.all([
        useSubscriptionStore
          .getState()
          .updateIsSubscribed('cancel', { force: true, silent: true }),
        useSubscriptionStore.getState().updatePlans({ force: true }),
        loadSubscriptions(),
      ]);
      setState((prev) => ({ ...prev, cancelSubscriptionStatus: 'ok' }));
    } catch (err: any) {
      console.error(err.message);
      setState((prev) => ({ ...prev, cancelSubscriptionStatus: 'error' }));
    }
  };

  const resolveAlertMessage = (text: string): string => {
    const known = KNOWN_SUBSCRIBE_ERRORS[text];
    return known ? intl.formatMessage(known) : text;
  };

  const handleSubscribe = async (product?: Product): Promise<void> => {
    try {
      const paypalPlan =
        product ??
        subscription.products.find((plan) => plan.provider === 'paypal');
      if (!paypalPlan?.planId) {
        throw new Error('Plan configuration missing for PayPal subscription');
      }

      const resolved = await useSubscriptionStore
        .getState()
        .createSubscriptionCheckout({
          planId: paypalPlan.planId,
          provider: 'paypal',
          email: user.email,
        });

      if (resolved?.link) {
        await openExternalUrl(resolved.link);
        return;
      }

      if (resolved?.message) {
        alert(resolveAlertMessage(resolved.message));
        return;
      }

      if (resolved?.error?.message) {
        alert(resolveAlertMessage(resolved.error.message));
        return;
      }
    } catch (error: any) {
      console.error(error?.message || error);
      alert(
        resolveAlertMessage(error?.message || 'Subscription request failed'),
      );
    }
  };

  const handleClose = async () => {
    await useSubscriptionStore
      .getState()
      .updateIsSubscribed('subscribe-close', { force: true });
    navigate(-1);
  };

  // Mostrar info solo con suscripción paga activa/cancelada-en-periodo.
  // Trial vigente muestra planes + estado de prueba para evitar confundirlo con suscripción paga.
  const hasActiveAccess = subscription.isSubscribed;

  return (
    <div className="Subscribe">
      <FullScreenDialog
        open
        title={<FormattedMessage {...messages.subscribe} />}
        onClose={handleClose}
        buttons={
          <IconButton
            color="inherit"
            onClick={() =>
              logout().then(() => window.location.replace('/login-signup'))
            }
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogoutIcon />
          </IconButton>
        }
      >
        {state.updatingStatus ? (
          <div className="Subscribe__Loading__Container">
            <CircularProgress />
          </div>
        ) : hasActiveAccess ? (
          <SubscriptionInfo
            onRefreshSubscription={handleRefreshSubscription}
            onCancelSubscription={handleCancelSubscription}
            cancelSubscriptionStatus={state.cancelSubscriptionStatus}
            subscriptions={state.subscriptions as any}
          />
        ) : (
          <SubscriptionPlans
            subscription={subscription}
            onRefreshSubscription={handleRefreshSubscription}
            isLogged={userIsLogged}
            onSubscribe={handleSubscribe as any}
          />
        )}
      </FullScreenDialog>
    </div>
  );
};

export default Subscribe;
