import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { API_URL } from '../constants';
import history from '../history';

let unauthorizedHandler: (() => void) | null = null;
let authTokenProvider: (() => string | null) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export const setAuthTokenProvider = (
  provider: (() => string | null) | null,
) => {
  authTokenProvider = provider;
};

export const createApiClient = (
  config: AxiosRequestConfig = {},
): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    ...config,
  });

  instance.interceptors.request.use((request) => {
    const token = authTokenProvider ? authTokenProvider() : null;
    if (token && !request.headers.get('Authorization')) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response?.status === 401 &&
        error.config?.baseURL === API_URL
      ) {
        if (unauthorizedHandler) {
          unauthorizedHandler();
        }
        history.push('/login-signup/');
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const apiClient = createApiClient();

export const getQueryParameters = (obj: Record<string, any> = {}): string => {
  return Object.keys(obj)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');
};
