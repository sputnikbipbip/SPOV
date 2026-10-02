using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Scrutor;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        bool isDevelopment = false)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found."));

            if (isDevelopment)
            {
                options.LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
                       .EnableSensitiveDataLogging()
                       .EnableDetailedErrors();
            }
        });

        services.Scan(scan => scan
            .FromAssembliesOf(typeof(DependencyInjection))
            .AddClasses(classes => classes
                .InNamespaces("SPOV.Infrastructure.Repositories", "SPOV.Infrastructure.Services"))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
