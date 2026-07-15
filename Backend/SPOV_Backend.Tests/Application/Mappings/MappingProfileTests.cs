using Xunit;
using AutoMapper;
using SPOV.Application.Mappings;
using FluentAssertions;

namespace SPOV_Backend.Tests.Application.Mappings;

public sealed class MappingProfileTests
{
    [Fact]
    public void MappingProfile_Should_BeValid()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());

        config.AssertConfigurationIsValid();
    }
}
