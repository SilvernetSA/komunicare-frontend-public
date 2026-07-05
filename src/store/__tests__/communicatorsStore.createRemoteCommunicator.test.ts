// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Communicator } from '../../types/communicator';

const mocks = vi.hoisted(() => ({
  appStoreState: {
    userData: {} as Record<string, unknown>,
  },
  apiClientGet: vi.fn(),
  apiClientPost: vi.fn(),
}));

vi.mock('../appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

vi.mock('../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
    post: mocks.apiClientPost,
  },
  getQueryParameters: (obj: Record<string, unknown> = {}): string => {
    return Object.keys(obj)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key]))}`,
      )
      .join('&');
  },
}));

const buildCommunicator = (
  overrides: Partial<Communicator> = {},
): Communicator => ({
  id: 'comm-1',
  name: 'My communicator',
  author: 'Draft author',
  email: 'draft@example.com',
  description: 'Test communicator',
  rootBoard: 'root',
  boards: ['root'],
  defaultBoardsIncluded: [],
  ...overrides,
});

const buildConflictError = (existingCommunicatorId: string) => ({
  response: {
    status: 409,
    data: {
      message:
        'A personal copy for this communicator source already exists for this user.',
      existingCommunicatorId,
      copySource: 'cboard',
    },
  },
});

describe('useCommunicatorsStore.createRemoteCommunicator', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    mocks.appStoreState.userData = {
      email: 'alice@example.com',
      name: 'Alice',
    };
  });

  it('keeps the normal create success path intact', async () => {
    const tempId = 'temp-1';
    const draftCommunicator = buildCommunicator({ id: tempId });
    const createdCommunicator = buildCommunicator({
      id: 'remote-1',
      author: 'Alice',
      email: 'alice@example.com',
    });
    mocks.apiClientPost.mockResolvedValue({
      data: { communicator: createdCommunicator },
    });

    const { useCommunicatorsStore } = await import('../communicatorsStore');
    useCommunicatorsStore.getState().createCommunicator(draftCommunicator);
    useCommunicatorsStore.getState().changeCommunicator(tempId);

    const result = await useCommunicatorsStore
      .getState()
      .createRemoteCommunicator({
        communicator: draftCommunicator,
        tempId,
      });

    expect(result).toEqual(createdCommunicator);
    expect(mocks.apiClientGet).not.toHaveBeenCalled();
    expect(mocks.apiClientPost).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientPost).toHaveBeenCalledWith(
      '/communicator',
      expect.objectContaining({
        author: 'Alice',
        boards: ['root'],
        defaultBoardsIncluded: [],
        description: 'Test communicator',
        email: 'alice@example.com',
        isPublic: false,
        name: 'My communicator',
        rootBoard: 'root',
      }),
    );
    expect(mocks.apiClientPost.mock.calls[0][1]).not.toHaveProperty('id');
    expect(useCommunicatorsStore.getState().activeCommunicatorId).toBe(
      'remote-1',
    );
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toContain('remote-1');
  });

  it('returns and activates the refreshed communicator after a 409 conflict', async () => {
    const existingCommunicator = buildCommunicator({
      id: 'existing-1',
      name: 'Existing copy',
    });
    const otherCommunicator = buildCommunicator({
      id: 'other-1',
      name: 'Other communicator',
    });
    mocks.apiClientPost.mockRejectedValue(buildConflictError('existing-1'));
    mocks.apiClientGet.mockResolvedValue({
      data: {
        data: [otherCommunicator, existingCommunicator],
        total: 2,
      },
    });

    const { useCommunicatorsStore } = await import('../communicatorsStore');

    const result = await useCommunicatorsStore
      .getState()
      .createRemoteCommunicator({
        communicator: buildCommunicator({ id: 'temp-2' }),
        tempId: 'temp-2',
      });

    expect(mocks.apiClientPost).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet.mock.calls[0][0]).toContain(
      '/communicator/byemail/alice@example.com?',
    );
    expect(result).toEqual(
      useCommunicatorsStore
        .getState()
        .communicators.find((communicator) => communicator.id === 'existing-1'),
    );
    expect(useCommunicatorsStore.getState().activeCommunicatorId).toBe(
      'existing-1',
    );
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toEqual(['other-1', 'existing-1']);
  });

  it('throws when a 409 conflict cannot be recovered after refresh', async () => {
    mocks.apiClientPost.mockRejectedValue(buildConflictError('missing-1'));
    mocks.apiClientGet.mockResolvedValue({
      data: {
        data: [
          buildCommunicator({ id: 'other-1', name: 'Other communicator' }),
        ],
        total: 1,
      },
    });

    const { useCommunicatorsStore } = await import('../communicatorsStore');

    await expect(
      useCommunicatorsStore.getState().createRemoteCommunicator({
        communicator: buildCommunicator({ id: 'temp-3' }),
        tempId: 'temp-3',
      }),
    ).rejects.toThrow(
      'Communicator copy conflict references missing communicator missing-1. Backend data may be inconsistent and may require DB cleanup.',
    );

    expect(mocks.apiClientPost).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
  });
});
