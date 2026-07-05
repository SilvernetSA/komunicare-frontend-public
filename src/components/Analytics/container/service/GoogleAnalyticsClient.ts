interface GAClient {
  clientId: string;
  timerId: string;
}

const getGaClientIdFromCookie = (): string | null => {
  const nameEQ = '_ga=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0)
      return c.substring(nameEQ.length + 6, c.length);
  }
  return null;
};

const getGaClientId = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag(
          'get',
          'UA-108091601-1',
          'client_id',
          (client_id: string) => {
            resolve(client_id);
          },
        );
      } else {
        const cookieClientId = getGaClientIdFromCookie();
        if (cookieClientId) {
          resolve(cookieClientId);
          return;
        }
        reject(new Error('Google analytics client id not found'));
      }
    }, 800);
  });
};

export const createGAClient = (): GAClient => ({
  clientId: '',
  timerId: '',
});

export const initializeClientId = async (client: GAClient): Promise<void> => {
  client.clientId = await getGaClientId();
};

export const getClientId = (client: GAClient): string => {
  return client.clientId;
};
