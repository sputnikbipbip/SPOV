using Xunit;
using AutoMapper;
using NSubstitute;
using FluentAssertions;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class DocumentServiceTests
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IMapper _mapper;
    private readonly DocumentService _sut;

    public DocumentServiceTests()
    {
        _documentRepository = Substitute.For<IDocumentRepository>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new DocumentService(_documentRepository, _mapper);
    }

    [Fact]
    public async Task GetDocumentsAsync_AsAdmin_Should_ReturnAllDocumentsPaged()
    {
        var documents = new List<SharedDocument>
        {
            new() { Id = 1, FileName = "a.pdf", FilePath = "/uploads/a.pdf", UploadDate = new DateTime(2026, 1, 1) },
            new() { Id = 2, FileName = "b.pdf", FilePath = "/uploads/b.pdf", UploadDate = new DateTime(2026, 2, 1) }
        };
        _documentRepository.GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<SharedDocument>(documents, 2, 1, 10));

        var result = await _sut.GetDocumentsAsync("user-1", true, new QueryFilter(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Data.Should().HaveCount(2);
        result.Data.Data[0].FileName.Should().Be("a.pdf");

        await _documentRepository.Received(1).GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>());
        await _documentRepository.DidNotReceive().GetByOwnerIdAsync(Arg.Any<string?>(), Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetDocumentsAsync_AsPartner_Should_ReturnOwnDocumentsPaged()
    {
        var documents = new List<SharedDocument>
        {
            new() { Id = 3, FileName = "mine.pdf", FilePath = "/uploads/mine.pdf", UploadDate = new DateTime(2026, 1, 1), OwnerId = "user-7" }
        };
        _documentRepository.GetByOwnerIdAsync("user-7", Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<SharedDocument>(documents, 1, 1, 10));

        var result = await _sut.GetDocumentsAsync("user-7", false, new QueryFilter(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Data.Should().HaveCount(1);
        result.Data.Data[0].FileName.Should().Be("mine.pdf");

        await _documentRepository.DidNotReceive().GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>());
        await _documentRepository.Received(1).GetByOwnerIdAsync("user-7", Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>());
    }
}