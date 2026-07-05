export const APP_VERSION = __APP_VERSION__;
export const APP_COMMIT = __APP_COMMIT__;
export const APP_BUILD_DATE = __APP_BUILD_DATE__;

export const APP_ENV = import.meta.env.PROD ? 'PROD' : 'DEV';
export const IS_DEV_ENV = !import.meta.env.PROD;

// Ej: "v0.1.1 · aa3dd71 · 2026-06-10 · DEV"
export const buildInfoLabel = `v${APP_VERSION} · ${APP_COMMIT} · ${APP_BUILD_DATE} · ${APP_ENV}`;
