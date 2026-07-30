import type { UserData } from '@/types/app';

interface RefreshUserDataActionArgs {
  userData: UserData | undefined;
  setUserData: (payload: UserData | Record<string, unknown>) => void;
}

export const refreshUserDataAction = async ({
  userData,
  setUserData,
}: RefreshUserDataActionArgs): Promise<void> => {
  try {
    if (!userData || !userData.id) {
      return;
    }
    const { useUserStore } = await import('@/domains/user/stores/userStore');
    const updatedUser = await useUserStore
      .getState()
      .getUserDataById(userData.id);
    if (updatedUser) {
      setUserData({ ...userData, ...updatedUser });
    }
  } catch (error) {
    console.error('Failed to refresh user data', error);
  }
};
