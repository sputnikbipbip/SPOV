using Xunit;
using SPOV.Domain.Common;
using FluentAssertions;

namespace SPOV_Backend.Tests.Domain;

public sealed class ResultTests
{
    [Fact]
    public void Success_Should_SetIsSuccess()
    {
        var result = Result<int>.Success(42);

        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Data.Should().Be(42);
    }

    [Fact]
    public void Failure_Should_SetIsFailure()
    {
        var error = Error.NotFound("not found");
        var result = Result<int>.Failure(error);

        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
    }

    [Fact]
    public void Match_Should_CallOnSuccess_WhenSuccess()
    {
        var result = Result<string>.Success("ok");

        var output = result.Match(
            data => $"got {data}",
            error => $"error {error.Code}");

        output.Should().Be("got ok");
    }

    [Fact]
    public void Match_Should_CallOnFailure_WhenFailure()
    {
        var result = Result<string>.Failure(Error.NotFound("missing"));

        var output = result.Match(
            data => $"got {data}",
            error => $"error {error.Code}");

        output.Should().Be("error NOT_FOUND");
    }

    [Fact]
    public void NonGeneric_Result_Success_Should_SetIsSuccess()
    {
        var result = Result.Success();

        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
    }

    [Fact]
    public void NonGeneric_Result_Failure_Should_SetIsFailure()
    {
        var result = Result.Failure(Error.Conflict("conflict"));

        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Error.Should().NotBeNull();
    }
}
