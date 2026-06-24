using System.Net;
using Xunit;

namespace SPOV_Backend.Tests;

public sealed class HealthTests : IClassFixture<ApiApplicationFactory>
{
    private readonly ApiApplicationFactory factory;

    public HealthTests(ApiApplicationFactory factory)
    {
        this.factory = factory;
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsOk()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
