FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Directory.Packages.props", "./"]
COPY ["Directory.Build.props", "./"]
COPY ["src/SPOV.WebApi/SPOV.WebApi.csproj", "src/SPOV.WebApi/"]
COPY ["src/SPOV.Infrastructure/SPOV.Infrastructure.csproj", "src/SPOV.Infrastructure/"]
COPY ["src/SPOV.Application/SPOV.Application.csproj", "src/SPOV.Application/"]
COPY ["src/SPOV.Domain/SPOV.Domain.csproj", "src/SPOV.Domain/"]
RUN dotnet restore "src/SPOV.WebApi/SPOV.WebApi.csproj"
COPY . .
WORKDIR "/src/src/SPOV.WebApi"
RUN dotnet publish "SPOV.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
RUN mkdir -p /app/data && chown -R 1000:1000 /app
USER 1000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SPOV.WebApi.dll"]
