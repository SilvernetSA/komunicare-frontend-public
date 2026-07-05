// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LoginContent, { LoginContentProps } from '../LoginContent';

const EMAIL_NOT_CONFIRMED_MSG =
  'Email not confirmed. Please confirm your account first.';

const mocks = vi.hoisted(() => ({
  formikValues: { email: '', password: '' } as {
    email: string;
    password: string;
  },
}));

vi.mock('formik', () => ({
  Formik: ({
    children,
  }: {
    children: (props: any) => React.ReactNode;
    initialValues: any;
    onSubmit: any;
    validationSchema?: any;
  }) =>
    children({
      values: mocks.formikValues,
      errors: {},
      handleChange: vi.fn(),
      handleSubmit: (e?: React.FormEvent) => e?.preventDefault?.(),
    }) as React.ReactElement,
}));

vi.mock('@mui/material', () => ({
  Typography: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} type={type ?? 'button'}>
      {children}
    </button>
  ),
  DialogContent: ({
    children,
    style,
  }: {
    children?: React.ReactNode;
    style?: React.CSSProperties;
  }) => <div style={style}>{children}</div>,
  DialogActions: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InputAdornment: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  ),
  IconButton: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

vi.mock('@mui/icons-material', () => ({
  Visibility: () => <span />,
  VisibilityOff: () => <span />,
}));

vi.mock('../../../../UI/FormItems/TextField', () => ({
  default: ({ name, label }: { name?: string; label?: string }) => (
    <input name={name} aria-label={label} />
  ),
}));

vi.mock('../../../../UI/LoadingIcon/LoadingIcon', () => ({
  default: () => <span data-testid="loading-icon" />,
}));

const defaultProps: LoginContentProps = {
  loginStatus: {},
  isLogging: false,
  isButtonDisabled: false,
  onSubmit: vi.fn(),
  onClose: vi.fn(),
  onResetPasswordClick: vi.fn(),
  onResendConfirmationEmail: vi.fn(),
};

describe('LoginContent component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    mocks.formikValues = { email: '', password: '' };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('shows the resend confirmation email button when email is not confirmed', async () => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <LoginContent
            {...defaultProps}
            loginStatus={{ message: EMAIL_NOT_CONFIRMED_MSG }}
          />
        </IntlProvider>,
      );
    });

    const resendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.toLowerCase().includes('resend'),
    );
    expect(resendButton).toBeDefined();
  });

  it('does not show the resend button for other error messages', async () => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <LoginContent
            {...defaultProps}
            loginStatus={{ message: 'Wrong email or password.' }}
          />
        </IntlProvider>,
      );
    });

    const resendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.toLowerCase().includes('resend'),
    );
    expect(resendButton).toBeUndefined();
  });

  it('does not show the resend button when there is no error', async () => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <LoginContent {...defaultProps} loginStatus={{}} />
        </IntlProvider>,
      );
    });

    const resendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.toLowerCase().includes('resend'),
    );
    expect(resendButton).toBeUndefined();
  });

  it('calls onResendConfirmationEmail with the email value when resend button is clicked', async () => {
    const onResendConfirmationEmail = vi.fn();
    mocks.formikValues = { email: 'user@example.com', password: '' };

    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <LoginContent
            {...defaultProps}
            loginStatus={{ message: EMAIL_NOT_CONFIRMED_MSG }}
            onResendConfirmationEmail={onResendConfirmationEmail}
          />
        </IntlProvider>,
      );
    });

    const resendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.toLowerCase().includes('resend'),
    ) as HTMLButtonElement;

    await act(async () => {
      resendButton.click();
    });

    expect(onResendConfirmationEmail).toHaveBeenCalledWith('user@example.com');
  });

  it('shows a loading icon while a login is in progress', async () => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <LoginContent {...defaultProps} isLogging />
        </IntlProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="loading-icon"]'),
    ).not.toBeNull();
  });

  it('hides the loading icon when not logging in', async () => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <LoginContent {...defaultProps} isLogging={false} />
        </IntlProvider>,
      );
    });

    expect(container.querySelector('[data-testid="loading-icon"]')).toBeNull();
  });
});
