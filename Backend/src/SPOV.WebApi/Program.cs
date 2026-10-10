using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;
using SPOV.Application;
using SPOV.Domain.Enums;
using SPOV.Infrastructure;
using SPOV.Infrastructure.Data;
using SPOV.Infrastructure.Emails;
using SPOV.Infrastructure.Identity;
using SPOV.Infrastructure.Options;
using SPOV.WebApi.Extensions;
using SPOV.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);
var seedDevelopmentData = args.Any(argument =>
    argument.Equals("--seed-dev", StringComparison.OrdinalIgnoreCase)
    || argument.Equals("--seed-dev=true", StringComparison.OrdinalIgnoreCase));
if (seedDevelopmentData && !builder.Environment.IsDevelopment())
    throw new InvalidOperationException("The --seed-dev command can only run in the Development environment.");

// --- 1. Service Registration ---
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddScoped<DevelopmentDataSeeder>();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddEndpointsApiExplorer();

// Database & Identity
builder.Services.AddApplication();
builder.Services.AddInfrastructure(
    builder.Configuration,
    builder.Environment.IsDevelopment() && !seedDevelopmentData);
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Configuration Options
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
builder.Services.Configure<AppUrlOptions>(builder.Configuration.GetSection("AppUrl"));

// Custom Services
builder.Services.AddSingleton<ISmtpResourceFactory, MailKitSmtpResourceFactory>();
builder.Services.AddSingleton<IEmailSender<ApplicationUser>, EmailSenderService>();

// CORS
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
    if (!builder.Environment.IsDevelopment() && allowedOrigins.Length == 0)
        throw new InvalidOperationException("Configure Cors:AllowedOrigins before starting outside Development.");

    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        if (context.Request.Path.StartsWithSegments("/api/auth/forgotPassword"))
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromHours(1),
                QueueLimit = 0,
                AutoReplenishment = true
            });
        }
        return RateLimitPartition.GetNoLimiter(string.Empty);
    });
});

// Authorization
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole(Roles.Administrator))
    .AddPolicy("PartnerOrAdmin", policy => policy.RequireRole(Roles.Partner, Roles.Administrator));

var app = builder.Build();

// --- 2. Database Initialization ---
await app.ApplyMigrationsAsync();
await app.SeedDataAsync();

if (seedDevelopmentData)
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<DevelopmentDataSeeder>().SeedAsync();
    return;
}

// --- 3. Middleware Pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "SPOV v1");
    });
    app.MapScalarApiReference();
}
else
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Custom Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Endpoints
app.MapHealthChecks("/health");
app.MapGroup("/api/auth").MapIdentityApi<ApplicationUser>();
app.MapControllers();

app.Run();

public partial class Program;
