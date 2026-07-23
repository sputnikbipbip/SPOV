using Microsoft.Extensions.DependencyInjection;
using Scrutor;

namespace SPOV.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);

        services.Scan(scan => scan
            .FromAssembliesOf(typeof(DependencyInjection))
            .AddClasses(classes => classes.InNamespaces("SPOV.Application.Services"))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
