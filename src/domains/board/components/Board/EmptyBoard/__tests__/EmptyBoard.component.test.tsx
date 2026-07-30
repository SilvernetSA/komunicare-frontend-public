// @vitest-environment jsdom
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import EmptyBoard from '../EmptyBoard.component';

describe('EmptyBoard component', () => {
  let container: HTMLDivElement;
  let root: Root;

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

  it('renders empty board message with theme background', async () => {
    const theme = createTheme({
      palette: {
        background: {
          default: '#123456',
        },
      },
    });

    await act(async () => {
      root.render(
        <ThemeProvider theme={theme}>
          <IntlProvider locale="en" messages={{}}>
            <EmptyBoard />
          </IntlProvider>
        </ThemeProvider>,
      );
    });

    const emptyBoard = container.querySelector('.EmptyBoard') as HTMLElement;
    expect(emptyBoard).toBeTruthy();
    expect(emptyBoard.textContent).toContain('This board is empty');
    expect(emptyBoard.style.background).toContain('rgb');
  });
});
