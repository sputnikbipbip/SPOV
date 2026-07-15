using Xunit;
using SPOV.Domain.Common;
using FluentAssertions;

namespace SPOV_Backend.Tests.Domain;

public sealed class ErrorTests
{
    [Fact]
    public void NotFound_Should_HaveCorrectValues()
    {
        var error = Error.NotFound("user not found");

        error.Code.Should().Be("NOT_FOUND");
        error.Description.Should().Be("user not found");
        error.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public void Validation_Should_HaveCorrectValues()
    {
        var error = Error.Validation("invalid input");

        error.Code.Should().Be("VALIDATION");
        error.Type.Should().Be(ErrorType.Validation);
    }

    [Fact]
    public void Conflict_Should_HaveCorrectValues()
    {
        var error = Error.Conflict("already exists");

        error.Code.Should().Be("CONFLICT");
        error.Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public void Unauthorized_Should_HaveCorrectValues()
    {
        var error = Error.Unauthorized("access denied");

        error.Code.Should().Be("UNAUTHORIZED");
        error.Type.Should().Be(ErrorType.Unauthorized);
    }

    [Fact]
    public void Failure_Should_HaveCorrectValues()
    {
        var error = Error.Failure("something broke");

        error.Code.Should().Be("FAILURE");
        error.Type.Should().Be(ErrorType.Failure);
    }
}
