using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NSubstitute;
using SPOV.WebApi.Middleware;
using Xunit;

namespace SPOV_Backend.Tests.UnitTests.Middleware;

public sealed class ExceptionHandlingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_WhenUnhandledExceptionOccurs_ReturnsSafeProblemDetails()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var middleware = new ExceptionHandlingMiddleware(
            _ => throw new InvalidOperationException("database password leaked"),
            Substitute.For<ILogger<ExceptionHandlingMiddleware>>());

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
        context.Response.ContentType.Should().StartWith("application/problem+json");
        context.Response.Body.Position = 0;
        using var json = await JsonDocument.ParseAsync(context.Response.Body);
        json.RootElement.GetProperty("title").GetString().Should().Be("An internal server error occurred.");
        json.RootElement.ToString().Should().NotContain("database password leaked");
    }
}
