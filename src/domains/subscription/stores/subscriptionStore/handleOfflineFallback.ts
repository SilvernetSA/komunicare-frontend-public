import {
  ACTIVE,
  CANCELED,
  CANCELLED,
  EXPIRED,
  IN_GRACE_PERIOD,
  NOT_SUBSCRIBED,
} from '@/providers/SubscriptionProvider/SubscriptionProvider.constants';

interface SubscriptionStateLike {
  isSubscribed?: boolean;
  expiryDate?: unknown;
  status?: unknown;
  ownedProduct?: unknown;
}

const SUBSCRIPTION_GRACE_PERIOD_DAYS = 7;

export const handleOfflineFallbackAction = (
  state: SubscriptionStateLike,
  update: (patch: Partial<SubscriptionStateLike>) => void,
): boolean => {
  const { expiryDate, status, isSubscribed } = state;
  const expiryDateValue =
    typeof expiryDate === 'string' || typeof expiryDate === 'number'
      ? expiryDate
      : null;

  if (!expiryDateValue || !isSubscribed) {
    update({
      ownedProduct: '',
      status: NOT_SUBSCRIBED,
      isSubscribed: false,
    });
    return false;
  }

  const expiryDateFormat = new Date(expiryDateValue);
  const nowInMillis = Date.now();
  const isExpired = nowInMillis > expiryDateFormat.getTime();

  const billingRetryPeriodFinishDate =
    status === ACTIVE
      ? expiryDateFormat.setDate(
          expiryDateFormat.getDate() + SUBSCRIPTION_GRACE_PERIOD_DAYS,
        )
      : expiryDateFormat.getTime();

  if (!isExpired) {
    return isSubscribed;
  }

  const isBillingRetryPeriodFinished =
    nowInMillis > billingRetryPeriodFinishDate;

  if (
    status === CANCELED ||
    status === CANCELLED ||
    isBillingRetryPeriodFinished
  ) {
    update({
      isSubscribed: false,
      status: EXPIRED,
      ownedProduct: '',
    });
    return false;
  }

  update({
    isSubscribed: true,
    expiryDate: new Date(billingRetryPeriodFinishDate).toISOString(),
    status: IN_GRACE_PERIOD,
  });
  return true;
};
