using Xunit;
using AutoMapper;
using NSubstitute;
using SPOV.Application.DTOs.News;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using FluentAssertions;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class NewsServiceTests
{
    private readonly INewsRepository _newsRepository;
    private readonly IMapper _mapper;
    private readonly NewsService _sut;

    public NewsServiceTests()
    {
        _newsRepository = Substitute.For<INewsRepository>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new NewsService(_newsRepository, _mapper);
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllNews()
    {
        var news = new List<NewsPost>
        {
            new() { Id = 1, Title = "First", Body = "Body 1", PublishedAt = DateTime.UtcNow },
            new() { Id = 2, Title = "Second", Body = "Body 2", PublishedAt = DateTime.UtcNow }
        };
        _newsRepository.GetAllAsync().Returns(news);

        var result = await _sut.GetAllAsync();

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data![0].Title.Should().Be("First");
    }

    [Fact]
    public async Task CreateAsync_Should_AddAndReturnNews()
    {
        var request = new CreateNewsRequest { Title = "New Title", Body = "New Body", IsMembersOnly = true };
        var createdNews = new NewsPost
        {
            Id = 10,
            Title = "New Title",
            Body = "New Body",
            PublishedAt = DateTime.UtcNow,
            IsMembersOnly = true,
            AuthorId = "author-1"
        };
        _newsRepository.AddAsync(Arg.Any<NewsPost>()).Returns(createdNews);

        var result = await _sut.CreateAsync(request, "author-1");

        result.IsSuccess.Should().BeTrue();
        result.Data!.Title.Should().Be("New Title");
        result.Data.Body.Should().Be("New Body");
        result.Data.IsMembersOnly.Should().BeTrue();

        await _newsRepository.Received(1).AddAsync(Arg.Is<NewsPost>(n =>
            n.Title == "New Title" && n.Body == "New Body" && n.AuthorId == "author-1"));
    }

    [Fact]
    public async Task GetByIdAsync_Should_ReturnNotFound_WhenMissing()
    {
        _newsRepository.GetByIdAsync(99).Returns((NewsPost?)null);

        var result = await _sut.GetByIdAsync(99);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(SPOV.Domain.Common.ErrorType.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_Should_ReturnNotFound_WhenMissing()
    {
        _newsRepository.GetByIdAsync(99).Returns((NewsPost?)null);

        var result = await _sut.DeleteAsync(99);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(SPOV.Domain.Common.ErrorType.NotFound);
    }
}
