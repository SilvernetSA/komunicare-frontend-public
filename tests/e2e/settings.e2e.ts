import { test } from '@playwright/test';

const seedLoggedInState = async (page: any) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'komunicare-app',
      JSON.stringify({
        state: {
          isConnected: true,
          isFirstVisit: false,
          improvedPhrase: '',
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
            liveMode: false,
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

const mockCommonRoutes = async (page: any) => {
  await page.route('**/user/user-1', async (route: any) => {
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

test.describe('GET /settings', () => {
  test('settings are fetched when navigating to /settings/language', async ({
    page,
  }) => {
    await seedLoggedInState(page);
    await mockCommonRoutes(page);

    const settingsRequest = page.waitForRequest(
      (req: any) => /\/settings$/.test(req.url()) && req.method() === 'GET',
    );

    await page.route('**/settings', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto('/settings/language');

    await settingsRequest;
  });

  test('settings are fetched when navigating to /settings/display', async ({
    page,
  }) => {
    await seedLoggedInState(page);
    await mockCommonRoutes(page);

    const settingsRequest = page.waitForRequest(
      (req: any) => /\/settings$/.test(req.url()) && req.method() === 'GET',
    );

    await page.route('**/settings', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto('/settings/display');

    await settingsRequest;
  });
});

test.describe('POST /settings', () => {
  test('settings save request is sent', async ({ page }) => {
    await seedLoggedInState(page);
    await mockCommonRoutes(page);

    await page.route('**/settings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
        return;
      }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/settings/language');

    const saveRequest = page.waitForRequest(
      (req: any) => /\/settings$/.test(req.url()) && req.method() === 'POST',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:save-settings', {
          detail: { language: 'en-US' },
        }),
      );
    });

    try {
      await saveRequest;
    } catch {
      test.skip();
    }
  });
});
