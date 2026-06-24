FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["global.json", "./"]
COPY ["Directory.Packages.props", "./"]
COPY ["SPOV_Backend/SPOV_Backend.csproj", "SPOV_Backend/"]
RUN dotnet restore "SPOV_Backend/SPOV_Backend.csproj"
COPY . .
WORKDIR "/src/SPOV_Backend"
RUN dotnet publish "./SPOV_Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
RUN mkdir -p /app/data && chown -R 1000:1000 /app
USER 1000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SPOV_Backend.dll"]
