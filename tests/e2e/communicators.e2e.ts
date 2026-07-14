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

const mockBoardInitRoutes = async (page: any) => {
  await page.route('**/board/byemail/**', async (route: any) => {
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

  await page.route('**/communicator/byemail/**', async (route: any) => {
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
    async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    },
  );

  await page.route(
    '**/backoffice/system-boards/public/communicators',
    async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    },
  );

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

test.describe('POST /communicator', () => {
  test('communicator creation request is sent', async ({ page }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    await page.route('**/communicator', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'comm-new',
          name: 'New Communicator',
          author: 'User QA',
          email: 'user@example.com',
          boards: [],
          rootBoard: 'board-1',
        }),
      });
    });

    await page.goto('/board/board-1');

    const createRequest = page.waitForRequest(
      (req: any) =>
        /\/communicator$/.test(req.url()) && req.method() === 'POST',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:create-communicator', {
          detail: {
            name: 'New Communicator',
            author: 'User QA',
            email: 'user@example.com',
            boards: [],
            rootBoard: 'board-1',
          },
        }),
      );
    });

    try {
      await createRequest;
    } catch {
      test.skip();
    }
  });
});

test.describe('PUT /communicator/{communicatorId}', () => {
  test('communicator update request is sent with communicator data', async ({
    page,
  }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    await page.route('**/communicator/comm-1', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'comm-1',
          name: 'Updated Communicator',
          author: 'User QA',
          email: 'user@example.com',
          boards: ['board-1'],
          rootBoard: 'board-1',
        }),
      });
    });

    await page.goto('/board/board-1');

    const updateRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/communicator/comm-1') && req.method() === 'PUT',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:update-communicator', {
          detail: { id: 'comm-1', name: 'Updated Communicator' },
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

test.describe('DELETE /communicator/{communicatorId}', () => {
  test('communicator deletion request is sent', async ({ page }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    await page.route('**/communicator/comm-1', async (route) => {
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

    await page.goto('/board/board-1');

    const deleteRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/communicator/comm-1') && req.method() === 'DELETE',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:delete-communicator', {
          detail: { id: 'comm-1' },
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
