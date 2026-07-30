import { NOT_SUBSCRIBED } from '@/providers/SubscriptionProvider/SubscriptionProvider.constants';

export const applyLoginSuccess = (
  payload: unknown,
): Record<string, unknown> => {
  const subscriber = (payload as any)?.subscriber || {};
  const isByBackOffice = Boolean((payload as any)?.isByBackOffice);

  const status = (subscriber.status || NOT_SUBSCRIBED).toLowerCase();
  const expirationDate = subscriber.expirationDate ?? null;

  const isPaidActive = [
    'active',
    'canceled',
    'cancelled',
    'in_grace_period',
  ].includes(status);
  const tryPeriode = expirationDate
    ? new Date(expirationDate) > new Date()
    : false;
  const isSubscribed = isByBackOffice || isPaidActive;
  const hasAccess = isSubscribed || tryPeriode;

  return {
    subscriberId: subscriber._id || subscriber.id || '',
    androidSubscriptionState: status,
    status: isByBackOffice ? 'active' : status,
    expiryDate: expirationDate,
    isSubscribed,
    isOnTrialPeriod: tryPeriode,
    tryPeriode,
    lastUpdated: isByBackOffice ? Date.now() + 365 * 24 * 60 * 60 * 1000 : 0,
    lastSubscriptionUserId: String((payload as any)?.id || ''),
    premiumRequiredModalState: {
      open: !hasAccess,
      showTryPeriodFinishedMessages: !hasAccess,
    },
    trialRemainingModalOpen: tryPeriode && !isSubscribed,
  };
};
