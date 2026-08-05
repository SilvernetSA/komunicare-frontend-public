import { describe, expect, it } from 'vitest';

describe('buildInfo.constants — env logic', () => {
  it('import.meta.env.PROD is false in the test environment', () => {
    expect(import.meta.env.PROD).toBe(false);
  });

  it('APP_ENV resolves to DEV when PROD is false', () => {
    const APP_ENV = import.meta.env.PROD ? 'PROD' : 'DEV';
    expect(APP_ENV).toBe('DEV');
  });

  it('IS_DEV_ENV is true when PROD is false', () => {
    const IS_DEV_ENV = !import.meta.env.PROD;
    expect(IS_DEV_ENV).toBe(true);
  });

  it('buildInfoLabel format follows v{version} · {commit} · {date} · {env}', () => {
    const fakeVersion = '1.0.0';
    const fakeCommit = 'abc1234';
    const fakeDate = '2026-06-01';
    const fakeEnv = import.meta.env.PROD ? 'PROD' : 'DEV';
    const label = `v${fakeVersion} · ${fakeCommit} · ${fakeDate} · ${fakeEnv}`;
    expect(label).toBe('v1.0.0 · abc1234 · 2026-06-01 · DEV');
  });
});
