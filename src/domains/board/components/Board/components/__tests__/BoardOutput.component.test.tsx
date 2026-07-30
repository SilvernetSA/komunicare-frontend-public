// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BoardOutput from '../BoardOutput';

const mocks = vi.hoisted(() => ({
  output: [] as Array<{ id: string; label: string; vocalization: string }>,
  changeOutput: vi.fn(),
  voices: [] as Array<{ name: string; voiceURI: string }>,
  options: { voiceURI: '' } as { voiceURI: string },
  speak: vi.fn(),
}));

vi.mock('../../../../store/boardsStore', () => ({
  useBoardsStore: (selector: (s: any) => any) =>
    selector({
      output: mocks.output,
      changeOutput: mocks.changeOutput,
    }),
}));

vi.mock('../../../../store/voicesStore', () => ({
  useSpeechStore: (selector: (s: any) => any) =>
    selector({
      voices: mocks.voices,
      options: mocks.options,
    }),
}));

vi.mock('../../../../store/communicatorsStore', () => ({
  useCommunicatorsStore: vi.fn(),
}));

vi.mock('../../../../providers/SpeechProvider/speechService', () => ({
  speak: (...args: any[]) => mocks.speak(...args),
}));

vi.mock('@mui/material/Paper', () => ({
  default: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
    elevation?: number;
  }) => <div className={className}>{children}</div>,
}));

vi.mock('@mui/material/IconButton', () => ({
  default: ({
    children,
    onClick,
    disabled,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} type="button">
      {children}
    </button>
  ),
}));

vi.mock('@mui/icons-material/Clear', () => ({
  default: () => <span data-testid="clear-icon" />,
}));

vi.mock('@mui/icons-material/VolumeUp', () => ({
  default: () => <span data-testid="volume-icon" />,
}));

describe('BoardOutput component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    mocks.output = [];
    mocks.changeOutput.mockReset();
    mocks.voices = [];
    mocks.options = { voiceURI: '' };
    mocks.speak.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('shows placeholder text when output is empty', async () => {
    await act(async () => {
      root.render(<BoardOutput />);
    });

    expect(container.textContent).toContain(
      'Select tiles to build a sentence...',
    );
  });

  it('renders tile labels joined by spaces', async () => {
    mocks.output = [
      { id: '1', label: 'Hello', vocalization: '' },
      { id: '2', label: 'World', vocalization: '' },
    ];

    await act(async () => {
      root.render(<BoardOutput />);
    });

    expect(container.querySelector('.Board__Output__Text')?.textContent).toBe(
      'Hello World',
    );
  });

  it('calls changeOutput([]) when the clear button is clicked', async () => {
    mocks.output = [{ id: '1', label: 'Hello', vocalization: '' }];

    await act(async () => {
      root.render(<BoardOutput />);
    });

    const clearButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.querySelector('[data-testid="clear-icon"]'),
    );

    await act(async () => {
      clearButton?.click();
    });

    expect(mocks.changeOutput).toHaveBeenCalledWith([]);
  });

  it('disables the clear button when output is empty', async () => {
    mocks.output = [];

    await act(async () => {
      root.render(<BoardOutput />);
    });

    const clearButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.querySelector('[data-testid="clear-icon"]'),
    ) as HTMLButtonElement;

    expect(clearButton?.disabled).toBe(true);
  });

  it('disables the speak button when there are no voices', async () => {
    mocks.output = [{ id: '1', label: 'Hello', vocalization: '' }];
    mocks.voices = [];

    await act(async () => {
      root.render(<BoardOutput />);
    });

    const speakButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.querySelector('[data-testid="volume-icon"]'),
    ) as HTMLButtonElement;

    expect(speakButton?.disabled).toBe(true);
  });

  it('enables the speak button when voices are available and output exists', async () => {
    mocks.output = [{ id: '1', label: 'Hello', vocalization: '' }];
    mocks.voices = [{ name: 'Voice 1', voiceURI: 'voice-1' }];
    mocks.options = { voiceURI: 'voice-1' };

    await act(async () => {
      root.render(<BoardOutput />);
    });

    const speakButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.querySelector('[data-testid="volume-icon"]'),
    ) as HTMLButtonElement;

    expect(speakButton?.disabled).toBe(false);
  });

  it('calls speak with the joined tile text when the speak button is clicked', async () => {
    mocks.output = [
      { id: '1', label: 'Hello', vocalization: '' },
      { id: '2', label: 'World', vocalization: '' },
    ];
    mocks.voices = [{ name: 'Voice 1', voiceURI: 'voice-1' }];
    mocks.options = { voiceURI: 'voice-1' };

    await act(async () => {
      root.render(<BoardOutput />);
    });

    const speakButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.querySelector('[data-testid="volume-icon"]'),
    );

    await act(async () => {
      speakButton?.click();
    });

    expect(mocks.speak).toHaveBeenCalledWith('Hello World');
  });
});
