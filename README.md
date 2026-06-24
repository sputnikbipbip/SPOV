# SPOV

This repository contains the SPOV application with an ASP.NET Core backend, an Angular frontend, and Docker-based local development support.

## Quick start

### Prerequisites

- .NET SDK 10
- Node.js 20+
- Docker (optional, for full-stack compose)

### Run locally

From the repository root:

```bash
make backend-restore
make backend-run
```

The API will be available at http://localhost:8080 and the health endpoint at http://localhost:8080/health.

### Frontend

```bash
make frontend-install
make frontend-dev
```

The Angular app will be available at http://localhost:4200.

### Full stack with Docker

```bash
cp .env.example .env
make docker-up
```

### Tests

```bash
make backend-test
```

## Project layout

- Backend/: .NET solution and API projects
  - Backend/SPOV_Backend/: ASP.NET Core API project
  - Backend/SPOV_Backend.Tests/: API tests
- Frontend/: Angular application
- docker/: frontend image definition
- compose.yaml: Docker Compose configuration for API and frontend

## Recommended next steps

- Keep the current split between frontend and backend, but add a small root-level developer workflow document.
- Consider a more structured backend layering strategy (API, application, domain, infrastructure) as the project grows.
- Add CI checks for build, tests, and Docker validation.
