import React from 'react';

import { useSubscriptionStore } from '@/domains/subscription/stores/subscriptionStore';

interface PremiumFeatureProps {
  children: React.ReactNode;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({ children }) => {
  const isOnTrialPeriod = useSubscriptionStore(
    (state) => state.isOnTrialPeriod,
  );
  const isSubscribed = useSubscriptionStore((state) => state.isSubscribed);
  const isInFreeCountry = useSubscriptionStore(
    (state) => state.isInFreeCountry,
  );
  const showPremiumRequired = useSubscriptionStore(
    (state) => state.showPremiumRequired,
  );
  const captured = (event: React.MouseEvent) => {
    if (isInFreeCountry || isSubscribed || isOnTrialPeriod) return;
    event.stopPropagation();
    event.preventDefault();
    showPremiumRequired({});
  };

  return (
    <>
      <div onClickCapture={captured}>{children}</div>
    </>
  );
};

export default PremiumFeature;
