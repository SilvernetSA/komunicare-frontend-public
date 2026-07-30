import { apiClient } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useSettingsStore } from '@/domains/settings/stores/settingsStore';
import { useSubscriptionStore } from '@/domains/subscription/stores/subscriptionStore';
import { useSpeechStore } from '@/domains/settings/stores/voicesStore';
import { fetchRemoteBoardsAction } from './fetchRemoteBoards';
import { handleFirstLoginAction } from './handleFirstLogin';
import { setVoicePreferencesAction } from './setVoicePreferences';

import type { LoginArgs, LoginPayload } from '@/types/auth';
import type { LoginUserResponse } from '@/types/auth/login/LoginUser';
import type { StoreSet } from '@/store/_shared/createStoreActions';
import type { AuthStore } from '@/domains/user/stores/authStore';

export const loginFactory =
  (set: StoreSet<AuthStore>) =>
  async ({ email, password, type = 'local', activatedData }: LoginArgs) => {
    set({ loginStatus: 'loading', loginError: undefined });

    try {
      const deviceId = navigator.userAgent;
      let loginData: LoginPayload;

      if (activatedData) {
        loginData = activatedData;
      } else if (type === 'local') {
        const { data } = await apiClient.post<LoginUserResponse>(
          '/user/login',
          {
            email,
            password,
            deviceId,
          },
        );
        loginData = data as LoginPayload;
      } else {
        throw new Error('OAuth login requires activated data');
      }

      if (type === 'local') {
        useAppStore.getState().disableTour({
          isRootBoardTourEnabled: false,
          isUnlockedTourEnabled: false,
          isSettingsTourEnabled: false,
          isAnalyticsTourEnabled: false,
        });
      }

      useAppStore.getState().applyLoginSuccess(loginData);
      useLanguageStore.getState().applyLoginSuccess(loginData);
      useSpeechStore.getState().applyLoginSuccess(loginData);
      useCommunicatorsStore.getState().applyLoginSuccess(loginData);
      useSettingsStore.getState().applyLoginSuccess(loginData);
      useSubscriptionStore.getState().applyLoginSuccess(loginData);
      useBoardsStore.getState().switchBoard('');

      if (loginData.isFirstLogin) {
        await handleFirstLoginAction(loginData);
      }

      if (window.navigator.onLine) {
        await Promise.all([
          useBoardsStore.getState().fetchSystemBoards(),
          useCommunicatorsStore.getState().fetchSystemCommunicators({
            force: false,
          }),
        ]);
      }

      if (loginData.isFirstLogin) {
        useAppStore.getState().enableAllTours();
      }

      const remoteBoards = await fetchRemoteBoardsAction(loginData);
      if (remoteBoards.length) {
        useBoardsStore.getState().addBoards(remoteBoards);
      }

      await setVoicePreferencesAction(loginData);
      set({ loginStatus: 'succeeded', loginError: undefined });

      return loginData;
    } catch (error: any) {
      const message = getApiErrorMessage(
        error,
        'Unable to contact server. Try in a moment',
      );
      set({ loginStatus: 'failed', loginError: message });
      throw error?.response?.data || { message };
    }
  };
