import type { UserData } from '@/types/app';

interface SaveUserProfileActionArgs {
  userData: UserData | undefined;
  profileUpdates: Partial<UserData>;
  setUserData: (payload: UserData | Record<string, unknown>) => void;
}

export const saveUserProfileAction = async ({
  userData,
  profileUpdates,
  setUserData,
}: SaveUserProfileActionArgs): Promise<void> => {
  try {
    if (!userData || !userData.id) {
      return;
    }
    const { useUserStore } = await import('@/domains/user/stores/userStore');
    await useUserStore.getState().updateUser({
      id: userData.id,
      ...profileUpdates,
    });
    setUserData({ ...userData, ...profileUpdates });
  } catch (error) {
    console.error('Failed to save user profile', error);
  }
};
