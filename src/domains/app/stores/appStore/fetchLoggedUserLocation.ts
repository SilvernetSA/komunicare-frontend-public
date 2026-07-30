import type { UserData } from '@/types/app';

interface FetchLoggedUserLocationActionArgs {
  userData: UserData | undefined;
  setUserData: (payload: UserData | Record<string, unknown>) => void;
}

export const fetchLoggedUserLocationAction = async ({
  userData,
  setUserData,
}: FetchLoggedUserLocationActionArgs): Promise<void> => {
  try {
    if (!userData || !userData.id || (userData as any).location) {
      return;
    }
    const { useUserStore } = await import('@/domains/user/stores/userStore');
    const response = await useUserStore.getState().updateUser({
      id: userData.id,
      location: {},
    });
    if (response && (response as any).location) {
      setUserData({ ...userData, location: (response as any).location });
    }
  } catch (error) {
    console.error('Failed to fetch logged user location', error);
  }
};
