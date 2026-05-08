# Task Manager (Spring Boot + React)

## 1) Overview

Full-stack task manager with a Spring Boot API (JWT auth + Flyway/Postgres) and a React + Vite frontend.

## 2) What it demonstrates

- JWT authentication (login/register) with a stateless Spring Security filter chain
- Full-stack workflow: teams + tasks CRUD, assignment, and status changes
- Database migrations via Flyway and a real Postgres database
- One-command local dev stack via Docker Compose (frontend + backend + db)
- End-to-end smoke tests with Playwright

## 3) Quickstart (Docker Compose)

### Prerequisites

- Docker Engine / Docker Desktop
- Docker Compose v2 (`docker compose`)

### Start

```bash
cp .env.example .env
docker compose up -d --build

# follow logs (Ctrl+C to stop following)
docker compose logs -f
```

Notes:
- If you prefer running in the foreground, omit `-d`.
- If you change code and want to rebuild images, re-run with `--build`.
- First run can take a bit (backend runs via Maven and downloads dependencies into the Compose volume cache).
- Compose defaults to `SPRING_PROFILES_ACTIVE=dev`.

### Stop

```bash
docker compose down
```

### Clean reset (delete DB volume)

```bash
docker compose down -v
```

Environment variables (optional) are documented in [.env.example](.env.example). Common ones:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`
- `SPRING_PROFILES_ACTIVE`
- `JWT_SECRET`, `JWT_EXPIRATION`, `CORS_ALLOWED_ORIGINS`
- `VITE_PROXY_TARGET`

### URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## 4) Demo (2 minutes)

1. Start the stack using the Quickstart above.
2. Open the app at http://localhost:5173.
3. Login:
   - When running with the `dev` profile (Compose default), the backend seeds demo users in [backend/src/main/java/com/taskmanager/api/config/DevDataSeeder.java](backend/src/main/java/com/taskmanager/api/config/DevDataSeeder.java).
   - Demo users (password is `password`): `alice`, `bob`, `charlie`, `dana`.
   - If you’re not running the `dev` profile, create an account via the UI at `/register`.
4. Click **Teams** → **New Team** → create a team.
5. From the new team card, click **View Tasks**, then create a task and change its status.
6. Optional: open Swagger UI and try the auth endpoints and task endpoints.

## 5) Tests

### Backend (JUnit)

```bash
cd backend
./mvnw -B test
```

Note: some Testcontainers-based integration tests are currently annotated with `@Disabled(...)` due to CI timing flakiness:
- [backend/src/test/java/com/taskmanager/api/AuthIntegrationTest.java](backend/src/test/java/com/taskmanager/api/AuthIntegrationTest.java)
- [backend/src/test/java/com/taskmanager/api/TeamTaskIntegrationTest.java](backend/src/test/java/com/taskmanager/api/TeamTaskIntegrationTest.java)
- [backend/src/test/java/com/taskmanager/api/TaskManagerApiApplicationTests.java](backend/src/test/java/com/taskmanager/api/TaskManagerApiApplicationTests.java)

### E2E (Playwright smoke)

Prereqs:
- Backend reachable at http://localhost:8080 (Quickstart Compose is the easiest way)

```bash
cd frontend
npm ci
npm run e2e:install
npm run e2e
```

The smoke tests live in `frontend/e2e/smoke.spec.js` and cover:
- Login
- Create team → view tasks → create task → change status

Optional env vars:
- `E2E_USERNAME` / `E2E_PASSWORD` (defaults to `alice/password`)
- `PLAYWRIGHT_BASE_URL` (defaults to http://localhost:5173)

## 6) Project structure

- [backend/](backend/) — Spring Boot API
- [frontend/](frontend/) — React + Vite UI
- [docker-compose.yml](docker-compose.yml) — local dev stack (db + backend + frontend)
- [frontend/e2e/](frontend/e2e/) — Playwright tests
- [backend/src/main/resources/db/migration/active/](backend/src/main/resources/db/migration/active/) — Flyway migrations

## 7) Troubleshooting

- Port conflicts:
	- Frontend uses `5173`
	- Backend uses `8080`
	- Postgres maps to host port `5433` by default (override `POSTGRES_PORT` in `.env`)
- Rebuild containers after dependency changes:

```bash
docker compose down
docker compose up --build
```

- Reset the DB volume (re-runs migrations + dev seed on next start):

```bash
docker compose down -v
docker compose up
```

- Running the frontend outside Docker:
  - Vite proxies `/api` to `VITE_PROXY_TARGET` (defaults to `http://localhost:8080`).
