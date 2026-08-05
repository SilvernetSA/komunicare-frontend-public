// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NavigationButtons from '../NavigationButtons';

describe('NavigationButtons', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('hides the side previous button when there is no back history', async () => {
    await act(async () => {
      root.render(
        <NavigationButtons
          active
          navHistory={['root']}
          previousBoard={vi.fn()}
          toRootBoard={vi.fn()}
          isSaving={false}
          isNavigationButtonsOnTheSide
          hasBackHistory={false}
          hasRootHistory={false}
        />,
      );
    });

    expect(container.querySelector('.SideButtonPreviousBoard')).toBeNull();
  });

  it('keeps the side previous button visible when back history exists', async () => {
    await act(async () => {
      root.render(
        <NavigationButtons
          active
          navHistory={['root', 'child']}
          previousBoard={vi.fn()}
          toRootBoard={vi.fn()}
          isSaving={false}
          isNavigationButtonsOnTheSide
          hasBackHistory
          hasRootHistory={false}
        />,
      );
    });

    expect(container.querySelector('.SideButtonPreviousBoard')).not.toBeNull();
  });

  it('hides the previous button on the root board even if nav history still has entries', async () => {
    await act(async () => {
      root.render(
        <NavigationButtons
          active
          navHistory={['root', 'child', 'root']}
          previousBoard={vi.fn()}
          toRootBoard={vi.fn()}
          isSaving={false}
          isNavigationButtonsOnTheSide
          hasBackHistory={false}
          hasRootHistory
        />,
      );
    });

    expect(container.querySelector('.SideButtonPreviousBoard')).toBeNull();
  });
});
