import { describe, expect, it } from 'vitest';

import { mergeCommunicators } from '../mergeCommunicators';

describe('mergeCommunicators', () => {
  it('replaces communicator metadata from API when ids match', () => {
    const current = [
      {
        id: 'comm-system',
        name: 'Komunicare (local stale)',
        description: 'stale',
        author: 'User',
        email: 'user@example.com',
        rootBoard: 'komunicare',
        boards: ['komunicare'],
        defaultBoardsIncluded: [],
      },
    ];

    const api = [
      {
        id: 'comm-system',
        name: 'Komunicare',
        description: 'Komunicare default communicator',
        author: 'Komunicare Team',
        email: 'info@komuni.care',
        rootBoard: 'komunicare',
        boards: ['komunicare'],
        defaultBoardsIncluded: [
          { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
        ],
      },
    ];

    const merged = mergeCommunicators(current as any, api as any);

    expect(merged).toHaveLength(1);
    expect(merged[0].email).toBe('info@komuni.care');
    expect(merged[0].author).toBe('Komunicare Team');
    expect(merged[0].description).toBe('Komunicare default communicator');
    expect(merged[0].name).toBe('Komunicare');
  });
});
