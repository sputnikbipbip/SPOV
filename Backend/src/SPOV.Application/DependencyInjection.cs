using Microsoft.Extensions.DependencyInjection;
using SPOV.Application.Services;

namespace SPOV.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);

        services.AddScoped<INewsService, NewsService>();
        services.AddScoped<IPartnerService, PartnerService>();
        services.AddScoped<IMembershipTierService, MembershipTierService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IEventRegistrationService, EventRegistrationService>();
        services.AddScoped<IArticleService, ArticleService>();
        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<IDocumentService, DocumentService>();

        return services;
    }
}
