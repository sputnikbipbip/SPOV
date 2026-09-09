using AutoMapper;
using FluentAssertions;
using NSubstitute;
using SPOV.Application.Common.Interfaces;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;
using Xunit;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class PaymentServiceTests
{
    private readonly IPaymentRepository _paymentRepository = Substitute.For<IPaymentRepository>();
    private readonly IPartnerRepository _partnerRepository = Substitute.For<IPartnerRepository>();
    private readonly IFileStorage _fileStorage = Substitute.For<IFileStorage>();
    private readonly IMapper _mapper;
    private readonly PaymentService _sut;

    public PaymentServiceTests()
    {
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new PaymentService(_paymentRepository, _partnerRepository, _fileStorage, _mapper);
    }

    [Fact]
    public async Task UploadProofAsync_Should_SubmitLatestOpenPayment()
    {
        var payment = new Payment { Id = 7, PartnerId = 3, Amount = 80m, Status = "Pending" };
        var partner = new Partner { Id = 3, MembershipStatus = MembershipStatus.Pending };
        _partnerRepository.GetByIdAsync(3).Returns(partner);
        _paymentRepository.GetLatestOpenByPartnerIdAsync(3).Returns(payment);
        _fileStorage.SaveAsync(Arg.Any<Stream>(), "comprovativo.pdf", "application/pdf", Arg.Any<CancellationToken>())
            .Returns(new StoredFile("payment-proofs/file-7.pdf", "application/pdf", 12));

        await using var stream = new MemoryStream(System.Text.Encoding.ASCII.GetBytes("%PDF-1.7 test"));
        var result = await _sut.UploadProofAsync(3, stream, "comprovativo.pdf", "application/pdf", 12, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Status.Should().Be("Submitted");
        payment.Status.Should().Be("Submitted");
        payment.ProofStorageKey.Should().Be("payment-proofs/file-7.pdf");
        await _paymentRepository.Received(1).UpdateAsync(payment);
    }

    [Fact]
    public async Task UploadProofAsync_Should_RejectUnsupportedFiles()
    {
        var result = await _sut.UploadProofAsync(
            3,
            new MemoryStream([0x00]),
            "proof.exe",
            "application/octet-stream",
            1,
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Description.Should().Contain("PDF, JPEG ou PNG");
        await _fileStorage.DidNotReceiveWithAnyArgs().SaveAsync(default!, default!, default!, default);
    }

    [Fact]
    public async Task UploadProofAsync_Should_NotReplaceSubmittedProof()
    {
        var partner = new Partner { Id = 3, MembershipStatus = MembershipStatus.Pending };
        _partnerRepository.GetByIdAsync(3).Returns(partner);
        _paymentRepository.GetLatestOpenByPartnerIdAsync(3).Returns((Payment?)null);

        var result = await _sut.UploadProofAsync(
            3,
            new MemoryStream(System.Text.Encoding.ASCII.GetBytes("%PDF-1.7 test")),
            "proof.pdf",
            "application/pdf",
            13,
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Description.Should().Contain("pagamento pendente");
        await _fileStorage.DidNotReceiveWithAnyArgs().SaveAsync(default!, default!, default!, default);
    }

    [Fact]
    public async Task ReviewAsync_Should_VerifyPaymentAndActivatePartner()
    {
        var payment = new Payment { Id = 7, PartnerId = 3, Status = "Submitted" };
        var partner = new Partner { Id = 3, MembershipStatus = MembershipStatus.Pending };
        _paymentRepository.GetByIdAsync(7).Returns(payment);
        _partnerRepository.GetByIdAsync(3).Returns(partner);

        var result = await _sut.ReviewAsync(3, 7, true, "admin-user", null);

        result.IsSuccess.Should().BeTrue();
        payment.Status.Should().Be("Verified");
        payment.ReviewedByUserId.Should().Be("admin-user");
        payment.ReviewedAt.Should().NotBeNull();
        partner.MembershipStatus.Should().Be(MembershipStatus.Active);
        await _paymentRepository.Received(1).ReviewAsync(payment, partner, true);
        await _partnerRepository.DidNotReceive().UpdateAsync(Arg.Any<Partner>());
    }

    [Fact]
    public async Task ReviewAsync_Should_RejectPaymentWithoutActivatingPartner()
    {
        var payment = new Payment { Id = 7, PartnerId = 3, Status = "Submitted" };
        var partner = new Partner { Id = 3, MembershipStatus = MembershipStatus.Pending };
        _paymentRepository.GetByIdAsync(7).Returns(payment);
        _partnerRepository.GetByIdAsync(3).Returns(partner);

        var result = await _sut.ReviewAsync(3, 7, false, "admin-user", "Comprovativo ilegível.");

        result.IsSuccess.Should().BeTrue();
        payment.Status.Should().Be("Rejected");
        payment.ReviewNote.Should().Be("Comprovativo ilegível.");
        partner.MembershipStatus.Should().Be(MembershipStatus.Pending);
        await _paymentRepository.Received(1).ReviewAsync(payment, partner, false);
        await _partnerRepository.DidNotReceive().UpdateAsync(Arg.Any<Partner>());
    }
}
