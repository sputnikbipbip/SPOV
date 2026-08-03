using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace SPOV_Backend.Tests.IntegrationTests.Me;

public sealed class MeEndpointTests
{
    private static WebApplicationFactory<Program> CreateFactory() =>
        new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:DefaultConnection"] =
                            "Host=localhost;Port=5432;Database=spov;Username=spov;Password=ciD7M9edVCSTJtcgapmFw3FO"
                    });
                });
            });

    [Fact]
    public async Task Get_Me_WithAdminToken_Should_ContainAdministratorRole()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });
        var loginBody = await login.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginBody!.AccessToken);

        var response = await client.GetAsync("/api/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var me = await response.Content.ReadFromJsonAsync<CurrentUserResponse>();
        me.Should().NotBeNull();
        me!.Roles.Should().Contain("Administrator");
    }

    [Fact]
    public async Task Get_Me_WithPartnerToken_Should_NotContainAdministratorRole()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"me-partner-{Guid.NewGuid():N}@spov.pt";
        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Me Test",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "Partner123!"
        });
        var loginBody = await login.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginBody!.AccessToken);

        var response = await client.GetAsync("/api/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var me = await response.Content.ReadFromJsonAsync<CurrentUserResponse>();
        me.Should().NotBeNull();
        me!.Roles.Should().Contain("Partner");
        me.Roles.Should().NotContain("Administrator");
    }

    [Fact]
    public async Task Get_Me_WithoutToken_Should_ReturnUnauthorized()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private sealed class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
    }

    private sealed class CurrentUserResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = [];
    }
}
