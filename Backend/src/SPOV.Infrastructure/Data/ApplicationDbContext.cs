using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Infrastructure.Identity;

namespace SPOV.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<MembershipTier> MembershipTiers => Set<MembershipTier>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();
    public DbSet<NewsPost> NewsPosts => Set<NewsPost>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<SharedDocument> SharedDocuments => Set<SharedDocument>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
