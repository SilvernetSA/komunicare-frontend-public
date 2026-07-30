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

  return {
    isFirstVisit: false,
    displaySettings,
    navigationSettings,
    userData: (payload as any) || {},
  };
};
