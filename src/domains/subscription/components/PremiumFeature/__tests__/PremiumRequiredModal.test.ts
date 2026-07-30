// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { isSubscriptionPath } from '../PremiumRequiredModal';

describe('isSubscriptionPath', () => {
  it.each([
    '/settings/subscribe',
    '/settings/subscription',
    '/settings/mercado-pago',
  ])('allows the billing route %s', (pathname) => {
    expect(isSubscriptionPath(pathname)).toBe(true);
  });

  it('keeps the premium modal enabled outside billing routes', () => {
    expect(isSubscriptionPath('/')).toBe(false);
  });
});
