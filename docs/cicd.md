# CI/CD on DigitalOcean

This project is best deployed to DigitalOcean App Platform as one app per environment:

- `studflow-staging` wired to the `staging` branch
- `studflow-production` wired to the `main` branch

Each app should contain three components from the same GitHub repository:

- `frontend` web service from `frontend/`
- `api` web service from `backend/`
- `worker` background worker from `backend/`

This structure matches the current monorepo and keeps the browser on the same origin for `/api` requests.

## Branch Flow

- `feature/*` branches: CI only
- `staging` branch: deploy staging after CI passes
- `main` branch: deploy production after CI passes

Recommended workflow:

1. Create a feature branch from `staging`.
2. Open a pull request into `staging`.
3. After validation, merge into `staging` and let GitHub Actions deploy staging.
4. Promote tested changes from `staging` into `main`.
5. Merge into `main` and let GitHub Actions deploy production.

## GitHub Actions

The repository workflow is defined in [.github/workflows/pipeline.yml](/mnt/c/users/cjk_laptop/personal_projects/javascript/studflow/.github/workflows/pipeline.yml).

It does four things:

- runs frontend CI on every push and pull request
- runs backend CI on every push and pull request
- deploys the `staging` branch to DigitalOcean after CI passes
- deploys the `main` branch to DigitalOcean after CI passes

## One-Time GitHub Setup

Add these repository secrets in GitHub:

- `DIGITALOCEAN_ACCESS_TOKEN`
- `DIGITALOCEAN_STAGING_APP_ID`
- `DIGITALOCEAN_PRODUCTION_APP_ID`

The app IDs come from the DigitalOcean App Platform dashboards for your staging and production apps.

## One-Time DigitalOcean Setup

Create a staging app and a production app in App Platform from the GitHub repo `Kurisujon/studflow`.

For staging:

- branch: `staging`
- app name: `studflow-staging`

For production:

- branch: `main`
- app name: `studflow-production`

Disable App Platform automatic deploy-on-push after the apps are created. GitHub Actions should be the deployment gate so broken pushes do not bypass CI.

## App Platform Components

For both staging and production, configure the same component layout.

### Frontend Service

- component type: Web Service
- source directory: `frontend`
- environment: Node.js
- build command: `npm ci && npm run build`
- run command: `npm run start -- --hostname 0.0.0.0 --port 3000`
- HTTP port: `3000`

Frontend environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

Set `NEXT_PUBLIC_API_BASE_URL` to the public base URL of the same App Platform app, not the backend component URL. The frontend’s server-side requests use this value, while browser requests already use same-origin `/api`.

Example:

- staging: `https://studflow-staging-xxxxx.ondigitalocean.app`
- production: `https://studflow-production-xxxxx.ondigitalocean.app`

### API Service

- component type: Web Service
- source directory: `backend`
- environment: Python
- build command: `pip install -r requirements.txt`
- run command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- HTTP port: `8000`

Backend environment variables:

- `DATABASE_URL`
- `REDIS_URL`
- `CELERY_RESULT_BACKEND`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_STORAGE_FOLDER`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_FALLBACK_MODELS`
- `GEMINI_MAX_RETRIES`
- `YOUTUBE_API_KEY`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_JWKS_URL`
- `CLERK_ISSUER`
- `CLERK_AUDIENCE`
- `ALLOWED_ORIGINS`

Set `ALLOWED_ORIGINS` to the frontend URLs for the current environment.

### Worker

- component type: Worker
- source directory: `backend`
- environment: Python
- build command: `pip install -r requirements.txt`
- run command: `celery -A core.celery_app.celery_app worker --loglevel=info`

Use the same backend environment variables for the worker as the API service.

## Routing

Because the frontend browser code calls `/api/...` on the same origin, App Platform ingress must route `/api` to the backend service and `/` to the frontend service.

Configure routes like this in the App Platform UI:

1. `/api` -> `api`
2. `/` -> `frontend`

Preserve the `/api` prefix when routing to the API service because the FastAPI routes are mounted under `/api`.

## Databases and Queues

Provision separate managed resources for staging and production:

- Managed PostgreSQL for each environment
- Managed Redis for each environment

Point the environment variables at the matching environment resources:

- staging app -> staging Postgres and staging Redis
- production app -> production Postgres and production Redis

## Migrations

This repository uses Alembic from [backend/alembic.ini](/mnt/c/users/cjk_laptop/personal_projects/javascript/studflow/backend/alembic.ini).

Run this command against the target environment before the first deployment and whenever a new migration is added:

```bash
cd backend
alembic upgrade head
```

The simplest safe setup is to run migrations from the App Platform console or from your own machine with the production or staging `DATABASE_URL` loaded. Keep schema changes explicit instead of hiding them in application startup.

## Validation Checklist

- `staging` branch exists on GitHub
- staging app is connected to branch `staging`
- production app is connected to branch `main`
- deploy-on-push is disabled in App Platform
- GitHub secrets are configured
- App Platform ingress routes `/api` to `api`
- `NEXT_PUBLIC_API_BASE_URL` points to the current app base URL
- Postgres and Redis are provisioned for each environment
- backend and worker share the same runtime secrets

## Daily Usage

After the one-time setup:

1. Push to a feature branch to run CI.
2. Merge into `staging` to deploy staging automatically.
3. Verify staging.
4. Merge into `main` to deploy production automatically.
