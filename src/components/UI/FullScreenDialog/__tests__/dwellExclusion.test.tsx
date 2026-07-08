// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import FullScreenDialog from '../FullScreenDialog';

// Verifies the face-tracking dwell exclusion: any interactive control rendered
// inside a FullScreenDialog must sit under a [data-dwell="off"] ancestor, so the
// dwell engine (which does closest('[data-dwell="off"]')) skips it.

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('FullScreenDialog dwell exclusion', () => {
  it('places dialog content inside a [data-dwell="off"] subtree', () => {
    act(() => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <FullScreenDialog open title="Settings">
            <button type="button" data-testid="inner-btn">
              inner control
            </button>
          </FullScreenDialog>
        </IntlProvider>,
      );
    });

    // MUI Dialog portals to document.body, so query the whole document.
    const innerBtn = document.querySelector(
      '[data-testid="inner-btn"]',
    ) as HTMLElement;
    expect(innerBtn).not.toBeNull();

    // The dwell engine's exclusion check: closest('[data-dwell="off"]').
    expect(innerBtn.closest('[data-dwell="off"]')).not.toBeNull();
  });
});
