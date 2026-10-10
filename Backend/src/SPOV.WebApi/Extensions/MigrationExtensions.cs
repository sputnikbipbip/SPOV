using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Infrastructure.Data;
using SPOV.Infrastructure.Identity;

namespace SPOV.WebApi.Extensions;

public static class MigrationExtensions
{
    public static async Task ApplyMigrationsAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await db.Database.MigrateAsync();
    }

    public static async Task SeedDataAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        if (!await db.Events.AnyAsync())
        {
            db.Events.AddRange(
                new Event
                {
                    Title = "I Congresso SPOV 2025",
                    Description = "Primeiro congresso da Sociedade Portuguesa de Oncologia Veterinária. Três dias de partilha científica, mesas redondas e networking entre profissionais de oncologia veterinária.",
                    StartDate = new DateTime(2025, 11, 22, 9, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2025, 11, 22, 17, 30, 0, DateTimeKind.Utc),
                    Location = "Hotel Coimbra Aeminium",
                    IsMembersOnly = false
                },
                new Event
                {
                    Title = "Workshop: Abordagem ao Doente Oncológico",
                    Description = "Workshop prático sobre fluxos de acompanhamento do doente oncológico, desde o diagnóstico ao follow-up. Inclui sessão de casos clínicos.",
                    StartDate = new DateTime(2026, 9, 12, 9, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 9, 12, 17, 0, 0, DateTimeKind.Utc),
                    Location = "Hospital Veterinário do Porto",
                    IsMembersOnly = false
                },
                new Event
                {
                    Title = "Webinar: Atualização em Oncologia Clínica",
                    Description = "Sessão online com especialistas sobre as últimas novidades em oncologia clínica veterinária. Dirigido a médicos veterinários e enfermeiros especializados.",
                    StartDate = new DateTime(2026, 10, 5, 18, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 10, 5, 20, 0, 0, DateTimeKind.Utc),
                    Location = "Online",
                    IsMembersOnly = true
                },
                new Event
                {
                    Title = "Curso Intensivo de Enfermagem Oncológica",
                    Description = "Curso intensivo dirigido a enfermeiros veterinários com focus em boas práticas, administração de quimioterapia e cuidados paliativos.",
                    StartDate = new DateTime(2026, 3, 15, 9, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 3, 16, 18, 0, 0, DateTimeKind.Utc),
                    Location = "Faculdade de Medicina Veterinária de Lisboa",
                    IsMembersOnly = false
                }
            );
            await db.SaveChangesAsync();
        }

        if (!await roleManager.RoleExistsAsync(Roles.Administrator))
            await roleManager.CreateAsync(new IdentityRole(Roles.Administrator));
        if (!await roleManager.RoleExistsAsync(Roles.Partner))
            await roleManager.CreateAsync(new IdentityRole(Roles.Partner));

        var adminEmail = configuration["AdminBootstrap:Email"];
        var adminPassword = configuration["AdminBootstrap:Password"];
        if (string.IsNullOrWhiteSpace(adminEmail) != string.IsNullOrWhiteSpace(adminPassword))
            throw new InvalidOperationException("Configure both AdminBootstrap:Email and AdminBootstrap:Password, or neither.");

        if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword)
            && await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = configuration["AdminBootstrap:FullName"] ?? "Administrador SPOV",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, adminPassword);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, Roles.Administrator);
            else
                throw new InvalidOperationException($"Unable to create bootstrap administrator: {string.Join(", ", result.Errors.Select(error => error.Code))}");
        }
    }
}
