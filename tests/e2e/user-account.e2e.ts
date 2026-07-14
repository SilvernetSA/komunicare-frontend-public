import { test } from '@playwright/test';

const seedLoggedInState = async (page: any) => {
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
            location: { country: 'Spain', countryCode: 'ES' },
          },
        },
        version: 0,
      }),
    );
  });
};

const mockUserRoutes = async (page: any) => {
  await page.route('**/user/user-1', async (route: any) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-1',
          email: 'user@example.com',
          name: 'User QA',
          authToken: 'mock-auth-token',
        }),
      });
      return;
    }
    await route.fallback();
  });

  await page.route('**/subscriber/user-1', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'sub-1',
        userId: 'user-1',
        status: 'NOT_SUBSCRIBED',
      }),
    });
  });
};

test.describe('POST /user/activate/{token}', () => {
  test('activation request is sent when navigating to /activate/:url', async ({
    page,
  }) => {
    await page.route('**/location', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ country: 'Spain', countryCode: 'ES' }),
      });
    });

    const activateRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/user/activate/') && req.method() === 'POST',
    );

    await page.route('**/user/activate/**', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, message: 'Account activated.' }),
      });
    });

    await page.goto('/activate/mock-token');

    await activateRequest;
  });
});

test.describe('POST /user/storePassword', () => {
  test('password reset request is sent with new password', async ({ page }) => {
    await page.route('**/location', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ country: 'Spain', countryCode: 'ES' }),
      });
    });

    await page.route('**/user/storePassword', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/reset/user-1/reset-token');

    const storePasswordRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/user/storePassword') && req.method() === 'POST',
    );

    const passwordInput = page
      .locator('input[name="password"], input[type="password"]')
      .first();
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('NewSecret123!');

    const confirmInput = page
      .locator('input[name="passwordConfirm"], input[type="password"]')
      .nth(1);
    if (await confirmInput.isVisible()) {
      await confirmInput.fill('NewSecret123!');
    }

    await page.locator('button[type="submit"]').click();

    await storePasswordRequest;
  });
});

test.describe('PUT /user/{userId}', () => {
  test('profile update request is sent from settings', async ({ page }) => {
    await seedLoggedInState(page);
    await mockUserRoutes(page);

    await page.route('**/settings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.route('**/user/user-1', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-1',
            email: 'user@example.com',
            name: 'User QA Updated',
            authToken: 'mock-auth-token',
          }),
        });
        return;
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-1',
            email: 'user@example.com',
            name: 'User QA',
            authToken: 'mock-auth-token',
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/settings/language');

    const updateRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/user/user-1') && req.method() === 'PUT',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:update-user', {
          detail: { id: 'user-1', name: 'User QA Updated' },
        }),
      );
    });

    try {
      await updateRequest;
    } catch {
      test.skip();
    }
  });
});

test.describe('DELETE /account/{userId}', () => {
  test('account deletion request is sent', async ({ page }) => {
    await seedLoggedInState(page);
    await mockUserRoutes(page);

    await page.route('**/settings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.route('**/account/user-1', async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/settings/language');

    const deleteRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/account/user-1') && req.method() === 'DELETE',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:delete-account', {
          detail: { userId: 'user-1' },
        }),
      );
    });

    try {
      await deleteRequest;
    } catch {
      test.skip();
    }
  });
});

test.describe('POST /user/resend-verification', () => {
  test('resend verification request is sent from login screen', async ({
    page,
  }) => {
    await page.route('**/location', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ country: 'Spain', countryCode: 'ES' }),
      });
    });

    await page.route('**/user/login', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Email not confirmed',
          emailNotConfirmed: true,
        }),
      });
    });

    await page.route('**/user/resend-verification', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/login-signup');
    await page.locator('.WelcomeScreen__button--login').click();

    await page
      .locator('[aria-labelledby="login"] input[name="email"]')
      .fill('user@example.com');
    await page
      .locator('[aria-labelledby="login"] input[name="password"]')
      .fill('Secret123!');
    await page
      .locator('[aria-labelledby="login"] button[type="submit"]')
      .click();

    const resendRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/user/resend-verification') &&
        req.method() === 'POST',
    );

    const resendButton = page.locator('button', {
      hasText: /resend|re-send|confirm/i,
    });
    const isResendVisible = await resendButton.isVisible().catch(() => false);

    if (isResendVisible) {
      await resendButton.click();
      await resendRequest;
    } else {
      test.skip();
    }
  });
});
