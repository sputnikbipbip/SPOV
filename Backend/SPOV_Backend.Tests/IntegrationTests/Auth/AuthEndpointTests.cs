using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace SPOV_Backend.Tests.IntegrationTests.Auth;

public sealed class AuthEndpointTests
{
    [Fact]
    public async Task Post_Login_WithAdminCredentials_Should_ReturnToken()
    {
        await using var factory = new ApiApplicationFactory();

        using var client = factory.CreateClient();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        body.Should().NotBeNull();
        body!.AccessToken.Should().NotBeNullOrEmpty();
        body.TokenType.Should().Be("Bearer");
    }

    [Fact]
    public async Task Post_Login_WithInvalidCredentials_Should_ReturnUnauthorized()
    {
        await using var factory = new ApiApplicationFactory();

        using var client = factory.CreateClient();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "wrongpassword"
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private sealed class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }
}
