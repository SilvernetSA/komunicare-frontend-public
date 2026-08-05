// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOutputController } from '../useOutputController';

import type { Tile } from '@/types/board';
import type { IntlShape } from 'react-intl';

const mocks = vi.hoisted(() => {
  const subscribers = new Set<(state: any) => void>();
  const state = {
    output: [] as Tile[],
    improvedPhrase: '',
    improvedPhraseSource: '',
  };

  return {
    state,
    subscribers,
    changeOutput: vi.fn(),
    changeScreenKeyboardMode: vi.fn(),
    showNotification: vi.fn(),
    speak: vi.fn((_text: string, resolve?: () => void) => resolve?.()),
    cancelSpeech: vi.fn(),
    emitState(nextState: Partial<typeof state>) {
      Object.assign(state, nextState);
      subscribers.forEach((listener) => listener(state));
    },
    resetState() {
      state.output = [];
      state.improvedPhrase = '';
      state.improvedPhraseSource = '';
      subscribers.clear();
      this.changeOutput.mockReset();
      this.changeScreenKeyboardMode.mockReset();
      this.showNotification.mockReset();
      this.speak.mockReset();
      this.speak.mockImplementation((_text: string, resolve?: () => void) =>
        resolve?.(),
      );
      this.cancelSpeech.mockReset();
    },
  };
});

vi.mock('@/domains/board/stores/boardsStore', () => {
  const useBoardsStore = Object.assign(
    (selector: (state: any) => any) => selector(mocks.state),
    {
      getState: () => mocks.state,
      subscribe: (listener: (state: any) => void) => {
        mocks.subscribers.add(listener);
        return () => {
          mocks.subscribers.delete(listener);
        };
      },
    },
  );

  return { useBoardsStore };
});

vi.mock('@/providers/SpeechProvider/speechService', () => ({
  speak: (...args: any[]) => mocks.speak(...args),
  cancelSpeech: (...args: any[]) => mocks.cancelSpeech(...args),
}));

type HookParams = Parameters<typeof useOutputController>[0];

let latestHookResult: ReturnType<typeof useOutputController> | null = null;

const intl = {
  messages: {
    'test.label': 'Hola',
    'board.copyMessage': 'Copied',
    'board.failedToCopy': 'Copy failed',
  },
  formatMessage: ({ id }: { id: string }) =>
    ({
      'test.label': 'Hola',
      'board.copyMessage': 'Copied',
      'board.failedToCopy': 'Copy failed',
    })[id] || id,
} as unknown as IntlShape;

const navigationSettings = {
  improvePhraseActive: true,
  liveMode: true,
  removeOutputActive: false,
} as any;

const createTile = (overrides: Partial<Tile> = {}): Tile => ({
  id: 'tile-1',
  label: 'hola',
  type: 'button',
  ...overrides,
});

const TestHarness = ({ params }: { params: HookParams }) => {
  latestHookResult = useOutputController(params);
  return null;
};

describe('useOutputController', () => {
  let container: HTMLDivElement;
  let root: Root;

  const buildParams = (overrides: Partial<HookParams> = {}): HookParams => ({
    improvedPhrase: '',
    intl,
    output: [],
    isLiveMode: false,
    isScreenKeyboardMode: false,
    navigationSettings,
    changeOutput: mocks.changeOutput,
    changeScreenKeyboardMode: mocks.changeScreenKeyboardMode,
    showNotification: mocks.showNotification,
    ...overrides,
  });

  const renderHook = async (overrides: Partial<HookParams> = {}) => {
    const params = buildParams(overrides);

    await act(async () => {
      root.render(<TestHarness params={params} />);
    });

    expect(latestHookResult).not.toBeNull();
    return latestHookResult!;
  };

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    latestHookResult = null;
    mocks.resetState();
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

  it('translates output labels and writes textarea edits back immediately', async () => {
    const output = [createTile({ label: 'fallback', labelKey: 'test.label' })];
    mocks.state.output = output;

    await renderHook({ output });

    expect(latestHookResult!.translatedOutput[0]?.label).toBe('Hola');
    expect(latestHookResult!.tabIndex).toBe('0');

    act(() => {
      latestHookResult!.handleWriteSymbol(0)({
        target: { value: 'chau' },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(mocks.changeOutput).toHaveBeenCalledWith([
      expect.objectContaining({ label: 'chau', labelKey: 'test.label' }),
    ]);
    expect(latestHookResult!.translatedOutput[0]?.label).toBe('Hola');
  });

  it('waits for the current improved phrase before speaking it', async () => {
    const output = [createTile({ label: 'hola' })];
    mocks.state.output = output;

    await renderHook({ output });

    let playPromise: Promise<void> | undefined;
    await act(async () => {
      playPromise = latestHookResult!.handlePlayOutputClick();
      await Promise.resolve();
    });

    expect(latestHookResult!.isPlaying).toBe(true);
    expect(mocks.speak).not.toHaveBeenCalled();

    await act(async () => {
      mocks.emitState({
        improvedPhrase: '\"Hola mundo\"',
        improvedPhraseSource: 'hola',
      });
      await playPromise!;
    });

    expect(mocks.speak).toHaveBeenCalledWith(
      'Hola mundo',
      expect.any(Function),
    );
    expect(latestHookResult!.isPlaying).toBe(false);
  });

  it('skips speaking a stale improved phrase when output changes during the wait', async () => {
    const output = [createTile({ label: 'hola' })];
    mocks.state.output = output;

    await renderHook({ output });

    let playPromise: Promise<void> | undefined;
    await act(async () => {
      playPromise = latestHookResult!.handlePlayOutputClick();
      await Promise.resolve();
    });

    await act(async () => {
      mocks.emitState({
        output: [createTile({ id: 'tile-2', label: 'chau' })],
      });
      mocks.emitState({
        improvedPhrase: 'Hola mundo',
        improvedPhraseSource: 'hola',
      });
      await playPromise!;
    });

    expect(mocks.speak).not.toHaveBeenCalled();
    expect(latestHookResult!.isPlaying).toBe(false);
  });

  it('adds a live tile before switching to the screen keyboard when needed', async () => {
    const output = [createTile({ label: 'hola' })];
    mocks.state.output = output;

    await renderHook({ output, isScreenKeyboardMode: false });

    act(() => {
      latestHookResult!.handleSwitchScreenKeyboard();
    });

    expect(mocks.changeOutput).toHaveBeenCalledTimes(1);
    const nextOutput = mocks.changeOutput.mock.calls[0][0] as Tile[];
    expect(nextOutput).toHaveLength(2);
    expect(nextOutput[1]?.type).toBe('live');
    expect(mocks.changeScreenKeyboardMode).toHaveBeenCalledTimes(1);
  });
});
