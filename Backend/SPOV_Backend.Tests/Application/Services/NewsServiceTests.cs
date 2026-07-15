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
    public async Task GetNewsAsync_Should_ReturnAllNews()
    {
        var news = new List<NewsPost>
        {
            new() { Id = 1, Title = "First", Content = "Content 1", PublishedAt = DateTime.UtcNow },
            new() { Id = 2, Title = "Second", Content = "Content 2", PublishedAt = DateTime.UtcNow }
        };
        _newsRepository.GetAllAsync().Returns(news);

        var result = await _sut.GetNewsAsync();

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data![0].Title.Should().Be("First");
        result.Data[1].Title.Should().Be("Second");
    }

    [Fact]
    public async Task CreateNewsAsync_Should_AddAndReturnNews()
    {
        var request = new CreateNewsRequest { Title = "New Title", Content = "New Content" };
        var createdNews = new NewsPost
        {
            Id = 10,
            Title = "New Title",
            Content = "New Content",
            PublishedAt = DateTime.UtcNow,
            AuthorId = "author-1"
        };
        _newsRepository.AddAsync(Arg.Any<NewsPost>()).Returns(createdNews);

        var result = await _sut.CreateNewsAsync(request, "author-1");

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be("New Title");
        result.Data.Content.Should().Be("New Content");
        result.Data.AuthorId.Should().Be("author-1");

        await _newsRepository.Received(1).AddAsync(Arg.Is<NewsPost>(n =>
            n.Title == "New Title" && n.Content == "New Content" && n.AuthorId == "author-1"));
    }
}
