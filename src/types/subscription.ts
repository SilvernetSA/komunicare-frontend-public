// SubscriptionState is defined in src/store/subscriptionStore/types.ts where it is used.

export interface Product {
  id: string;
  name: string;
  currency: string;
  price: number;
  provider: string;
  planId?: string;
  subscriptionName?: string;
}

export interface SubscriptionError {
  showError: boolean;
  code?: string;
}

export interface SubscriptionData {
  status: string;
  expiryDate: string;
  error: SubscriptionError;
  isOnTrialPeriod: boolean;
  isSubscribed: boolean;
  products: Product[];
}

export interface OwnedProduct {
  title: string;
  billingPeriod: string;
  platform?: string;
}

export interface SubscriptionItem {
  id: string;
  status: string;
  expirationDate: string;
}

export interface Subscription {
  id?: string;
  name?: string;
  planId?: string;
  status?: string;
  price?: number;
  currency?: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  provider: 'paypal' | 'mercadopago';
  email: string;
  cardTokenId?: string;
}

export interface CreateSubscriptionResponse {
  link?: string;
  init_point?: string;
  subscriptionId?: string;
  status?: string;
  message?: string;
  error?: {
    message?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Transaction {
  id?: string;
  productId?: string;
  transactionId?: string;
  purchaseToken?: string;
  receipt?: string;
  [key: string]: unknown;
}

export interface TransactionResponse {
  ok: boolean;
  data?: unknown;
  [key: string]: unknown;
}

export interface Plan {
  id?: string;
  name: string;
  description?: string;
  provider: 'paypal' | 'mercadopago';
  planId: string;
  interval: string;
  intervalCount: number;
  price: number;
  currency: string;
  subscriptionName?: string;
}

export interface Subscriber {
  _id?: string;
  id?: string;
  userId: string;
  status: string;
  expirationDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
