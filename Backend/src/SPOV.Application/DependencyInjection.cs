using Microsoft.Extensions.DependencyInjection;
using SPOV.Application.Services;

namespace SPOV.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);

        services.AddScoped<INewsService, NewsService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();

        return services;
    }
}
