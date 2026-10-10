# Deployment configuration

## Database migrations

The API applies versioned Entity Framework migrations at startup. `InitialCreate` is the baseline for new databases. Back up any database created by an earlier `EnsureCreated` version and establish a migration baseline before deploying this version to that database; do not point the new startup migration at an existing schema without that preparation.

Create future migrations from the repository root with:

```bash
dotnet ef migrations add <MigrationName> \
  --project Backend/src/SPOV.Infrastructure/SPOV.Infrastructure.csproj \
  --startup-project Backend/src/SPOV.WebApi/SPOV.WebApi.csproj \
  --output-dir Data/Migrations
```

## Administrator bootstrap

No administrator account is created unless both bootstrap values are configured. Supply these through a secret manager or environment variables:

- `AdminBootstrap__Email`
- `AdminBootstrap__Password`
- `AdminBootstrap__FullName` (optional)

The configured account receives the Administrator role on initial creation. Remove the bootstrap credentials from the deployment environment after setup if they are not needed for future recovery.

For local development, use .NET User Secrets rather than committing credentials:

```bash
dotnet user-secrets set "AdminBootstrap:Email" "admin@example.test" --project Backend/src/SPOV.WebApi/SPOV.WebApi.csproj
dotnet user-secrets set "AdminBootstrap:Password" "<a-unique-development-password>" --project Backend/src/SPOV.WebApi/SPOV.WebApi.csproj
```

## Local demo data

The normal startup seeds the Administrator and Partner roles plus four sample events. To add the larger repeatable demo dataset (three partner accounts, their payment states, two membership tiers, two demo events, registrations, and articles), configure the admin email/password and a password for the demo partner accounts, then run the one-shot command:

```bash
dotnet user-secrets set "DevelopmentSeed:PartnerPassword" "<a-unique-development-password>" --project Backend/src/SPOV.WebApi/SPOV.WebApi.csproj
make backend-seed-dev
```

The `AdminBootstrap` email and password must be configured so startup creates the administrator and the seeder can attribute reviewed demo payments to that administrator. The configured `DevelopmentSeed:PartnerPassword` must satisfy the app's Identity password policy (uppercase, lowercase, digit, and special character). Demo partner accounts use `demo.active@spov.local`, `demo.pending@spov.local`, and `demo.student@spov.local`; all use that configured password. The command applies migrations first, only runs in Development, and can be rerun without duplicating demo records. It adds data without clearing existing database contents.

## CORS

Set `Cors__AllowedOrigins` to the exact browser origins that host the frontend. The development settings allow the local Angular development server; outside Development the API refuses to start if the allow-list is empty.

Example:

```text
Cors__AllowedOrigins__0=https://spov.example.org
```

## Tests

Backend integration tests require PostgreSQL. Set `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` to a test database user that can create and drop isolated test databases. The GitHub Actions workflow starts a PostgreSQL service and runs backend tests, frontend tests, and the production frontend build.
