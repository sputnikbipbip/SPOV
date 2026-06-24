using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SPOV_Backend.Data;
using SPOV_Backend.Models;
using SPOV_Backend.Repositories;
using SPOV_Backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

builder.Services.Configure<ConnectionStringsOptions>(builder.Configuration.GetSection("ConnectionStrings"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=spov.db"));

builder.Services.AddScoped<INewsRepository, NewsRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();

builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();

builder.Services.AddAuthorization();
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

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    if (!await roleManager.RoleExistsAsync(Roles.Administrator))
        await roleManager.CreateAsync(new IdentityRole(Roles.Administrator));
    if (!await roleManager.RoleExistsAsync(Roles.Partner))
        await roleManager.CreateAsync(new IdentityRole(Roles.Partner));
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "SPOV_Backend v1");
    });
    app.MapScalarApiReference();
}

app.UseExceptionHandler();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapHealthChecks("/health");
app.MapGroup("/api/auth").MapIdentityApi<ApplicationUser>();
app.MapControllers();

app.Run();

public sealed class ConnectionStringsOptions
{
    public string DefaultConnection { get; set; } = "Data Source=spov.db";
}

public partial class Program;
