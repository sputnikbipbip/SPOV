using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
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

        await db.Database.EnsureCreatedAsync();

        await using var conn = new NpgsqlConnection(db.Database.GetConnectionString());
        await conn.OpenAsync();

        // Ensure Location column exists
        await using var checkCmd = new NpgsqlCommand("SELECT column_name FROM information_schema.columns WHERE table_name = 'Events' AND column_name = 'Location'", conn);
        var locationExists = await checkCmd.ExecuteScalarAsync();
        if (locationExists is null)
        {
            await using var alterCmd = new NpgsqlCommand("ALTER TABLE \"Events\" ADD COLUMN \"Location\" character varying(200)", conn);
            await alterCmd.ExecuteNonQueryAsync();
        }

        // Ensure ImageData column exists
        await using var imageCheckCmd = new NpgsqlCommand("SELECT column_name FROM information_schema.columns WHERE table_name = 'Events' AND column_name = 'ImageData'", conn);
        var imageDataExists = await imageCheckCmd.ExecuteScalarAsync();
        if (imageDataExists is null)
        {
            await using var alterImageCmd = new NpgsqlCommand("ALTER TABLE \"Events\" ADD COLUMN \"ImageData\" text", conn);
            await alterImageCmd.ExecuteNonQueryAsync();
        }

        // Drop CeCredits if it exists
        await using var creditsDropCmd = new NpgsqlCommand("ALTER TABLE \"Events\" DROP COLUMN IF EXISTS \"CeCredits\"", conn);
        await creditsDropCmd.ExecuteNonQueryAsync();

        // Ensure Payment columns exist
        await using var paymentColumnsCmd = new NpgsqlCommand("""
            ALTER TABLE "Payments"
            ADD COLUMN IF NOT EXISTS "ProofStorageKey" character varying(500),
            ADD COLUMN IF NOT EXISTS "ProofFileName" character varying(255),
            ADD COLUMN IF NOT EXISTS "ProofContentType" character varying(100),
            ADD COLUMN IF NOT EXISTS "ProofUploadedAt" timestamp with time zone,
            ADD COLUMN IF NOT EXISTS "ReviewedAt" timestamp with time zone,
            ADD COLUMN IF NOT EXISTS "ReviewedByUserId" character varying(450),
            ADD COLUMN IF NOT EXISTS "ReviewNote" character varying(1000),
            ADD COLUMN IF NOT EXISTS "Version" uuid NOT NULL DEFAULT gen_random_uuid()
            """, conn);
        await paymentColumnsCmd.ExecuteNonQueryAsync();
    }

    public static async Task SeedDataAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

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

        if (await userManager.FindByEmailAsync("admin@spov.pt") is null)
        {
            var admin = new ApplicationUser { UserName = "admin@spov.pt", Email = "admin@spov.pt", FullName = "Administrador SPOV", EmailConfirmed = true };
            var result = await userManager.CreateAsync(admin, "Admin123!");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, Roles.Administrator);
        }
    }
}
