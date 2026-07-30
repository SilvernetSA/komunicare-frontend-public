// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  appStoreState: {
    userData: {
      id: 'user-1',
      email: 'user@example.com',
      isByBackOffice: false,
      location: { countryCode: 'AR' },
    } as Record<string, unknown>,
  },
  getSubscriberByUserIdApi: vi.fn(),
  apiClientGet: vi.fn(),
}));

vi.mock('../appStore', () => {
  const useAppStore = ((selector?: any) =>
    selector ? selector(mocks.appStoreState) : mocks.appStoreState) as any;
  useAppStore.getState = () => mocks.appStoreState;
  return { useAppStore };
});

vi.mock('../subscriptionStore/getSubscriberByUserIdApi', () => ({
  getSubscriberByUserIdApi: mocks.getSubscriberByUserIdApi,
}));

vi.mock('../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../subscriptionStore/enhancePlans', () => ({
  enhancePlans: (plans: any[]) => plans,
}));

describe('subscriptionStore request de-duplication', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.appStoreState.userData = {
      id: 'user-1',
      email: 'user@example.com',
      isByBackOffice: false,
      location: { countryCode: 'AR' },
    };
  });

  it('deduplicates concurrent updateIsSubscribed(force=true) calls', async () => {
    let resolveRequest: ((value: any) => void) | null = null;
    const inFlightRequest = new Promise((resolve) => {
      resolveRequest = resolve;
    });
    mocks.getSubscriberByUserIdApi.mockReturnValue(inFlightRequest);

    const { useSubscriptionStore } = await import('@/domains/subscription/stores/subscriptionStore');

    const first = useSubscriptionStore
      .getState()
      .updateIsSubscribed('test-1', { force: true });
    const second = useSubscriptionStore
      .getState()
      .updateIsSubscribed('test-2', { force: true });

    expect(mocks.getSubscriberByUserIdApi).toHaveBeenCalledTimes(1);

    resolveRequest?.({
      _id: 'subscriber-1',
      status: 'not_subscribed',
      expirationDate: null,
    });

    await Promise.all([first, second]);
    expect(mocks.getSubscriberByUserIdApi).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent updatePlans(force=true) calls', async () => {
    let resolveRequest: ((value: any) => void) | null = null;
    const inFlightRequest = new Promise((resolve) => {
      resolveRequest = resolve;
    });
    mocks.apiClientGet.mockReturnValue(inFlightRequest);

    const { useSubscriptionStore } = await import('@/domains/subscription/stores/subscriptionStore');

    const first = useSubscriptionStore.getState().updatePlans({ force: true });
    const second = useSubscriptionStore.getState().updatePlans({ force: true });

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);

    resolveRequest?.({
      data: {
        plans: [
          {
            id: 'plan-1',
            name: 'Premium 1 mes',
            currency: 'USD',
            price: 50,
            provider: 'paypal',
          },
        ],
      },
    });

    await Promise.all([first, second]);
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
  });
});
