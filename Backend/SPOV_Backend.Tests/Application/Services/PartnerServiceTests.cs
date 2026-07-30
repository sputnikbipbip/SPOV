using AutoMapper;
using FluentAssertions;
using NSubstitute;
using SPOV.Application.Common.Interfaces;
using SPOV.Application.DTOs.Partners;
using SPOV.Application.DTOs.Payments;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;
using Xunit;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class PartnerServiceTests
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IIdentityService _identityService;
    private readonly IMapper _mapper;
    private readonly PartnerService _sut;

    public PartnerServiceTests()
    {
        _partnerRepository = Substitute.For<IPartnerRepository>();
        _paymentRepository = Substitute.For<IPaymentRepository>();
        _identityService = Substitute.For<IIdentityService>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new PartnerService(_partnerRepository, _paymentRepository, _identityService, _mapper);
    }

    [Fact]
    public async Task ApproveAsync_Should_SetStatusToActive_WhenPartnerExists()
    {
        var partner = new Partner
        {
            Id = 1,
            UserId = "user-1",
            FullName = "Test Partner",
            Email = "test@spov.pt",
            MembershipStatus = MembershipStatus.Pending,
            JoinedAt = DateTime.UtcNow
        };
        _partnerRepository.GetByIdAsync(1).Returns(partner);

        var result = await _sut.ApproveAsync(1);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.MembershipStatus.Should().Be("Active");

        await _partnerRepository.Received(1).UpdateAsync(Arg.Is<Partner>(p =>
            p.Id == 1 && p.MembershipStatus == MembershipStatus.Active));
    }

    [Fact]
    public async Task ApproveAsync_Should_ReturnNotFound_WhenPartnerDoesNotExist()
    {
        _partnerRepository.GetByIdAsync(99).Returns((Partner?)null);

        var result = await _sut.ApproveAsync(99);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllPartners()
    {
        var partners = new List<Partner>
        {
            new() { Id = 1, FullName = "Partner A", Email = "a@spov.pt", MembershipStatus = MembershipStatus.Pending, JoinedAt = DateTime.UtcNow },
            new() { Id = 2, FullName = "Partner B", Email = "b@spov.pt", MembershipStatus = MembershipStatus.Active, JoinedAt = DateTime.UtcNow }
        };
        _partnerRepository.GetAllAsync().Returns(partners);

        var result = await _sut.GetAllAsync();

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByIdAsync_Should_ReturnPartner_WhenExists()
    {
        var partner = new Partner { Id = 1, FullName = "Test", Email = "test@spov.pt", MembershipStatus = MembershipStatus.Active, JoinedAt = DateTime.UtcNow };
        _partnerRepository.GetByIdAsync(1).Returns(partner);

        var result = await _sut.GetByIdAsync(1);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetByIdAsync_Should_ReturnNotFound_WhenMissing()
    {
        _partnerRepository.GetByIdAsync(99).Returns((Partner?)null);

        var result = await _sut.GetByIdAsync(99);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task GetProfileByUserIdAsync_Should_ReturnProfileWithPayments()
    {
        var partner = new Partner { Id = 1, UserId = "user-1", FullName = "Test", Email = "test@spov.pt", MembershipStatus = MembershipStatus.Active, JoinedAt = DateTime.UtcNow };
        var payments = new List<Payment>
        {
            new() { Id = 1, PartnerId = 1, Amount = 80, Currency = "EUR", Status = "Completed", Provider = "MB" }
        };
        _partnerRepository.GetByUserIdAsync("user-1").Returns(partner);
        _paymentRepository.GetByPartnerIdAsync(1).Returns(payments);

        var result = await _sut.GetProfileByUserIdAsync("user-1");

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Payments.Should().HaveCount(1);
    }
}