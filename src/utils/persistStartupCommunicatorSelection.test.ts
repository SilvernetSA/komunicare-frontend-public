import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  persistSettings: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../store/settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      persistSettings: mocks.persistSettings,
    }),
  },
}));

import { persistStartupCommunicatorSelection } from './persistStartupCommunicatorSelection';

describe('persistStartupCommunicatorSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists both communicator fields when enabled', async () => {
    await persistStartupCommunicatorSelection({
      communicatorId: 'communicator-1',
      shouldPersist: true,
    });

    expect(mocks.persistSettings).toHaveBeenCalledTimes(1);
    expect(mocks.persistSettings).toHaveBeenCalledWith({
      activeCommunicatorId: 'communicator-1',
      communicatorId: 'communicator-1',
    });
  });

  it('does nothing when persistence is disabled', async () => {
    await persistStartupCommunicatorSelection({
      communicatorId: 'communicator-1',
      shouldPersist: false,
    });

    expect(mocks.persistSettings).not.toHaveBeenCalled();
  });

  it('does nothing when communicator id is missing', async () => {
    await persistStartupCommunicatorSelection({
      shouldPersist: true,
    });

    expect(mocks.persistSettings).not.toHaveBeenCalled();
  });
});
