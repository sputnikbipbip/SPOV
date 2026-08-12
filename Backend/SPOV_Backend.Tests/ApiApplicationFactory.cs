using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace SPOV_Backend.Tests;

/// <summary>
/// WebApplicationFactory that gives every instance its own isolated PostgreSQL database,
/// so integration tests can run in parallel without sharing seed/state.
/// Connection settings come from environment variables (POSTGRES_HOST, POSTGRES_PORT,
/// POSTGRES_USER, POSTGRES_PASSWORD) so CI can point tests at a Postgres service.
/// </summary>
public sealed class ApiApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"spov_test_{Guid.NewGuid():N}";

    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        return base.CreateHost(builder);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = BuildConnectionString(_databaseName)
            });
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
            TryDropDatabase();
    }

    private static string BuildConnectionString(string database) =>
        $"Host={DbHost};Port={DbPort};Database={database};Username={DbUser};Password={DbPassword}";

    private static string DbHost => Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
    private static string DbPort => Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
    private static string DbUser => Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "spov";
    private static string DbPassword => Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "changeme";

    private void TryDropDatabase()
    {
        try
        {
            using var conn = new NpgsqlConnection(BuildConnectionString("postgres"));
            conn.Open();
            using var cmd = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{_databaseName}\" WITH (FORCE)", conn);
            cmd.ExecuteNonQuery();
        }
        catch
        {
            // Best-effort cleanup; a failed drop must not break test teardown.
        }
    }
}
