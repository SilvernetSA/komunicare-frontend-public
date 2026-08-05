// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  handleSelectionConfirmDelete,
  useBoardSelectionController,
} from '../useBoardSelectionController';

let latestHookResult: ReturnType<typeof useBoardSelectionController> | null =
  null;

const activeBoard = {
  id: 'board-1',
  tiles: [
    { id: 'tile-1', label: 'One' },
    { id: 'tile-2', label: 'Two' },
  ],
} as any;

const TestHarness = ({ board = activeBoard }: { board?: any }) => {
  latestHookResult = useBoardSelectionController({ activeBoard: board });
  return null;
};

describe('useBoardSelectionController', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    latestHookResult = null;
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

  const renderHook = (board?: any) => {
    act(() => {
      root.render(<TestHarness board={board} />);
    });

    expect(latestHookResult).not.toBeNull();
    return latestHookResult!;
  };

  it('toggles selection mode and resets selected tile ids', () => {
    const hook = renderHook();

    act(() => {
      hook.setSelectedTileIds(['tile-1']);
    });

    act(() => {
      latestHookResult!.handleSelectAllToggle();
    });

    expect(latestHookResult).toMatchObject({
      isSelecting: false,
      isSelectAll: true,
      selectedTileIds: ['tile-1', 'tile-2'],
    });

    act(() => {
      latestHookResult!.handleSelectClick();
    });

    expect(latestHookResult).toMatchObject({
      isSelecting: true,
      isSelectAll: false,
      selectedTileIds: [],
    });
  });

  it('toggles select-all using the active board tiles', () => {
    renderHook();

    act(() => {
      latestHookResult!.handleSelectAllToggle();
    });

    expect(latestHookResult).toMatchObject({
      isSelectAll: true,
      selectedTileIds: ['tile-1', 'tile-2'],
    });

    act(() => {
      latestHookResult!.handleSelectAllToggle();
    });

    expect(latestHookResult).toMatchObject({
      isSelectAll: false,
      selectedTileIds: [],
    });
  });

  it('opens delete confirmation only when there is an active board and selected tiles', () => {
    renderHook();

    act(() => {
      latestHookResult!.handleDeleteClick();
    });

    expect(latestHookResult!.confirmDeleteOpen).toBe(false);

    act(() => {
      latestHookResult!.setSelectedTileIds(['tile-1']);
    });

    act(() => {
      latestHookResult!.handleDeleteClick();
    });

    expect(latestHookResult!.confirmDeleteOpen).toBe(true);
  });

  it('derives editing tiles and clears them when cancelling the editor', () => {
    renderHook();

    act(() => {
      latestHookResult!.setSelectedTileIds(['tile-2']);
      latestHookResult!.setTileEditorOpen(true);
      latestHookResult!.setIsSelecting(true);
    });

    expect(latestHookResult).toMatchObject({
      isSelecting: true,
      tileEditorOpen: true,
    });
    expect(latestHookResult!.editingTiles).toEqual([
      { id: 'tile-2', label: 'Two' },
    ]);

    act(() => {
      latestHookResult!.handleTileEditorCancel();
    });

    expect(latestHookResult).toMatchObject({
      isSelecting: false,
      tileEditorOpen: false,
      selectedTileIds: [],
    });
    expect(latestHookResult!.editingTiles).toEqual([]);
  });
});

describe('handleSelectionConfirmDelete', () => {
  const intl = {
    formatMessage: vi.fn((message: { id?: string }) => message.id || 'message'),
  } as any;

  it('deletes locally for anonymous users and clears the selection', async () => {
    const deleteTilesAction = vi.fn();
    const setConfirmDeleteOpen = vi.fn();
    const setSelectedTileIds = vi.fn();
    const setIsSelecting = vi.fn();
    const showNotification = vi.fn();

    await handleSelectionConfirmDelete({
      activeBoard,
      selectedTileIds: ['tile-1', 'tile-2'],
      deleteTilesAction,
      saveBoardChanges: vi.fn(),
      setConfirmDeleteOpen,
      setSelectedTileIds,
      setIsSelecting,
      showNotification,
      intl,
    });

    expect(setConfirmDeleteOpen).toHaveBeenCalledWith(false);
    expect(deleteTilesAction).toHaveBeenCalledWith({
      boardId: 'board-1',
      tileIds: ['tile-1', 'tile-2'],
    });
    expect(setSelectedTileIds).toHaveBeenCalledWith([]);
    expect(setIsSelecting).toHaveBeenCalledWith(false);
    expect(showNotification).toHaveBeenCalledTimes(1);
  });

  it('keeps selection when the persisted delete fails', async () => {
    const deleteTilesAction = vi.fn();
    const saveBoardChanges = vi.fn().mockResolvedValue(false);
    const setConfirmDeleteOpen = vi.fn();
    const setSelectedTileIds = vi.fn();
    const setIsSelecting = vi.fn();
    const showNotification = vi.fn();

    await handleSelectionConfirmDelete({
      activeBoard,
      selectedTileIds: ['tile-1'],
      userEmail: 'user@example.com',
      deleteTilesAction,
      saveBoardChanges,
      setConfirmDeleteOpen,
      setSelectedTileIds,
      setIsSelecting,
      showNotification,
      intl,
    });

    expect(saveBoardChanges).toHaveBeenCalledWith({
      tile: null,
      deletedTilesiIds: ['tile-1'],
      editedTiles: null,
      processedBoard: null,
    });
    expect(deleteTilesAction).not.toHaveBeenCalled();
    expect(setSelectedTileIds).not.toHaveBeenCalled();
    expect(setIsSelecting).not.toHaveBeenCalled();
    expect(showNotification).toHaveBeenCalledTimes(1);
  });
});
