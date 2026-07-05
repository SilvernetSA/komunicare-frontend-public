import { NOT_SUBSCRIBED } from '../../providers/SubscriptionProvider/SubscriptionProvider.constants';

export const normaliseSubscriptionStatus = (status?: string | null): string => {
  if (!status) return NOT_SUBSCRIBED;
  return status.toLowerCase();
};
