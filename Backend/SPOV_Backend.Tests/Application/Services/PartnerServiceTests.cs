using AutoMapper;
using FluentAssertions;
using NSubstitute;
using SPOV.Application.Common;
using SPOV.Application.Common.Interfaces;
using SPOV.Application.DTOs.Partners;
using SPOV.Application.DTOs.Payments;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;
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
        _paymentRepository.GetByPartnerIdAsync(1).Returns(new List<Payment>
        {
            new() { PartnerId = 1, Status = "Verified" }
        });

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
    public async Task ApproveAsync_Should_RequireVerifiedPayment()
    {
        var partner = new Partner { Id = 1, FullName = "Pending", MembershipStatus = MembershipStatus.Pending };
        _partnerRepository.GetByIdAsync(1).Returns(partner);
        _paymentRepository.GetByPartnerIdAsync(1).Returns(new List<Payment>
        {
            new() { PartnerId = 1, Status = "Submitted" }
        });

        var result = await _sut.ApproveAsync(1);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
        await _partnerRepository.DidNotReceive().UpdateAsync(Arg.Any<Partner>());
    }

    [Fact]
    public async Task RegisterAsync_Should_CalculateFeesOnTheServer()
    {
        var request = new RegisterPartnerRequest
        {
            FullName = "New Partner",
            Email = "new@spov.pt",
            Password = "Partner123!",
            Phone = "+351 900 000 000",
            PartnerType = "Professional",
            InitiationFee = 1m,
            QuotaValue = 1m,
            TotalAmount = 2m
        };
        _partnerRepository.GetByEmailAsync(request.Email).Returns((Partner?)null);
        _identityService.UserExistsByEmailAsync(request.Email).Returns(false);
        _identityService.CreateUserAsync(request.Email, request.Password, request.FullName)
            .Returns((true, null, "new-user"));
        _partnerRepository.AddWithPaymentAsync(Arg.Any<Partner>(), Arg.Any<Payment>())
            .Returns(call => call.Arg<Partner>());

        var result = await _sut.RegisterAsync(request);

        result.IsSuccess.Should().BeTrue();
        result.Data!.InitiationFee.Should().Be(30m);
        result.Data.QuotaValue.Should().Be(50m);
        result.Data.TotalAmount.Should().Be(80m);
        result.Data.Payments.Should().ContainSingle(payment => payment.Amount == 80m);
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllPartners()
    {
        var partners = new List<Partner>
        {
            new() { Id = 1, FullName = "Partner A", Email = "a@spov.pt", MembershipStatus = MembershipStatus.Pending, JoinedAt = DateTime.UtcNow },
            new() { Id = 2, FullName = "Partner B", Email = "b@spov.pt", MembershipStatus = MembershipStatus.Active, JoinedAt = DateTime.UtcNow }
        };
        _partnerRepository.GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Partner>(partners, partners.Count, 1, 10));

        var result = await _sut.GetAllAsync(new QueryFilter(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Data.Should().HaveCount(2);
        result.Data.TotalRecords.Should().Be(2);
        result.Data.TotalPages.Should().Be(1);
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

    [Fact]
    public async Task GetAdminProfileAsync_Should_ReturnFullProfileWithPayments()
    {
        var partner = new Partner
        {
            Id = 7,
            FullName = "Admin View",
            Email = "adminview@spov.pt",
            Phone = "+351 900 000 007",
            TaxId = "123456789",
            City = "Porto",
            Profession = "Médico Veterinário",
            MembershipStatus = MembershipStatus.Pending,
            JoinedAt = DateTime.UtcNow
        };
        var payments = new List<Payment>
        {
            new() { Id = 1, PartnerId = 7, Amount = 80, Currency = "EUR", Status = "Pending", Provider = "MB" }
        };
        _partnerRepository.GetByIdAsync(7).Returns(partner);
        _paymentRepository.GetByPartnerIdAsync(7).Returns(payments);

        var result = await _sut.GetAdminProfileAsync(7);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(7);
        result.Data.TaxId.Should().Be("123456789");
        result.Data.Profession.Should().Be("Médico Veterinário");
        result.Data.MembershipStatus.Should().Be("Pending");
        result.Data.Payments.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAdminProfileAsync_Should_ReturnNotFound_WhenMissing()
    {
        _partnerRepository.GetByIdAsync(99).Returns((Partner?)null);

        var result = await _sut.GetAdminProfileAsync(99);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task CreateByAdminAsync_Should_CreateActivePartnerWithSubscriptionDates()
    {
        var joinedAt = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc);
        var expiresAt = new DateTime(2027, 3, 1, 0, 0, 0, DateTimeKind.Utc);
        var request = new CreatePartnerRequest
        {
            FullName = "Miguel Almeida",
            Email = "miguel@spov.pt",
            Phone = "+351 900 000 111",
            PartnerType = "Professional",
            JoinedAt = joinedAt,
            MembershipExpiresAt = expiresAt,
            MembershipTierId = 2,
            InitiationFee = 30m,
            QuotaValue = 50m,
            TotalAmount = 80m
        };

        _partnerRepository.GetByEmailAsync(request.Email).Returns((Partner?)null);
        _identityService.UserExistsByEmailAsync(request.Email).Returns(false);
        _identityService.CreateUserAsync(request.Email, Arg.Any<string>(), request.FullName)
            .Returns((true, null, "user-miguel"));
        _identityService.AddToRoleAsync("user-miguel", Roles.Partner).Returns(true);

        Partner? created = null;
        _partnerRepository.AddAsync(Arg.Do<Partner>(p => created = p)).Returns(ci => ci.Arg<Partner>());

        var result = await _sut.CreateByAdminAsync(request);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Partner.MembershipStatus.Should().Be("Active");
        result.Data.Partner.Email.Should().Be(request.Email);
        result.Data.TemporaryPassword.Should().NotBeNullOrEmpty();
        result.Data.TemporaryPassword.Should().MatchRegex(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{6,}$");

        created.Should().NotBeNull();
        created!.MembershipStatus.Should().Be(MembershipStatus.Active);
        created.JoinedAt.Should().Be(joinedAt);
        created.MembershipExpiresAt.Should().Be(expiresAt);
        created.MembershipTierId.Should().Be(2);
        created.UserId.Should().Be("user-miguel");

        await _identityService.Received(1).CreateUserAsync(
            request.Email, Arg.Is<string>(p => p == result.Data.TemporaryPassword), request.FullName);
        await _identityService.Received(1).AddToRoleAsync("user-miguel", Roles.Partner);
    }

    [Fact]
    public async Task CreateByAdminAsync_Should_ReturnConflict_WhenPartnerEmailExists()
    {
        var request = new CreatePartnerRequest { FullName = "Miguel Almeida", Email = "miguel@spov.pt", Phone = "+351 900 000 111", PartnerType = "Professional" };
        _partnerRepository.GetByEmailAsync(request.Email)
            .Returns(new Partner { Id = 1, Email = request.Email });

        var result = await _sut.CreateByAdminAsync(request);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public async Task CreateByAdminAsync_Should_ReturnConflict_WhenUserEmailExists()
    {
        var request = new CreatePartnerRequest { FullName = "Miguel Almeida", Email = "miguel@spov.pt", Phone = "+351 900 000 111", PartnerType = "Professional" };
        _partnerRepository.GetByEmailAsync(request.Email).Returns((Partner?)null);
        _identityService.UserExistsByEmailAsync(request.Email).Returns(true);

        var result = await _sut.CreateByAdminAsync(request);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
    }
}
