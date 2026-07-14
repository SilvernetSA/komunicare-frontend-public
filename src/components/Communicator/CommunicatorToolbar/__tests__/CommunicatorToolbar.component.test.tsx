// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CommunicatorToolbar from '../CommunicatorToolbar';

const mocks = vi.hoisted(() => ({
  formDialogOpenStates: [] as boolean[],
  navigate: vi.fn(),
  switchBoard: vi.fn(),
  fetchUserBoards: vi.fn(),
  changeCommunicator: vi.fn(),
  activeBoardId: 'board-root',
  activeCommunicatorId: 'comm-1',
  boards: [] as any[],
  communicators: [] as any[],
  userEmail: 'owner@example.com' as string | undefined,
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../DefaultBoardSelector/DefaultBoardSelector', () => ({
  default: () => <div data-testid="default-board-selector" />,
}));

vi.mock('../../../UI/FormDialog/FormDialog', () => ({
  default: ({
    open,
    children,
  }: {
    open: boolean;
    children?: React.ReactNode;
  }) => {
    mocks.formDialogOpenStates.push(open);
    return open ? <div data-testid="form-dialog">{children}</div> : null;
  },
}));

vi.mock('@mui/material/Menu', () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="boards-menu">{children}</div>
  ),
}));

vi.mock('@mui/material/Button', () => ({
  default: ({
    children,
    className,
    disabled,
    id,
    onClick,
  }: {
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    id?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <button
      className={className}
      disabled={disabled}
      id={id}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  ),
}));

vi.mock('@mui/material/ListItem', () => ({
  default: ({
    className,
    children,
    onClick,
  }: {
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button className={className} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

vi.mock('@mui/material/ListItemText', () => ({
  default: ({
    primary,
    secondary,
  }: {
    primary?: React.ReactNode;
    secondary?: React.ReactNode;
  }) => (
    <div>
      <span>{primary}</span>
      <span>{secondary}</span>
    </div>
  ),
}));

vi.mock('../../../../store/boardsStore', () => ({
  useBoardsStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        boards: mocks.boards,
        activeBoardId: mocks.activeBoardId,
        switchBoard: mocks.switchBoard,
      }),
    {
      getState: () => ({
        switchBoard: mocks.switchBoard,
        fetchUserBoards: mocks.fetchUserBoards,
      }),
    },
  ),
}));

vi.mock('../../../../store/communicatorsStore', () => {
  const useCommunicatorsStore = Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        communicators: mocks.communicators,
        activeCommunicatorId: mocks.activeCommunicatorId,
      }),
    {
      getState: () => ({
        changeCommunicator: mocks.changeCommunicator,
        updateRemoteCommunicator: vi.fn(),
        upsertCommunicator: vi.fn(),
      }),
    },
  );

  return { useCommunicatorsStore };
});

vi.mock('../../../../store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      userData: {
        email: mocks.userEmail,
      },
      displaySettings: {
        darkThemeActive: false,
      },
    }),
}));

vi.mock('../../../../store/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      showNotification: vi.fn(),
    }),
  },
}));

describe('CommunicatorToolbar component', () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderToolbar = async (
    props: React.ComponentProps<typeof CommunicatorToolbar> = {},
  ) => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <CommunicatorToolbar {...props} />
        </IntlProvider>,
      );
    });
  };

  const getMenuItems = () =>
    Array.from(container.querySelectorAll('.CommunicatorToolbar__menuitem'));

  const getMenuTexts = () =>
    getMenuItems().map((item) => item.textContent || '');

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    mocks.formDialogOpenStates = [];
    mocks.navigate.mockReset();
    mocks.switchBoard.mockReset();
    mocks.changeCommunicator.mockReset();
    mocks.fetchUserBoards.mockReset();
    mocks.activeBoardId = 'board-root';
    mocks.activeCommunicatorId = 'comm-1';
    mocks.userEmail = 'owner@example.com';
    mocks.boards = [
      {
        id: 'board-root',
        name: 'Inicio',
        email: 'owner@example.com',
        hidden: false,
        tiles: [{ id: 't-root' }],
      },
      {
        id: 'board-food',
        name: 'Food',
        email: 'owner@example.com',
        hidden: false,
        tiles: [],
      },
      {
        id: 'board-other',
        name: 'Other Board',
        email: 'other@example.com',
        hidden: false,
        tiles: [{ id: 't-other' }],
      },
    ];
    mocks.communicators = [
      {
        id: 'comm-1',
        name: 'Komunicare',
        rootBoard: 'board-root',
        boards: ['board-root', 'board-food'],
      },
    ];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('lists only boards owned by the logged-in user in the boards menu', async () => {
    await renderToolbar();

    const menuTexts = getMenuTexts();

    // Only boards with email matching 'owner@example.com'
    expect(menuTexts).toHaveLength(2);
    expect(menuTexts[0]).toContain('Inicio');
    expect(menuTexts[1]).toContain('Food');
  });

  it('does not render boards from other users', async () => {
    await renderToolbar();

    const menuTexts = getMenuTexts().join(' ');

    expect(menuTexts).not.toContain('Other Board');
  });

  it('navigates to the selected board on click', async () => {
    await renderToolbar();

    const menuItems = getMenuItems();

    await act(async () => {
      (menuItems[1] as HTMLButtonElement).click();
    });

    expect(mocks.switchBoard).toHaveBeenCalledWith('board-food');
    expect(mocks.navigate).toHaveBeenCalledWith('/board/board-food', {
      replace: true,
    });
  });

  it('fetches user boards on mount when user is logged in', async () => {
    await renderToolbar();

    expect(mocks.fetchUserBoards).toHaveBeenCalledTimes(1);
  });

  it('disables boards dropdown when the user is not logged in', async () => {
    mocks.userEmail = '';

    await renderToolbar();

    const boardsButton = container.querySelector(
      '#boards-button',
    ) as HTMLButtonElement;
    expect(boardsButton.disabled).toBe(true);
  });

  it('disables boards dropdown when selecting mode is active', async () => {
    await renderToolbar({ isSelecting: true });

    const boardsButton = container.querySelector(
      '#boards-button',
    ) as HTMLButtonElement;
    expect(boardsButton.disabled).toBe(true);
  });
});
