interface FetchUnloggedUserLocationActionArgs {
  unloggedUserLocation?: { country?: string; countryCode?: string };
  setUnloggedUserLocation: (payload: {
    country?: string;
    countryCode?: string;
  }) => void;
}

export const fetchUnloggedUserLocationAction = async ({
  unloggedUserLocation,
  setUnloggedUserLocation,
}: FetchUnloggedUserLocationActionArgs): Promise<void> => {
  try {
    if (unloggedUserLocation) {
      return;
    }
    const { useAuthStore } = await import('@/domains/user/stores/authStore');
    const location = await useAuthStore.getState().getUserLocation();
    if (location) {
      setUnloggedUserLocation(location);
    }
  } catch (error) {
    console.error('Failed to fetch unlogged user location', error);
  }
};
