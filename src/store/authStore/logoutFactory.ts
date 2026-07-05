import { useAppStore } from '../appStore';
import { useBoardsStore } from '../boardsStore';
import { useCommunicatorsStore } from '../communicatorsStore';
import { useSubscriptionStore } from '../subscriptionStore';

import type { AuthState } from './types';
import type { StoreGet, StoreSet } from '../_shared/createStoreActions';
import type { AuthStore } from '../authStore';

interface LogoutFactoryArgs {
  clearAuthUserDataCache: () => void;
  initialAuthState: AuthState;
}

export const logoutFactory =
  (
    { clearAuthUserDataCache, initialAuthState }: LogoutFactoryArgs,
    set: StoreSet<AuthStore>,
    get: StoreGet<AuthStore>,
  ) =>
  async () => {
    useAppStore.getState().setUnloggedUserLocation(null);

    try {
      const location = await get().getUserLocation();
      useAppStore.getState().setUnloggedUserLocation(location || undefined);
    } catch (error) {
      console.error(error);
    }

    useAppStore.getState().applyLogout();
    useCommunicatorsStore.getState().applyLogout();
    useBoardsStore.getState().applyLogout();
    useSubscriptionStore.getState().applyLogout();
    clearAuthUserDataCache();

    set({
      ...initialAuthState,
      loginError: undefined,
      resetError: undefined,
      changePasswordError: undefined,
    });
  };
