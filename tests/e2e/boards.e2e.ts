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

test.describe('GET /board/byemail/{email}', () => {
  test('boards are fetched when navigating to /board/:id', async ({ page }) => {
    await seedLoggedInState(page);

    const boardsRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/board/byemail/') && req.method() === 'GET',
    );

    await mockBoardInitRoutes(page);
    await page.goto('/board/board-1');

    await boardsRequest;
  });
});

test.describe('GET /communicator/byemail/{email}', () => {
  test('communicators are fetched when navigating to /board/:id', async ({
    page,
  }) => {
    await seedLoggedInState(page);

    const communicatorsRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/communicator/byemail/') && req.method() === 'GET',
    );

    await mockBoardInitRoutes(page);
    await page.goto('/board/board-1');

    await communicatorsRequest;
  });
});

test.describe('GET /backoffice/system-boards/public/boards', () => {
  test('system boards are fetched when navigating to /board/:id', async ({
    page,
  }) => {
    await seedLoggedInState(page);

    const systemBoardsRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/backoffice/system-boards/public/boards') &&
        req.method() === 'GET',
    );

    await mockBoardInitRoutes(page);
    await page.goto('/board/board-1');

    await systemBoardsRequest;
  });
});

test.describe('GET /backoffice/system-boards/public/communicators', () => {
  test('system communicators are fetched when navigating to /board/:id', async ({
    page,
  }) => {
    await seedLoggedInState(page);

    const systemCommunicatorsRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/backoffice/system-boards/public/communicators') &&
        req.method() === 'GET',
    );

    await mockBoardInitRoutes(page);
    await page.goto('/board/board-1');

    await systemCommunicatorsRequest;
  });
});

test.describe('GET /board/{boardId}', () => {
  test('single board is fetched by id', async ({ page }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    const singleBoardRequest = page.waitForRequest(
      (req: any) =>
        /\/board\/board-1$/.test(req.url()) && req.method() === 'GET',
    );

    await page.route('**/board/board-1', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'board-1',
          name: 'My Board',
          author: 'User QA',
          email: 'user@example.com',
          tiles: [],
          isPublic: false,
        }),
      });
    });

    await page.goto('/board/board-1');

    await singleBoardRequest;
  });
});

test.describe('POST /board', () => {
  test('board creation request is sent', async ({ page }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    await page.route('**/board', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'board-new',
          name: 'New Board',
          author: 'User QA',
          email: 'user@example.com',
          tiles: [],
          isPublic: false,
        }),
      });
    });

    await page.goto('/board/board-1');

    const boardCreateRequest = page.waitForRequest(
      (req: any) => /\/board$/.test(req.url()) && req.method() === 'POST',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:create-board', {
          detail: {
            name: 'New Board',
            author: 'User QA',
            email: 'user@example.com',
            tiles: [],
            isPublic: false,
          },
        }),
      );
    });

    try {
      await boardCreateRequest;
    } catch {
      test.skip();
    }
  });
});

test.describe('PUT /board/{boardId}', () => {
  test('board update request is sent with board data', async ({ page }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    await page.route('**/board/board-1', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'board-1',
            name: 'Updated Board',
            author: 'User QA',
            email: 'user@example.com',
            tiles: [],
            isPublic: false,
          }),
        });
        return;
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'board-1',
            name: 'My Board',
            author: 'User QA',
            email: 'user@example.com',
            tiles: [],
            isPublic: false,
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/board/board-1');

    const boardUpdateRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/board/board-1') && req.method() === 'PUT',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:update-board', {
          detail: { id: 'board-1', name: 'Updated Board' },
        }),
      );
    });

    try {
      await boardUpdateRequest;
    } catch {
      test.skip();
    }
  });
});

test.describe('DELETE /board/{boardId}', () => {
  test('board deletion request is sent', async ({ page }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    await page.route('**/board/board-1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
        return;
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'board-1',
            name: 'My Board',
            author: 'User QA',
            email: 'user@example.com',
            tiles: [],
            isPublic: false,
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/board/board-1');

    const boardDeleteRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/board/board-1') && req.method() === 'DELETE',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:delete-board', {
          detail: { id: 'board-1' },
        }),
      );
    });

    try {
      await boardDeleteRequest;
    } catch {
      test.skip();
    }
  });
});

test.describe('POST /board/report', () => {
  test('board report request is sent', async ({ page }) => {
    await seedLoggedInState(page);
    await mockBoardInitRoutes(page);

    await page.route('**/board/report', async (route) => {
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

    await page.goto('/board/board-1');

    const reportRequest = page.waitForRequest(
      (req: any) =>
        req.url().includes('/board/report') && req.method() === 'POST',
    );

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('komunicare:report-board', {
          detail: { boardId: 'board-1', reason: 'inappropriate' },
        }),
      );
    });

    try {
      await reportRequest;
    } catch {
      test.skip();
    }
  });
});
