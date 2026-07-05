# Komunicare Frontend

> This project was originally based on [cboard-org/cboard](https://github.com/cboard-org/cboard) and has been modified by [SilvernetSA](https://github.com/SilvernetSA) / Komunicare.
>
> The source code is provided under the GNU GPLv3 in compliance with the original license.

Public frontend for Komunicare, an AAC web application for communication boards, text-to-speech, and communicator management.

This branch is prepared for public sharing:

- internal environment files are not tracked
- the repo can be run locally by creating your own env files

## What This Repository Contains

- React 18 + TypeScript + Vite frontend
- browser application used by Komunicare users
- client-side state, board editing flows, authentication UI, and API integration

This public export is web-only.

## Relationship With the API

This frontend depends on the Komunicare API for most persistent data.

- boards and communicators are fetched from the API
- user data and settings are persisted through the API
- runtime API URL resolution lives in `src/platform/runtime.ts`

For local development you will usually run this repo together with [komunicare-api-public](https://github.com/SilvernetSA/komunicare-api-public).

If the API is down, the app can still boot, but most authenticated and persisted flows will be incomplete.

## Fork Note

Komunicare started as a fork of Cboard. Some internal names and translation ids still keep historical `cboard` naming, but the active product behavior in this repo is Komunicare-specific.

## Prerequisites

- `pnpm`
- Node.js

If you use `nvm`, the repo includes `.nvmrc`, so you can run:

```bash
nvm use
```

## Install

```bash
pnpm install
```

## Local Environment Setup

Create your own local env file in the project root. Do not commit it.

Recommended file for browser development:

```text
.env.local
```

Minimal example:

```bash
VITE_DEV_API_URL=http://localhost:10010
VITE_PUBLIC_APP_URL=http://localhost:3001
```

You can also use these local-only files when needed:

- `.env.development.local`
- `.env.production.local`

Tracked env files such as `.env.development`, `.env.development.example`, and `.env.production` are intentionally not part of this public branch.

## Environment Variables

### Usually needed

| Variable              | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `VITE_DEV_API_URL`    | API base URL for browser development            |
| `VITE_PUBLIC_APP_URL` | Public frontend origin used for generated links |

### Optional runtime overrides

| Variable       | Purpose                                      |
| -------------- | -------------------------------------------- |
| `VITE_API_URL` | Hard override for the API in any environment |

### Optional integrations

Only set these if you are working on those integrations locally:

- `VITE_AZURE_INST_KEY`
- `VITE_AZURE_SPEECH_KEY`
- `VITE_AZURE_SPEECH_SERVICE_REGION`
- `VITE_MERCADOPAGO_PUBLIC_KEY`
- `VITE_MERCADOPAGO_HOSTED_TEST_MODE`
- `VITE_MERCADOPAGO_TEST_MODE`
- `VITE_MERCADOPAGO_TEST_PAYER_EMAIL`

Legacy CRA-style variables are still recognized in some places:

- `REACT_APP_API_URL`
- `REACT_APP_DEV_API_URL`
- `REACT_APP_AZURE_INST_KEY`
- `REACT_APP_AZURE_SPEECH_KEY`
- `REACT_APP_AZURE_SPEECH_SERVICE_REGION`
- `REACT_APP_PUBLIC_URL`

## How API Resolution Works

This web-only branch resolves the API in this order:

```text
VITE_API_URL -> VITE_DEV_API_URL -> derived https://api.<public-host>
```

## Run Locally

Start the dev server:

```bash
pnpm start
```

Default local URL:

```text
http://localhost:3001
```

## Main Scripts

| Script               | Purpose                         |
| -------------------- | ------------------------------- |
| `pnpm start`         | Start the Vite dev server       |
| `pnpm build`         | Build the web app               |
| `pnpm build:dev`     | Development-mode build          |
| `pnpm build:prod`    | Production-mode build           |
| `pnpm preview`       | Preview the built app locally   |
| `pnpm test`          | Run Vitest in watch mode        |
| `pnpm test:run`      | Run Vitest once                 |
| `pnpm test:e2e`      | Run Playwright tests            |
| `pnpm test:coverage` | Run Vitest with coverage        |
| `pnpm lint`          | Run ESLint on `src/`            |
| `pnpm format`        | Run Prettier on source and docs |

## Reasonable Verification

Typical local verification after a change:

```bash
pnpm test:run
pnpm lint
pnpm build
```

## Useful Paths

- `src/platform/runtime.ts` - runtime/API URL resolution
- `src/constants.ts` - env-backed client constants
- `src/store/` - Zustand stores and API flows
- `src/components/` - UI and interaction logic
- `src/translations/` - translation catalogs

## License

GPL-3.0-only.
