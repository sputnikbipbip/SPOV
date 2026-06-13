using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SPOV_Backend.Data;
using SPOV_Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole(Roles.Administrator))
    .AddPolicy("PartnerOrAdmin", policy => policy.RequireRole(Roles.Partner, Roles.Administrator));

var app = builder.Build();

// Seed roles and ensure database is created
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "SPOV_Backend v1");
    });
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.MapGroup("/api/auth").MapIdentityApi<ApplicationUser>();

app.MapGet("/api/news", async (ApplicationDbContext db) =>
    await db.NewsPosts.OrderByDescending(n => n.PublishedAt).ToListAsync())
    .WithName("GetNews");

app.MapPost("/api/news", async (NewsPost news, ApplicationDbContext db) =>
{
    db.NewsPosts.Add(news);
    await db.SaveChangesAsync();
    return Results.Created($"/api/news/{news.Id}", news);
})
.RequireAuthorization("AdminOnly")
.WithName("CreateNews");

app.MapGet("/api/documents", async (ApplicationDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (user.IsInRole(Roles.Administrator))
        return Results.Ok(await db.SharedDocuments.ToListAsync());
    return Results.Ok(await db.SharedDocuments.Where(d => d.OwnerId == userId).ToListAsync());
})
.RequireAuthorization("PartnerOrAdmin")
.WithName("GetDocuments");

app.MapPost("/api/documents", async (IFormFile file, string? category, ApplicationDbContext db, ClaimsPrincipal user, IWebHostEnvironment env) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var uploadsFolder = Path.Combine(env.ContentRootPath, "uploads");
    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
    var filePath = Path.Combine("uploads", fileName);
    var fullPath = Path.Combine(env.ContentRootPath, filePath);

    using var stream = File.Create(fullPath);
    await file.CopyToAsync(stream);

    var doc = new SharedDocument
    {
        FileName = file.FileName,
        FilePath = filePath,
        Category = category,
        OwnerId = userId
    };

    db.SharedDocuments.Add(doc);
    await db.SaveChangesAsync();
    return Results.Created($"/api/documents/{doc.Id}", doc);
})
.DisableAntiforgery() // Needed for simple file upload in Minimal APIs if antiforgery is enabled
.RequireAuthorization("PartnerOrAdmin")
.WithName("UploadDocument");

app.MapGet("/api/subscriptions/me", async (ApplicationDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);
    return sub != null ? Results.Ok(sub) : Results.NotFound("No subscription found.");
})
.RequireAuthorization()
.WithName("GetMySubscription");

app.MapGet("/api/admin/subscriptions", async (ApplicationDbContext db) =>
    await db.Subscriptions.Include(s => s.User).ToListAsync())
    .RequireAuthorization("AdminOnly")
    .WithName("GetAllSubscriptions");

app.MapPatch("/api/admin/subscriptions/{id}", async (int id, DateTime newEndDate, ApplicationDbContext db) =>
{
    var sub = await db.Subscriptions.FindAsync(id);
    if (sub == null) return Results.NotFound();

    sub.EndDate = newEndDate;
    await db.SaveChangesAsync();
    return Results.Ok(sub);
})
.RequireAuthorization("AdminOnly")
.WithName("UpdateSubscriptionDeadline");

app.Run();
