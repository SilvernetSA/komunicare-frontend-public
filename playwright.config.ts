import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command:
      'pnpm start --mode test --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174/login-signup',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
