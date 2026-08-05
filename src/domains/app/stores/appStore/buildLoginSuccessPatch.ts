import type { AppState } from '../appStore';

export const buildLoginSuccessPatch = (
  payload: unknown,
  state: AppState,
): Partial<AppState> => {
  const settings = (payload as any)?.settings || {};
  const { display, navigation } = settings;

  let displaySettings = { ...state.displaySettings };
  let navigationSettings = { ...state.navigationSettings };

  if (display) {
    displaySettings = { ...displaySettings, ...display };
  }

  if (navigation) {
    navigationSettings = { ...navigationSettings, ...navigation };
  }

  // Preserve the locally-stored communicator preference when the API response
  // does not include one. The server does not track this client-side setting,
  // so without this the preference written by syncPreferredCommunicatorInAppStore
  // would be lost every time the login payload overwrites userData.
  const prevActiveCommunicatorId = (state.userData as any)?.activeCommunicatorId;
  const apiActiveCommunicatorId =
    (payload as any)?.activeCommunicatorId ||
    (payload as any)?.settings?.activeCommunicatorId ||
    (payload as any)?.settings?.communicatorId;

  return {
    isFirstVisit: false,
    displaySettings,
    navigationSettings,
    userData: {
      ...(prevActiveCommunicatorId && !apiActiveCommunicatorId
        ? { activeCommunicatorId: prevActiveCommunicatorId }
        : {}),
      ...(payload as any) || {},
    },
  };
};
