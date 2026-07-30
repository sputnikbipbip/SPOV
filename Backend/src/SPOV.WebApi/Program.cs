using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Scalar.AspNetCore;
using SPOV.Application;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Infrastructure;
using SPOV.Infrastructure.Data;
using SPOV.Infrastructure.Identity;
using SPOV.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddHealthChecks();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole(Roles.Administrator))
    .AddPolicy("PartnerOrAdmin", policy => policy.RequireRole(Roles.Partner, Roles.Administrator));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.EnsureCreatedAsync();

    await using var conn = new NpgsqlConnection(db.Database.GetConnectionString());
    await conn.OpenAsync();
    await using var checkCmd = new NpgsqlCommand("SELECT column_name FROM information_schema.columns WHERE table_name = 'Events' AND column_name = 'Location'", conn);
    var locationExists = await checkCmd.ExecuteScalarAsync();
    if (locationExists is null)
    {
        await using var alterCmd = new NpgsqlCommand("ALTER TABLE \"Events\" ADD COLUMN \"Location\" character varying(200)", conn);
        await alterCmd.ExecuteNonQueryAsync();
    }

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
                CeCredits = 8,
                IsMembersOnly = false
            },
            new Event
            {
                Title = "Workshop: Abordagem ao Doente Oncológico",
                Description = "Workshop prático sobre fluxos de acompanhamento do doente oncológico, desde o diagnóstico ao follow-up. Inclui sessão de casos clínicos.",
                StartDate = new DateTime(2026, 9, 12, 9, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 9, 12, 17, 0, 0, DateTimeKind.Utc),
                Location = "Hospital Veterinário do Porto",
                CeCredits = 4,
                IsMembersOnly = false
            },
            new Event
            {
                Title = "Webinar: Atualização em Oncologia Clínica",
                Description = "Sessão online com especialistas sobre as últimas novidades em oncologia clínica veterinária. Dirigido a médicos veterinários e enfermeiros especializados.",
                StartDate = new DateTime(2026, 10, 5, 18, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 10, 5, 20, 0, 0, DateTimeKind.Utc),
                Location = "Online",
                CeCredits = 2,
                IsMembersOnly = true
            },
            new Event
            {
                Title = "Curso Intensivo de Enfermagem Oncológica",
                Description = "Curso intensivo dirigido a enfermeiros veterinários com focus em boas práticas, administração de quimioterapia e cuidados paliativos.",
                StartDate = new DateTime(2026, 3, 15, 9, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 3, 16, 18, 0, 0, DateTimeKind.Utc),
                Location = "Faculdade de Medicina Veterinária de Lisboa",
                CeCredits = 6,
                IsMembersOnly = false
            }
        );
        await db.SaveChangesAsync();
    }

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    if (!await roleManager.RoleExistsAsync(Roles.Administrator))
        await roleManager.CreateAsync(new IdentityRole(Roles.Administrator));
    if (!await roleManager.RoleExistsAsync(Roles.Partner))
        await roleManager.CreateAsync(new IdentityRole(Roles.Partner));

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    if (await userManager.FindByEmailAsync("admin@spov.pt") is null)
    {
        var admin = new ApplicationUser { UserName = "admin@spov.pt", Email = "admin@spov.pt", FullName = "Administrador SPOV" };
        var result = await userManager.CreateAsync(admin, "Admin123!");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, Roles.Administrator);
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "SPOV v1");
    });
    app.MapScalarApiReference();
}

app.UseExceptionHandler();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.MapHealthChecks("/health");
app.MapGroup("/api/auth").MapIdentityApi<ApplicationUser>();
app.MapControllers();

app.Run();

public partial class Program;
