import { useSettingsStore } from '../store/settingsStore';

interface PersistStartupCommunicatorSelectionOptions {
  communicatorId?: string;
  shouldPersist?: boolean;
}

export async function persistStartupCommunicatorSelection(
  options: PersistStartupCommunicatorSelectionOptions,
): Promise<void> {
  const { communicatorId, shouldPersist } = options;

  if (!shouldPersist || !communicatorId) {
    return;
  }

  await useSettingsStore.getState().persistSettings({
    activeCommunicatorId: communicatorId,
    communicatorId,
  } as any);
}
