.PHONY: help backend-restore backend-run backend-test frontend-install frontend-dev frontend-build docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make backend-restore   Restore .NET dependencies"
	@echo "  make backend-run       Run the ASP.NET Core API"
	@echo "  make backend-test      Run backend tests"
	@echo "  make frontend-install  Install frontend dependencies"
	@echo "  make frontend-dev      Start the Angular dev server"
	@echo "  make frontend-build    Build the Angular app"
	@echo "  make docker-up         Start the full stack with Docker Compose"
	@echo "  make docker-down       Stop Docker Compose services"

backend-restore:
	dotnet restore Backend/SPOV_Backend.sln

backend-run:
	dotnet run --project Backend/SPOV_Backend/SPOV_Backend.csproj

backend-test:
	dotnet test Backend/SPOV_Backend.Tests/SPOV_Backend.Tests.csproj

frontend-install:
	npm install --prefix Frontend

frontend-dev:
	npm run dev --prefix Frontend

frontend-build:
	npm run build --prefix Frontend

docker-up:
	docker compose up --build

docker-down:
	docker compose down
