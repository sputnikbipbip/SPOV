using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SPOV.Application.Common.Interfaces;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;
using SPOV.Infrastructure.Repositories;
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
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")
                ?? "Data Source=spov.db"));

        services.AddScoped<INewsRepository, NewsRepository>();
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();

        services.AddScoped<IFileStorageService>(_ =>
            new FileStorageService(contentRootPath));

        return services;
    }
}
