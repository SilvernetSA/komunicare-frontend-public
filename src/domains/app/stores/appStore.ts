import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { buildLoginSuccessPatch } from './appStore/buildLoginSuccessPatch';
import { fetchLoggedUserLocationAction } from './appStore/fetchLoggedUserLocation';
import { fetchUnloggedUserLocationAction } from './appStore/fetchUnloggedUserLocation';
import { refreshUserDataAction } from './appStore/refreshUserData';
import { saveUserProfileAction } from './appStore/saveUserProfile';
import {
  DISPLAY_SIZE_STANDARD,
  LABEL_POSITION_BELOW,
} from '@/domains/settings/components/Settings/Display/Display.constants';
import { NAVIGATION_BUTTONS_STYLE_SIDES } from '@/domains/settings/components/Settings/Navigation/Navigation.constants';
import { DEFAULT_FONT_FAMILY } from '@/providers/ThemeProvider/ThemeProvider.constants';
import { DisplaySettings, NavigationSettings, UserData } from '@/types/app';

interface LiveHelp {
  isRootBoardTourEnabled: boolean;
  isUnlockedTourEnabled: boolean;
  isSettingsTourEnabled: boolean;
  communicatorTour: {
    isCommBoardsEnabled: boolean;
    isPublicBoardsEnabled: boolean;
    isAllMyBoardsEnabled: boolean;
  };
  isAnalyticsTourEnabled: boolean;
}

export interface AppState {
  isConnected: boolean;
  isFirstVisit: boolean;
  liveHelp: LiveHelp;
  displaySettings: DisplaySettings;
  navigationSettings: NavigationSettings;
  userData: UserData | Record<string, unknown>;
  unloggedUserLocation?: { country?: string; countryCode?: string };
}

const initialAppState: AppState = {
  isConnected: true,
  isFirstVisit: true,
  liveHelp: {
    isRootBoardTourEnabled: true,
    isUnlockedTourEnabled: true,
    isSettingsTourEnabled: true,
    communicatorTour: {
      isCommBoardsEnabled: true,
      isPublicBoardsEnabled: true,
      isAllMyBoardsEnabled: true,
    },
    isAnalyticsTourEnabled: true,
  },
  displaySettings: {
    uiSize: DISPLAY_SIZE_STANDARD,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DISPLAY_SIZE_STANDARD,
    hideOutputActive: false,
    increaseOutputButtons: false,
    labelPosition: LABEL_POSITION_BELOW,
    darkThemeActive: false,
  },
  navigationSettings: {
    shareShowActive: false,
    bigScrollButtonsActive: true,
    navigationButtonsStyle: NAVIGATION_BUTTONS_STYLE_SIDES,
    caBackButtonActive: true,
    quickUnlockActive: false,
    removeOutputActive: false,
    vocalizeFolders: false,
    playSoundOnTouchActive: false,
  },
  userData: {},
};

export interface AppStore extends AppState {
  updateDisplaySettings: (patch: Partial<DisplaySettings>) => void;
  updateNavigationSettings: (patch: Partial<NavigationSettings>) => void;
  updateConnectivity: (isConnected: boolean) => void;
  finishFirstVisit: () => void;
  disableTour: (patch: Partial<LiveHelp>) => void;
  enableAllTours: () => void;
  updateUserData: (payload: UserData | Record<string, unknown>) => void;
  setUnloggedUserLocation: (
    payload: { country?: string; countryCode?: string } | null,
  ) => void;
  applyLoginSuccess: (payload: unknown) => void;
  applyLogout: () => void;
  fetchLoggedUserLocation: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  fetchUnloggedUserLocation: () => Promise<void>;
  saveUserProfile: (profileUpdates: Partial<UserData>) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist<AppStore>(
    (set, get) => ({
      ...initialAppState,
      updateDisplaySettings: (patch) => {
        set((state) => ({
          displaySettings: {
            ...state.displaySettings,
            ...patch,
          },
        }));
      },
      updateNavigationSettings: (patch) => {
        set((state) => ({
          navigationSettings: {
            ...state.navigationSettings,
            ...patch,
          },
        }));
      },
      updateConnectivity: (isConnected) => {
        set({ isConnected });
      },
      finishFirstVisit: () => {
        set({ isFirstVisit: false });
      },
      disableTour: (patch) => {
        set((state) => ({
          liveHelp: {
            ...state.liveHelp,
            ...patch,
          },
        }));
      },
      enableAllTours: () => {
        set({
          liveHelp: {
            isRootBoardTourEnabled: true,
            isUnlockedTourEnabled: true,
            isSettingsTourEnabled: true,
            communicatorTour: {
              isCommBoardsEnabled: true,
              isPublicBoardsEnabled: true,
              isAllMyBoardsEnabled: true,
            },
            isAnalyticsTourEnabled: true,
          },
        });
      },
      updateUserData: (payload) => {
        set({ userData: payload });
      },
      setUnloggedUserLocation: (payload) => {
        set({
          unloggedUserLocation: payload || undefined,
        });
      },
      applyLoginSuccess: (payload) => {
        set(buildLoginSuccessPatch(payload, get() as AppState));
      },
      applyLogout: () => {
        set({ userData: {} });
      },
      fetchLoggedUserLocation: async () => {
        await fetchLoggedUserLocationAction({
          userData: get().userData as UserData | undefined,
          setUserData: (payload) => set({ userData: payload }),
        });
      },
      refreshUserData: async () => {
        await refreshUserDataAction({
          userData: get().userData as UserData | undefined,
          setUserData: (payload) => set({ userData: payload }),
        });
      },
      fetchUnloggedUserLocation: async () => {
        await fetchUnloggedUserLocationAction({
          unloggedUserLocation: get().unloggedUserLocation,
          setUnloggedUserLocation: (payload) =>
            set({ unloggedUserLocation: payload }),
        });
      },
      saveUserProfile: async (profileUpdates) => {
        await saveUserProfileAction({
          userData: get().userData as UserData | undefined,
          profileUpdates,
          setUserData: (payload) => set({ userData: payload }),
        });
      },
    }),
    {
      name: 'komunicare-app',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persistedState: any, fromVersion: number) => {
        if (fromVersion < 1) {
          persistedState.navigationSettings = {
            ...persistedState.navigationSettings,
            bigScrollButtonsActive: true,
            caBackButtonActive: true,
          };
        }
        // v2: deep-merge navigationSettings defaults for missing keys.
        if (fromVersion < 2) {
          persistedState.navigationSettings = {
            shareShowActive: false,
            bigScrollButtonsActive: true,
            navigationButtonsStyle: NAVIGATION_BUTTONS_STYLE_SIDES,
            caBackButtonActive: true,
            quickUnlockActive: false,
            removeOutputActive: false,
            vocalizeFolders: false,
            playSoundOnTouchActive: false,
            ...persistedState.navigationSettings,
          };
        }
        // v3: Navigation.tsx had a bug where its local-state defaults were
        // false for caBackButtonActive and bigScrollButtonsActive.  Any user
        // who opened Settings > Navigation and saved would have persisted
        // false even if they never consciously turned the buttons off.
        // Force-reset both to true; users who genuinely want them off can
        // disable them again via the (now-fixed) Settings screen.
        if (fromVersion < 3) {
          persistedState.navigationSettings = {
            ...persistedState.navigationSettings,
            bigScrollButtonsActive: true,
            caBackButtonActive: true,
          };
        }
        // v4: A second pass is needed because the service worker may have
        // served the old (pre-fix) JS bundle to users who loaded the app
        // while v3 was already their persisted version.  In that window the
        // old buggy Navigation.tsx form could have written false again even
        // though the v3 migration had already run.  Force-reset once more so
        // those users get their buttons back without having to clear storage.
        if (fromVersion < 4) {
          persistedState.navigationSettings = {
            ...persistedState.navigationSettings,
            bigScrollButtonsActive: true,
            caBackButtonActive: true,
          };
        }
        return persistedState;
      },
    },
  ),
);
