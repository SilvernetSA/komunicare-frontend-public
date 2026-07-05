const env = (
  typeof import.meta !== 'undefined' ? import.meta.env : (process as any)?.env
) as Record<string, string> | undefined;

const DEFAULT_PUBLIC_APP_URL = 'https://komuni.care';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

const getWindowLocation = (): Location | undefined =>
  typeof window !== 'undefined' ? window.location : undefined;

const getWindowNavigator = (): Navigator | undefined =>
  typeof navigator !== 'undefined' ? navigator : undefined;

const getWindowHostname = (): string =>
  String(getWindowLocation()?.hostname || '').toLowerCase();

const isLocalHostname = (hostname: string): boolean =>
  LOCAL_HOSTNAMES.has(String(hostname || '').toLowerCase());

export const USER_AGENT = getWindowNavigator()?.userAgent || '';
export const IS_NATIVE_PLATFORM = false;
export const IS_ANDROID = /Android/i.test(USER_AGENT);
export const IS_IOS = /iPad|iPhone|iPod/i.test(USER_AGENT);

const getConfiguredPublicAppUrl = (): string =>
  String(
    env?.VITE_PUBLIC_APP_URL ||
      env?.REACT_APP_PUBLIC_URL ||
      env?.PUBLIC_URL ||
      '',
  ).trim();

export const PUBLIC_APP_ORIGIN = (() => {
  const currentOrigin = String(getWindowLocation()?.origin || '').trim();
  const configuredPublicUrl = getConfiguredPublicAppUrl();

  if (configuredPublicUrl) {
    try {
      return new URL(configuredPublicUrl).origin;
    } catch {
      return configuredPublicUrl.replace(/\/+$/, '');
    }
  }

  if (currentOrigin) {
    return currentOrigin;
  }

  return DEFAULT_PUBLIC_APP_URL;
})();

const getConfiguredApiUrl = (): string =>
  String(env?.VITE_API_URL || env?.REACT_APP_API_URL || '').trim();

const getConfiguredDevApiUrl = (): string =>
  String(env?.VITE_DEV_API_URL || env?.REACT_APP_DEV_API_URL || '').trim();

// Resolve the dev API URL against the host the page was actually opened from.
// VITE_DEV_API_URL (e.g. http://localhost:10010) defines the dev API *port*; when
// the page is served over a LAN IP (a tablet on the same network), `localhost`
// would point at that device itself — so we swap in the current hostname and keep
// the port. localhost access from the dev machine is left untouched.
const resolveDevApiUrl = (value: string): string => {
  if (!value) return '';

  try {
    const target = new URL(value);
    const currentHostname = getWindowHostname();

    if (
      currentHostname &&
      !isLocalHostname(currentHostname) &&
      isLocalHostname(target.hostname)
    ) {
      target.hostname = currentHostname;
    }

    return target.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
};

const deriveApiUrlFromOrigin = (origin: string): string => {
  try {
    const originUrl = new URL(origin);
    const host = originUrl.host.replace(/^www\./, '');
    return `${originUrl.protocol}//api.${host}`;
  } catch {
    return origin;
  }
};

export const API_BASE_URL = (() => {
  const configuredApiUrl = getConfiguredApiUrl();
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  const configuredDevApiUrl = resolveDevApiUrl(getConfiguredDevApiUrl());
  if (configuredDevApiUrl) {
    return configuredDevApiUrl;
  }

  return deriveApiUrlFromOrigin(PUBLIC_APP_ORIGIN);
})();

export const shouldEnableServiceWorker = (): boolean => true;

export const buildPublicAppUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${PUBLIC_APP_ORIGIN}/`).toString();
};
