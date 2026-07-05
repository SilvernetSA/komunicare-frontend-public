export const computeOwnedProduct = (
  isSubscribed: boolean,
  id?: string | null,
) => {
  if (!isSubscribed) return '';
  return {
    billingPeriod: 'Mensual',
    id: id || '',
    price: '50',
    subscriptionId: 'no viene',
    title: 'Suscripción Premium 1 Mes',
  };
};
