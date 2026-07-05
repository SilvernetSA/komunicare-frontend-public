import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useUserStore } from '../../store/userStore';
import { SubscriptionData } from '../../types/subscription';

interface SubscriptionPayload extends Partial<SubscriptionData> {
  lastUpdated?: number;
  ownedProduct?: unknown;
  tryPeriode?: boolean;
  expirationDate?: string;
  [key: string]: unknown;
}

export const updateSubscription = (payload: SubscriptionPayload) => {
  const user = useUserStore.getState().getUserData();
  const isByBackOffice = user?.isByBackOffice || false;

  return useSubscriptionStore.getState().updateSubscription({
    ...payload,
    status: isByBackOffice ? 'active' : payload?.status,
    isSubscribed: isByBackOffice ? true : payload?.isSubscribed,
  });
};
