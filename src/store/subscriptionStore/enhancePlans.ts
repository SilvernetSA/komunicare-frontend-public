import type { Product } from '../../types/subscription';

export const enhancePlans = (subscriptions: unknown[]): Product[] => {
  if (!Array.isArray(subscriptions)) {
    return [];
  }
  const products: Product[] = [];

  subscriptions.forEach((plan) => {
    if (!plan || typeof plan !== 'object') {
      return;
    }

    const planRecord = plan as Record<string, unknown>;

    const id =
      typeof planRecord.id === 'string' ? planRecord.id :
      typeof planRecord._id === 'string' ? planRecord._id : undefined;
    const name =
      typeof planRecord.name === 'string' ? planRecord.name : undefined;
    const currency =
      typeof planRecord.currency === 'string' ? planRecord.currency : undefined;
    const provider =
      typeof planRecord.provider === 'string' ? planRecord.provider : undefined;

    const priceValue = (() => {
      if (typeof planRecord.price === 'number') {
        return planRecord.price;
      }
      if (typeof planRecord.price === 'string') {
        const parsed = Number(planRecord.price);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      return undefined;
    })();

    if (!id || !name || !currency || !provider || priceValue === undefined) {
      return;
    }

    const product: Product = {
      id,
      name,
      currency,
      price: priceValue,
      provider,
      planId:
        typeof planRecord.planId === 'string' ? planRecord.planId : undefined,
      subscriptionName:
        typeof planRecord.subscriptionName === 'string'
          ? planRecord.subscriptionName
          : name,
    };

    products.push(product);
  });

  return products;
};
