import { expect, test } from '@playwright/test';

const seedLoggedOutState = async (page: any) => {
  await page.addInitScript(() => {
    localStorage.removeItem('cboard-app');
  });
};

const mockLocation = async (page: any) => {
  await page.route('**/location', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ country: 'Spain', countryCode: 'ES' }),
    });
  });
};

test.describe('GET /location', () => {
  test('location is requested on app init', async ({ page }) => {
    await seedLoggedOutState(page);

    const locationRequest = page.waitForRequest(
      (req: any) => req.url().includes('/location') && req.method() === 'GET',
    );

    await page.goto('/login-signup');

    await locationRequest;
  });
});

test.describe('POST /user/login', () => {
  test('login success navigates to /board/root', async ({ page }) => {
    await seedLoggedOutState(page);
    await mockLocation(page);

    await page.route('**/user/login', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-auth-token',
          id: 'user-1',
          email: 'user@example.com',
          name: 'User QA',
        }),
      });
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
        }),
      });
    });

    await page.route('**/board/byemail/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'board-1',
            name: 'My Board',
            author: 'User QA',
            email: 'user@example.com',
            tiles: [],
            isPublic: false,
            markToUpdate: false,
          },
        ]),
      });
    });

    await page.route('**/communicator/byemail/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'comm-1',
            name: 'My Communicator',
            author: 'User QA',
            email: 'user@example.com',
            boards: ['board-1'],
            rootBoard: 'board-1',
          },
        ]),
      });
    });

    await page.route(
      '**/backoffice/system-boards/public/boards',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    await page.route(
      '**/backoffice/system-boards/public/communicators',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    await page.route('**/subscriber/user-1', async (route) => {
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

    await page.goto('/login-signup');

    await page.locator('.WelcomeScreen__button--login').click();

    await page
      .locator('[aria-labelledby="login"] input[name="email"]')
      .fill('user@example.com');
    await page
      .locator('[aria-labelledby="login"] input[name="password"]')
      .fill('Secret123!');

    const loginRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/user/login') && req.method() === 'POST',
    );

    await page
      .locator('[aria-labelledby="login"] button[type="submit"]')
      .click();

    await loginRequest;

    await page.waitForURL(/\/board\//);
  });

  test('login form sends email and password in request body', async ({
    page,
  }) => {
    await seedLoggedOutState(page);
    await mockLocation(page);

    await page.route('**/user/login', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-auth-token',
          id: 'user-1',
          email: 'user@example.com',
          name: 'User QA',
        }),
      });
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
        }),
      });
    });

    await page.route('**/board/byemail/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/communicator/byemail/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(
      '**/backoffice/system-boards/public/boards',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    await page.route(
      '**/backoffice/system-boards/public/communicators',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    await page.route('**/subscriber/user-1', async (route) => {
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

    await page.goto('/login-signup');

    await page.locator('.WelcomeScreen__button--login').click();

    await page
      .locator('[aria-labelledby="login"] input[name="email"]')
      .fill('user@example.com');
    await page
      .locator('[aria-labelledby="login"] input[name="password"]')
      .fill('Secret123!');

    const loginRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/user/login') && req.method() === 'POST',
    );

    await page
      .locator('[aria-labelledby="login"] button[type="submit"]')
      .click();

    const request = await loginRequest;
    const payload = request.postDataJSON();

    expect(payload.email).toBe('user@example.com');
    expect(payload.password).toBeDefined();
  });
});

test.describe('GET /user/{userId}', () => {
  test('user data is fetched after login', async ({ page }) => {
    await seedLoggedOutState(page);
    await mockLocation(page);

    await page.route('**/user/login', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-auth-token',
          id: 'user-1',
          email: 'user@example.com',
          name: 'User QA',
        }),
      });
    });

    const userRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/user/user-1') && req.method() === 'GET',
    );

    await page.route('**/user/user-1', async (route) => {
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

    await page.route('**/board/byemail/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/communicator/byemail/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(
      '**/backoffice/system-boards/public/boards',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    await page.route(
      '**/backoffice/system-boards/public/communicators',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    await page.route('**/subscriber/user-1', async (route) => {
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

    await userRequest;
  });
});
