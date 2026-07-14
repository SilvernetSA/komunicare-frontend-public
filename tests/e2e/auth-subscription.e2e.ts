import { expect, test } from '@playwright/test';

const mockLocationApi = async (page: any) => {
  await page.route('**/location', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ country: 'Spain', countryCode: 'ES' }),
    });
  });
};

test('signup flow submits the form and shows the verification message', async ({
  page,
}) => {
  await mockLocationApi(page);

  await page.route('**/user', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: 1,
        message:
          'An email has been sent to you. Please check it to verify your account.',
      }),
    });
  });

  await page.goto('/login-signup');

  await page.locator('.WelcomeScreen__button--signup').click();

  await page.locator('input[name="name"]').fill('QA User');
  await page
    .locator('[aria-labelledby="sign-up"] input[name="email"]')
    .fill('qa@example.com');
  await page.locator('input[name="password"]').fill('Secret123!');
  await page.locator('input[name="passwordConfirm"]').fill('Secret123!');
  await page.locator('input[name="isTermsAccepted"]').check();

  await page
    .locator('[aria-labelledby="sign-up"] button[type="submit"]')
    .click();

  await expect(page.locator('.SignUp__status--success')).toBeVisible();
});

test('forgot password flow requests reset and renders success state', async ({
  page,
}) => {
  await mockLocationApi(page);

  await page.route('**/user/forgot', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        response: true,
        message: 'Password reset requested.',
      }),
    });
  });

  await page.goto('/login-signup');

  await page.locator('.WelcomeScreen__button--login').click();
  await page
    .locator('[aria-labelledby="login"] .MuiDialogContent-root > button')
    .click();

  await page
    .locator('[aria-labelledby="forgot"] input[name="email"]')
    .fill('qa@example.com');
  await page
    .locator('[aria-labelledby="forgot"] button[type="submit"]')
    .click();

  await expect(page.locator('.Forgot__status--success')).toBeVisible();
});

test('subscription screen loads plans and starts checkout request', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'komunicare-app',
      JSON.stringify({
        state: {
          isConnected: true,
          isFirstVisit: false,
          liveHelp: {
            isRootBoardTourEnabled: false,
            isUnlockedTourEnabled: false,
            isSettingsTourEnabled: false,
            communicatorTour: {
              isCommBoardsEnabled: false,
              isPublicBoardsEnabled: false,
              isAllMyBoardsEnabled: false,
            },
            isAnalyticsTourEnabled: false,
          },
          displaySettings: {
            uiSize: 'medium',
            fontFamily: 'Roboto',
            fontSize: 'medium',
            hideOutputActive: false,
            increaseOutputButtons: false,
            labelPosition: 'below',
            darkThemeActive: false,
          },
          navigationSettings: {
            shareShowActive: false,
            bigScrollButtonsActive: false,
            navigationButtonsStyle: 'sides',
            caBackButtonActive: false,
            quickUnlockActive: false,
            removeOutputActive: false,
            vocalizeFolders: false,
            playSoundOnTouchActive: false,
          },
          userData: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'User QA',
            authToken: 'mock-auth-token',
            location: {
              country: 'Spain',
              countryCode: 'ES',
            },
          },
        },
        version: 0,
      }),
    );
  });

  await page.route('**/user/user-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-1',
        email: 'user@example.com',
        name: 'User QA',
        authToken: 'mock-auth-token',
        location: { country: 'Spain', countryCode: 'ES' },
      }),
    });
  });

  await page.route('**/subscriber/user-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'subscriber-1',
        _id: 'subscriber-1',
        userId: 'user-1',
        status: 'NOT_SUBSCRIBED',
        createdAt: '2026-04-01T10:00:00.000Z',
      }),
    });
  });

  await page.route('**/subscription/list', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        suscriptions: [],
        count: 0,
      }),
    });
  });

  await page.route('**/plans', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plans: [
          {
            id: 'plan-doc-1',
            name: 'Premium mensual',
            currency: 'USD',
            price: 10,
            provider: 'paypal',
            planId: 'P-PAYPAL-1',
          },
        ],
        count: 1,
      }),
    });
  });

  await page.route('**/subscription', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ link: 'https://example.com/paypal-checkout' }),
    });
  });

  await page.goto('/settings/subscribe');

  const checkoutRequest = page.waitForRequest(
    (request) =>
      request.url().includes('/subscription') && request.method() === 'POST',
  );

  await expect(page.getByRole('button', { name: /paypal/i })).toBeVisible();
  await page.getByRole('button', { name: /paypal/i }).click();

  const request = await checkoutRequest;
  const payload = request.postDataJSON();

  expect(payload.provider).toBe('paypal');
  expect(payload.planId).toBe('P-PAYPAL-1');
  expect(payload.email).toBe('user@example.com');
});
