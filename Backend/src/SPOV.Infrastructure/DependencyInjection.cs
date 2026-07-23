using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Scrutor;
using SPOV.Application.Common.Interfaces;
using SPOV.Infrastructure.Data;
using SPOV.Infrastructure.Services;

namespace SPOV.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        string contentRootPath)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));

        services.Scan(scan => scan
            .FromAssembliesOf(typeof(DependencyInjection))
            .AddClasses(classes => classes
                .InNamespaces("SPOV.Infrastructure.Repositories", "SPOV.Infrastructure.Services")
                .Where(c => c != typeof(FileStorageService)))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        services.AddScoped<IFileStorageService>(_ =>
            new FileStorageService(contentRootPath));

        return services;
    }
}
