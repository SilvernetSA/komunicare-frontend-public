// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { useCommunicatorsStore } from '../communicatorsStore';

const makeCommunicator = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'comm-1',
    name: 'Main communicator',
    description: '',
    author: 'User',
    email: 'user@example.com',
    rootBoard: 'root-board',
    boards: ['root-board'],
    defaultBoardsIncluded: [],
    ...overrides,
  }) as any;

describe('useCommunicatorsStore addBoardCommunicator', () => {
  beforeEach(() => {
    localStorage.clear();
    useCommunicatorsStore.setState({
      communicators: [makeCommunicator()],
      activeCommunicatorId: 'comm-1',
      isFetching: false,
    });
  });

  it('does not duplicate a board already associated to the active communicator', () => {
    const { addBoardCommunicator } = useCommunicatorsStore.getState();

    addBoardCommunicator('child-board-id');
    addBoardCommunicator('child-board-id');

    expect(useCommunicatorsStore.getState().communicators[0].boards).toEqual([
      'root-board',
      'child-board-id',
    ]);
  });
});
