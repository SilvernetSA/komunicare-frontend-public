// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import BoardHeader from '../BoardHeader.component';

vi.mock('../../Output/Output', () => ({
  default: () => <div data-testid="output" />,
}));

describe('BoardHeader component', () => {
  let container: HTMLDivElement;
  let root: Root;

  const intl = createIntl(
    {
      locale: 'en',
      messages: {},
    },
    createIntlCache(),
  );

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('does not render output when hideOutputActive is true', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <IntlProvider locale="en" messages={{}}>
            <BoardHeader
              intl={intl}
              displaySettings={{ hideOutputActive: true }}
            />
          </IntlProvider>
        </MemoryRouter>,
      );
    });

    const output = container.querySelector('.Board__output');
    expect(output).toBeNull();
  });

  it('renders voice alerts and speech settings shortcut', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <IntlProvider locale="en" messages={{}}>
            <BoardHeader
              intl={intl}
              displaySettings={{ hideOutputActive: false }}
              emptyVoiceAlert
              offlineVoiceAlert
            />
          </IntlProvider>
        </MemoryRouter>,
      );
    });

    expect(container.textContent).toContain('WARNING');
    const speechLink = container.querySelector('a[href="/settings/speech"]');
    expect(speechLink).toBeTruthy();
  });
});
