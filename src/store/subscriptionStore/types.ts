export interface SubscriptionState {
  isSubscribed: boolean;
  subscriberId?: string;
  tryPeriode?: boolean;
  isOnTrialPeriod?: boolean;
  isInFreeCountry?: boolean;
  [key: string]: unknown;
}
