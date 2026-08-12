using Xunit;
using AutoMapper;
using NSubstitute;
using FluentAssertions;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class MembershipTierServiceTests
{
    private readonly IMembershipTierRepository _tierRepository;
    private readonly IMapper _mapper;
    private readonly MembershipTierService _sut;

    public MembershipTierServiceTests()
    {
        _tierRepository = Substitute.For<IMembershipTierRepository>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new MembershipTierService(_tierRepository, _mapper);
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnPagedTiersWithMetadata()
    {
        var tiers = new List<MembershipTier>
        {
            new() { Id = 1, Name = "Base", Price = 10, BillingInterval = BillingInterval.Yearly },
            new() { Id = 2, Name = "Premium", Price = 20, BillingInterval = BillingInterval.Yearly }
        };
        _tierRepository.GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<MembershipTier>(tiers, 27, 1, 10));

        var result = await _sut.GetAllAsync(new QueryFilter(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Data.Should().HaveCount(2);
        result.Data.Data[1].Name.Should().Be("Premium");
        result.Data.TotalRecords.Should().Be(27);
        result.Data.TotalPages.Should().Be(3);
    }
}