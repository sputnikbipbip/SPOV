using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SPOV.Domain.Entities;
using SPOV.Infrastructure.Data;
using SPOV.WebApi.Extensions;
using Xunit;

namespace SPOV_Backend.Tests.IntegrationTests;

public sealed class DevelopmentDataSeederTests
{
    [Fact]
    public async Task SeedAsync_CreatesDemoRecords_AndCanBeRunMoreThanOnce()
    {
        await using var factory = new ApiApplicationFactory();
        using var client = factory.CreateClient();
        using var scope = factory.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<DevelopmentDataSeeder>();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await seeder.SeedAsync();
        await seeder.SeedAsync();

        (await db.MembershipTiers.CountAsync(t => t.Name.StartsWith("Demo "))).Should().Be(2);
        (await db.Partners.CountAsync(p => p.Email.StartsWith("demo.") && p.Email.EndsWith("@spov.local"))).Should().Be(3);
        (await db.Payments.CountAsync(p => p.Provider == DevelopmentDataSeeder.ProviderName)).Should().Be(3);
        (await db.Events.CountAsync(e => e.Title.StartsWith("[DEMO]") )).Should().Be(2);
        (await db.EventRegistrations.CountAsync()).Should().Be(2);
        (await db.Articles.CountAsync(a => a.Title.StartsWith("[DEMO]"))).Should().Be(2);
    }

    [Fact]
    public async Task SeedAsync_OutsideDevelopment_ThrowsWithoutWritingData()
    {
        await using var factory = new ApiApplicationFactory();
        using var client = factory.CreateClient();
        using var scope = factory.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<DevelopmentDataSeeder>();
        var environment = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
        var originalEnvironment = environment.EnvironmentName;
        environment.EnvironmentName = Environments.Production;

        try
        {
            var action = () => seeder.SeedAsync();
            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Demo data can only be seeded in the Development environment.");
        }
        finally
        {
            environment.EnvironmentName = originalEnvironment;
        }
    }

    [Fact]
    public async Task SeedAsync_WithWeakPartnerPassword_ExplainsRequirementsAndWritesNothing()
    {
        await using var factory = new ApiApplicationFactory { DevelopmentSeedPartnerPassword = "weakpassword" };
        using var client = factory.CreateClient();
        using var scope = factory.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<DevelopmentDataSeeder>();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => seeder.SeedAsync());

        exception.Message.Should().Contain("DevelopmentSeed:PartnerPassword")
            .And.Contain("uppercase")
            .And.Contain("digit")
            .And.Contain("special character");
        (await db.MembershipTiers.CountAsync(t => t.Name.StartsWith("Demo "))).Should().Be(0);
        (await db.Partners.CountAsync(p => p.Email.StartsWith("demo.") && p.Email.EndsWith("@spov.local"))).Should().Be(0);
        (await db.Events.CountAsync(e => e.Title.StartsWith("[DEMO]") )).Should().Be(0);
    }
}
