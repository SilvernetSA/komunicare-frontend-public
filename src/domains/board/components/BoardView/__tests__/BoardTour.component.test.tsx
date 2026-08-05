// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IntlProvider, createIntl, createIntlCache } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BoardTour from '../BoardTour';

const mocks = vi.hoisted(() => ({
  boards: [] as any[],
  activeBoardId: 'active-board' as string | undefined,
  communicators: [] as any[],
  activeCommunicatorId: '',
  userEmail: 'user@example.com',
  lastDefaultGalleryProps: null as any,
  lastJoyrideSteps: [] as Array<{ target: string; content: React.ReactNode }>,
}));

vi.mock('react-joyride', () => ({
  default: ({
    run,
    steps,
  }: {
    run?: boolean;
    steps: Array<{ content: React.ReactNode }>;
  }) => {
    mocks.lastJoyrideSteps = steps as Array<{
      target: string;
      content: React.ReactNode;
    }>;
    return run ? <div data-testid="joyride">{steps[0]?.content}</div> : null;
  },
  STATUS: {
    FINISHED: 'finished',
    SKIPPED: 'skipped',
  },
}));

vi.mock(
  '@/domains/communicator/components/Communicator/CommunicatorToolbar/DefaultBoardSelector/DefaultBoardsGallery',
  () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      mocks.lastDefaultGalleryProps = props;
      return (
        <button
          type="button"
          data-testid="default-gallery"
          onClick={() =>
            (props.onOptionClick as Function)('official-communicator')
          }
        >
          Default gallery
        </button>
      );
    },
    CustomBoardsGallery: () => (
      <div data-testid="custom-gallery">Custom gallery</div>
    ),
  }),
);

vi.mock('@/domains/app/stores/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      userData: {
        email: mocks.userEmail,
      },
    }),
}));

vi.mock('@/domains/board/stores/boardsStore', () => ({
  useBoardsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      boards: mocks.boards,
      activeBoardId: mocks.activeBoardId,
    }),
}));

vi.mock('@/domains/communicator/stores/communicatorsStore', () => ({
  useCommunicatorsStore: (
    selector: (state: Record<string, unknown>) => unknown,
  ) =>
    selector({
      communicators: mocks.communicators,
      activeCommunicatorId: mocks.activeCommunicatorId,
    }),
}));

describe('BoardTour component', () => {
  let container: HTMLDivElement;
  let root: Root;
  let extraTourTargets: HTMLElement[];

  const intl = createIntl(
    {
      locale: 'en',
      messages: {},
    },
    createIntlCache(),
  );

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    mocks.boards = [];
    mocks.activeBoardId = 'active-board';
    mocks.communicators = [];
    mocks.activeCommunicatorId = '';
    mocks.userEmail = 'user@example.com';
    mocks.lastDefaultGalleryProps = null;
    mocks.lastJoyrideSteps = [];
    extraTourTargets = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    extraTourTargets.forEach((node) => node.remove());
    container.remove();
  });

  const addTourTarget = (tourId: string) => {
    const node = document.createElement('button');
    node.setAttribute('data-tour-id', tourId);
    document.body.appendChild(node);
    extraTourTargets.push(node);
  };

  it('starts first-login onboarding on the official communicator gallery', async () => {
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <BoardTour
            isLocked={true}
            isRootBoardTourEnabled={true}
            disableTour={vi.fn()}
            intl={intl}
            onDefaultBoardOptionClick={vi.fn()}
          />
        </IntlProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="default-gallery"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="custom-gallery"]'),
    ).toBeNull();
    expect(mocks.lastDefaultGalleryProps?.layout).toBe('grid');
  });

  it('closes the first-login tour as soon as a communicator is selected', async () => {
    const disableTour = vi.fn();
    const onDefaultBoardOptionClick = vi.fn();

    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <BoardTour
            isLocked={true}
            isRootBoardTourEnabled={true}
            disableTour={disableTour}
            intl={intl}
            onDefaultBoardOptionClick={onDefaultBoardOptionClick}
          />
        </IntlProvider>,
      );
    });

    await act(async () => {
      container
        .querySelector('[data-testid="default-gallery"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(disableTour).toHaveBeenCalledWith({ isRootBoardTourEnabled: false });
    expect(onDefaultBoardOptionClick).toHaveBeenCalledWith(
      'official-communicator',
    );
  });

  it('orders the unlocked tour around the rewritten toolbar and floating controls', async () => {
    [
      'toolbar-communicator-dialog',
      'toolbar-create-communicator',
      'toolbar-my-boards',
      'toolbar-default-communicator-switcher',
      'toolbar-ask-ai',
      'toolbar-organize-pictograms',
      'toolbar-add-content',
      'toolbar-fullscreen',
      'toolbar-notifications',
      'toolbar-settings',
      'toolbar-account',
      'toolbar-share',
      'floating-play',
      'floating-clear',
      'toolbar-lock',
    ].forEach(addTourTarget);

    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <BoardTour
            isLocked={false}
            isUnlockedTourEnabled={true}
            disableTour={vi.fn()}
            intl={intl}
            onDefaultBoardOptionClick={vi.fn()}
          />
        </IntlProvider>,
      );
    });

    expect(mocks.lastJoyrideSteps.map((step) => step.target)).toEqual([
      'body',
      '[data-tour-id="toolbar-communicator-dialog"]',
      '[data-tour-id="toolbar-create-communicator"]',
      '[data-tour-id="toolbar-my-boards"]',
      '[data-tour-id="toolbar-default-communicator-switcher"]',
      '[data-tour-id="toolbar-ask-ai"]',
      '[data-tour-id="toolbar-organize-pictograms"]',
      '[data-tour-id="toolbar-add-content"]',
      '[data-tour-id="toolbar-fullscreen"]',
      '[data-tour-id="toolbar-notifications"]',
      '[data-tour-id="toolbar-settings"]',
      '[data-tour-id="toolbar-account"]',
      '[data-tour-id="toolbar-share"]',
      '[data-tour-id="floating-play"]',
      '[data-tour-id="floating-clear"]',
      '[data-tour-id="toolbar-lock"]',
    ]);
  });
});
