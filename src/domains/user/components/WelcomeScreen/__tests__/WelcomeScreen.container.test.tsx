// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WelcomeScreen from '../WelcomeScreen';

vi.mock('../KomunicareLogo/KomunicareLogo.component', () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock('../Information/Information', () => ({
  default: ({ heading, text }: { heading?: string; text?: string }) => (
    <div data-testid="info">{`${heading || ''}${text || ''}`}</div>
  ),
}));

vi.mock('../../Account/Login/Login.component', () => ({
  default: ({ isDialogOpen }: { isDialogOpen: boolean }) => (
    <div data-testid="login-dialog" data-open={String(isDialogOpen)} />
  ),
}));

vi.mock('../../Account/ResetPassword/ResetPassword.component', () => ({
  default: ({ isDialogOpen }: { isDialogOpen: boolean }) => (
    <div data-testid="forgot-dialog" data-open={String(isDialogOpen)} />
  ),
}));

vi.mock('../../Account/SignUp/SignUp.component', () => ({
  default: ({ isDialogOpen }: { isDialogOpen: boolean }) => (
    <div data-testid="signup-dialog" data-open={String(isDialogOpen)} />
  ),
}));

describe('WelcomeScreen dialogs', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  const renderComponent = async () => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <WelcomeScreen heading="Welcome" text="Komunicare" />
        </IntlProvider>,
      );
    });
  };

  it('renders login button and keeps login dialog closed initially', async () => {
    await renderComponent();

    expect(
      container.querySelector('.WelcomeScreen__button--login'),
    ).toBeTruthy();
    expect(
      container
        .querySelector('[data-testid="login-dialog"]')
        ?.getAttribute('data-open'),
    ).toBe('false');
  });

  it('signup button and dialog are hidden while SIGN_UP_ENABLED is false', async () => {
    await renderComponent();

    // Signup is disabled until Mercado Pago flow is fully validated.
    expect(
      container.querySelector('.WelcomeScreen__button--signup'),
    ).toBeNull();
    expect(container.querySelector('[data-testid="signup-dialog"]')).toBeNull();
  });

  it('opens login dialog when login button is clicked', async () => {
    await renderComponent();

    const loginDialog = container.querySelector(
      '[data-testid="login-dialog"]',
    ) as HTMLElement;
    expect(loginDialog.getAttribute('data-open')).toBe('false');

    const loginButton = container.querySelector(
      '.WelcomeScreen__button--login',
    ) as HTMLButtonElement;
    await act(async () => {
      loginButton.click();
    });

    expect(loginDialog.getAttribute('data-open')).toBe('true');
  });
});
