import { handleOfflineFallbackAction } from './handleOfflineFallback';
import {
  ACTIVE,
  CANCELED,
  CANCELLED,
  IN_GRACE_PERIOD,
  NOT_SUBSCRIBED,
  REQUIRING_PREMIUM_COUNTRIES,
} from '../../providers/SubscriptionProvider/SubscriptionProvider.constants';
import { useAppStore } from '../appStore';
import { useSubscriptionStore } from '../subscriptionStore';
import { computeOwnedProduct } from './computeOwnedProduct';
import { getSubscriberByUserIdApi } from './getSubscriberByUserIdApi';
import { normaliseSubscriptionStatus } from './normaliseStatus';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { SubscriptionState } from './types';

interface SubscriptionStateLike {
  tryPeriode?: boolean;
  isSubscribed?: boolean;
  expiryDate?: unknown;
  status?: unknown;
  ownedProduct?: unknown;
  androidSubscriptionState?: string;
  expirationDate?: unknown;
}

interface UpdateIsSubscribedActionArgs {
  requestOrigin: string;
  state: SubscriptionStateLike;
  updateSubscription: (patch: Partial<SubscriptionStateLike>) => void;
  silent?: boolean;
}

export const updateIsSubscribedAction = async ({
  requestOrigin,
  state,
  updateSubscription,
  silent = false,
}: UpdateIsSubscribedActionArgs): Promise<boolean> => {
  try {
    const userData = useAppStore.getState().userData as any;
    if (!userData?.id) {
      updateSubscription({
        ownedProduct: '',
        status: NOT_SUBSCRIBED,
        isSubscribed: false,
        expiryDate: null,
        androidSubscriptionState: NOT_SUBSCRIBED,
      });
      return false;
    }

    // Users created from backoffice bypass subscription logic entirely
    if (userData?.isByBackOffice) {
      updateSubscription({
        status: 'active',
        isSubscribed: true,
        tryPeriode: false,
        isOnTrialPeriod: false,
      } as any);
      useSubscriptionStore.getState().hidePremiumRequired();
      return true;
    }

    const subscriber = await getSubscriberByUserIdApi(
      userData.id,
      requestOrigin,
    );
    const apiStatus = normaliseSubscriptionStatus(subscriber?.status);
    const isSubscribed = [
      ACTIVE,
      CANCELED,
      CANCELLED,
      IN_GRACE_PERIOD,
    ].includes(apiStatus as any);

    // tryPeriode: activo si expirationDate es futura (viene de la API con trialDays)
    let tryPeriod = false;
    if (subscriber?.expirationDate) {
      tryPeriod = new Date(subscriber.expirationDate) > new Date();
    }

    const userDataState: any = useAppStore.getState().userData;
    const isByBackOffice = Boolean(userDataState?.isByBackOffice);

    // isInFreeCountry: false para Argentina y países no listados como premium
    // Solo es true si el país del usuario NO está en REQUIRING_PREMIUM_COUNTRIES
    const userCountryCode = userDataState?.location?.countryCode as
      | string
      | undefined;
    const isInFreeCountry = userCountryCode
      ? !(REQUIRING_PREMIUM_COUNTRIES as readonly string[]).includes(
          userCountryCode,
        )
      : false;

    const patch: Partial<SubscriptionState> = {
      subscriberId: String(subscriber?._id || subscriber?.id || ''),
      ownedProduct: computeOwnedProduct(
        isSubscribed,
        String(subscriber?._id || subscriber?.id || ''),
      ),
      status: isByBackOffice ? 'active' : apiStatus,
      isSubscribed: isByBackOffice ? true : isSubscribed,
      expiryDate: subscriber?.expirationDate ?? null,
      expirationDate: subscriber?.expirationDate as any,
      androidSubscriptionState: apiStatus,
      tryPeriode: tryPeriod,
      isOnTrialPeriod: tryPeriod,
      isInFreeCountry,
    };

    updateSubscription(patch as Partial<SubscriptionStateLike>);

    // Cerrar modal bloqueante si ahora tiene acceso
    const hasAccess = isByBackOffice || isSubscribed || tryPeriod;
    if (hasAccess) {
      useSubscriptionStore.getState().hidePremiumRequired();
    } else if (!silent && !isByBackOffice && !isSubscribed && !tryPeriod) {
      useSubscriptionStore
        .getState()
        .showPremiumRequired({ showTryPeriodFinishedMessages: true });
    }

    return Boolean(patch.isSubscribed ?? isSubscribed);
  } catch (error: any) {
    console.error(getApiErrorMessage(error, 'Unexpected subscription error'));

    const isSubscriberNotFound =
      error?.response?.data?.error === 'subscriber not found' ||
      error?.error === 'subscriber not found';

    if (isSubscriberNotFound) {
      updateSubscription({
        ownedProduct: '',
        status: NOT_SUBSCRIBED,
        isSubscribed: false,
        androidSubscriptionState: NOT_SUBSCRIBED,
      });
      return false;
    }

    return handleOfflineFallbackAction(state, updateSubscription);
  }
};
