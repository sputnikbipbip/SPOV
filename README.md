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

```
Backend/                     # .NET solution — Clean Architecture
├── src/
│   ├── SPOV.Domain/         # Entities, enums, value objects (zero dependencies)
│   ├── SPOV.Application/    # Use cases, DTOs, interfaces
│   ├── SPOV.Infrastructure/ # EF Core, repositories, external services
│   └── SPOV.WebApi/         # Controllers, middleware, configuration
├── SPOV_Backend.Tests/      # Unit & integration tests (xUnit)
├── Directory.Build.props
└── SPOV_Backend.slnx
Frontend/                    # Angular standalone components
docker/                      # Frontend image definition
compose.yaml                 # Docker Compose (API + frontend)
docs/                        # API reference & roadmap
```
