export const UPDATE_SUBSCRIBER_ID =
  'komunicare/subscription/UPDATE_SUBSCRIBER_ID' as const;
export const UPDATE_SUBSCRIPTION =
  'komunicare/subscription/UPDATE_SUBSCRIPTION' as const;
export const UPDATE_SUBSCRIPTION_ERROR =
  'komunicare/subscription/UPDATE_SUBSCRIPTION_ERROR' as const;
export const SHOW_PREMIUM_REQUIRED =
  'komunicare/subscription/SHOW_PREMIUM_REQUIRED' as const;
export const HIDE_PREMIUM_REQUIRED =
  'komunicare/subscription/HIDE_PREMIUM_REQUIRED' as const;
export const SHOW_LOGIN_REQUIRED =
  'komunicare/subscription/SHOW_LOGIN_REQUIRED' as const;
export const HIDE_LOGIN_REQUIRED =
  'komunicare/subscription/HIDE_LOGIN_REQUIRED' as const;

export const NOT_SUBSCRIBED = 'not_subscribed' as const;
export const PROCCESING = 'proccesing' as const;
export const ACTIVE = 'active' as const;
export const CANCELED = 'canceled' as const;
export const CANCELLED = 'cancelled' as const;
export const IN_GRACE_PERIOD = 'in_grace_period' as const;
export const PAUSED = 'paused' as const;
export const EXPIRED = 'expired' as const;
export const ON_HOLD = 'on_hold' as const;
export const UNVERIFIED = 'unverified' as const;

export const DAYS_TO_TRY = 15 as const;

export const REQUIRING_PREMIUM_COUNTRIES = [
  'AE',
  'AT',
  'AU',
  'BE',
  'BH',
  'BM',
  'CA',
  'CH',
  'CL',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GB',
  'GE',
  'GI',
  'GR',
  'HK',
  'HU',
  'IE',
  'IS',
  'IT',
  'JP',
  'KY',
  'LI',
  'LK',
  'LT',
  'LU',
  'MC',
  'NL',
  'NO',
  'NZ',
  'PA',
  'PL',
  'PT',
  'QA',
  'RU',
  'SA',
  'SE',
  'SG',
  'SK',
  'SI',
  'SM',
  'TW',
  'US',
  'VA',
  'ZA',
] as const; // ISO-2 country codes
