import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  uploadFile: vi.fn(),
}));

vi.mock('../../uploadsStore', () => ({
  useUploadsStore: {
    getState: () => ({
      uploadFile: mocks.uploadFile,
    }),
  },
}));

import { uploadTileSound } from '../uploadTileSound';

const atob = (base64: string) =>
  Buffer.from(base64, 'base64').toString('binary');

describe('uploadTileSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', { atob });
  });

  it('uploads data-uri sounds and replaces the tile sound url', async () => {
    mocks.uploadFile.mockResolvedValue('https://cdn.example.com/user.ogg');

    const tile = {
      id: 'tile-1',
      sound: 'data:audio/ogg;base64,YWJj',
    } as any;

    await expect(
      uploadTileSound(tile, { email: 'user@example.com' } as any),
    ).resolves.toBe(tile);

    expect(mocks.uploadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      'user@example.com.ogg',
    );
    expect(tile.sound).toBe('https://cdn.example.com/user.ogg');
  });

  it('returns the tile unchanged when the sound is not a data uri', async () => {
    const tile = {
      id: 'tile-1',
      sound: 'https://cdn.example.com/existing.ogg',
    } as any;

    await expect(
      uploadTileSound(tile, { email: 'user@example.com' } as any),
    ).resolves.toBe(tile);

    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(tile.sound).toBe('https://cdn.example.com/existing.ogg');
  });

  it('swallows upload errors and preserves the original tile sound', async () => {
    const error = new Error('upload failed');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mocks.uploadFile.mockRejectedValue(error);

    const tile = {
      id: 'tile-1',
      sound: 'data:audio/ogg;base64,YWJj',
    } as any;

    await expect(
      uploadTileSound(tile, { email: 'user@example.com' } as any),
    ).resolves.toBe(tile);

    expect(tile.sound).toBe('data:audio/ogg;base64,YWJj');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error uploading tile sound:',
      error,
    );

    consoleErrorSpy.mockRestore();
  });
});
