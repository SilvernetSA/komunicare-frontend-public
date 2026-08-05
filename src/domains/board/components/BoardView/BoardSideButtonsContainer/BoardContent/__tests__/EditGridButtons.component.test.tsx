// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EditGridButtons from '../EditGridButtons.component';

describe('EditGridButtons', () => {
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

  const renderButtons = () => {
    const onAddRemoveRow = vi.fn();
    const onAddRemoveColumn = vi.fn();
    act(() => {
      root.render(
        <EditGridButtons
          active
          rows={3}
          columns={4}
          onAddRemoveRow={onAddRemoveRow}
          onAddRemoveColumn={onAddRemoveColumn}
        />,
      );
    });
    return { onAddRemoveRow, onAddRemoveColumn };
  };

  const click = (label: string) => {
    const button = document.querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    );
    expect(button).not.toBeNull();
    act(() => {
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };

  // Stepper convention: up/right increment, down/left decrement. The rows
  // control used to be inverted (the down-arrow added a row).
  it('increments rows with the up arrow and decrements with the down arrow', () => {
    const { onAddRemoveRow } = renderButtons();

    click('add_row');
    expect(onAddRemoveRow).toHaveBeenLastCalledWith('add');

    click('remove_row');
    expect(onAddRemoveRow).toHaveBeenLastCalledWith('remove');
  });

  it('increments columns with the right arrow and decrements with the left arrow', () => {
    const { onAddRemoveColumn } = renderButtons();

    click('add_column');
    expect(onAddRemoveColumn).toHaveBeenLastCalledWith('add');

    click('remove_column');
    expect(onAddRemoveColumn).toHaveBeenLastCalledWith('remove');
  });
});
