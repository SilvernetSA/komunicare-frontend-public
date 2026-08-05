// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBoardGridEditing } from '../useBoardGridEditing';

import { Board as BoardModel } from '@/types/board';

type HookParams = Parameters<typeof useBoardGridEditing>[0];

let latestHookResult: ReturnType<typeof useBoardGridEditing> | null = null;

const buildBoard = (overrides: Partial<BoardModel> = {}): BoardModel => ({
  id: 'board-1',
  name: 'Board 1',
  author: 'Owner',
  email: 'owner@example.com',
  tiles: [
    { id: 'tile-1', label: 'One' },
    { id: 'tile-2', label: 'Two' },
    { id: 'tile-3', label: 'Three' },
  ],
  grid: {
    rows: 2,
    columns: 2,
    order: [
      ['tile-1', 'tile-2'],
      ['tile-3', null],
    ],
  },
  ...overrides,
});

const buildParams = (overrides: Partial<HookParams> = {}): HookParams => ({
  activeBoard: buildBoard(),
  userEmail: 'owner@example.com',
  communicatorEmail: 'owner@example.com',
  updateBoard: vi.fn(),
  saveBoardChanges: vi.fn().mockResolvedValue(undefined),
  updateRemoteBoard: vi.fn().mockResolvedValue(buildBoard()),
  ...overrides,
});

const TestHarness = ({ params }: { params: HookParams }) => {
  latestHookResult = useBoardGridEditing(params);
  return null;
};

describe('useBoardGridEditing', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    latestHookResult = null;
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  const renderHook = (overrides: Partial<HookParams> = {}) => {
    const params = buildParams(overrides);

    act(() => {
      root.render(<TestHarness params={params} />);
    });

    expect(latestHookResult).not.toBeNull();
    return { hook: latestHookResult!, params };
  };

  it('derives board organization ownership from communicator and user emails', () => {
    const { hook } = renderHook({ communicatorEmail: 'other@example.com' });

    expect(hook.canOrganizeBoard).toBe(false);
  });

  it('debounces grid saves and persists only the latest board snapshot', () => {
    const updateRemoteBoard = vi.fn().mockResolvedValue(buildBoard());
    const { hook } = renderHook({ updateRemoteBoard });

    const boardWithThreeRows = buildBoard({
      grid: {
        rows: 3,
        columns: 2,
        order: [
          ['tile-1', 'tile-2'],
          ['tile-3', null],
          [null, null],
        ],
      },
    });
    const boardWithFourRows = buildBoard({
      grid: {
        rows: 4,
        columns: 2,
        order: [
          ['tile-1', 'tile-2'],
          ['tile-3', null],
          [null, null],
          [null, null],
        ],
      },
    });

    act(() => {
      hook.saveGridToApi(boardWithThreeRows);
      hook.saveGridToApi(boardWithFourRows);
      vi.advanceTimersByTime(599);
    });

    expect(updateRemoteBoard).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(updateRemoteBoard).toHaveBeenCalledTimes(1);
    expect(updateRemoteBoard).toHaveBeenCalledWith(boardWithFourRows);
  });

  it('updates local state and schedules a remote save when adding a row on an owned board', () => {
    const updateBoard = vi.fn();
    const updateRemoteBoard = vi.fn().mockResolvedValue(buildBoard());
    const saveBoardChanges = vi.fn().mockResolvedValue(undefined);
    const board = buildBoard();
    const { hook } = renderHook({
      activeBoard: board,
      updateBoard,
      updateRemoteBoard,
      saveBoardChanges,
    });

    act(() => {
      hook.handleAddRemoveRow(true);
    });

    const nextBoard = updateBoard.mock.calls[0]?.[0] as BoardModel;
    expect(nextBoard.grid?.rows).toBe(3);
    expect(saveBoardChanges).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(updateRemoteBoard).toHaveBeenCalledWith(nextBoard);
  });

  it('routes protected column edits through saveBoardChanges without local persistence', () => {
    const updateBoard = vi.fn();
    const updateRemoteBoard = vi.fn().mockResolvedValue(buildBoard());
    const saveBoardChanges = vi.fn().mockResolvedValue(undefined);
    const board = buildBoard({ email: 'catalog@example.com' });
    const { hook } = renderHook({
      activeBoard: board,
      userEmail: 'owner@example.com',
      updateBoard,
      updateRemoteBoard,
      saveBoardChanges,
    });

    act(() => {
      hook.handleAddRemoveColumn(false);
    });

    expect(saveBoardChanges).toHaveBeenCalledWith({
      tile: null,
      deletedTilesiIds: null,
      editedTiles: null,
      processedBoard: {
        ...board,
        grid: {
          ...board.grid!,
          columns: 1,
        },
      },
    });
    expect(updateBoard).not.toHaveBeenCalled();

    act(() => {
      vi.runAllTimers();
    });

    expect(updateRemoteBoard).not.toHaveBeenCalled();
  });

  it('reorders tiles from layout changes and keeps missing tiles appended', () => {
    const updateBoard = vi.fn();
    const updateRemoteBoard = vi.fn().mockResolvedValue(buildBoard());
    const { hook } = renderHook({ updateBoard, updateRemoteBoard });

    act(() => {
      hook.handleLayoutChange([
        { i: 'tile-3', x: 0, y: 0 },
        { i: 'tile-1', x: 1, y: 0 },
      ]);
    });

    const nextBoard = updateBoard.mock.calls[0]?.[0] as BoardModel;
    expect(nextBoard.tiles?.map((tile) => tile.id)).toEqual([
      'tile-3',
      'tile-1',
      'tile-2',
    ]);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(updateRemoteBoard).toHaveBeenCalledWith(nextBoard);
  });

  it('swaps tile positions when dropping onto another occupied cell', () => {
    const updateBoard = vi.fn();
    const updateRemoteBoard = vi.fn().mockResolvedValue(buildBoard());
    const { hook } = renderHook({ updateBoard, updateRemoteBoard });

    act(() => {
      hook.handleTileDrop({ id: 'tile-1' }, { row: 1, column: 0 });
    });

    const nextBoard = updateBoard.mock.calls[0]?.[0] as BoardModel;
    expect(nextBoard.grid?.order).toEqual([
      ['tile-3', 'tile-2'],
      ['tile-1', null],
    ]);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(updateRemoteBoard).toHaveBeenCalledWith(nextBoard);
  });
});
