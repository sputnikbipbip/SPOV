using System.Net;
using Xunit;
using FluentAssertions;

namespace SPOV_Backend.Tests.IntegrationTests.Health;

public sealed class HealthEndpointTests : IClassFixture<ApiApplicationFactory>
{
    private readonly ApiApplicationFactory _factory;

    public HealthEndpointTests(ApiApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Get_Health_Should_ReturnOk()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
