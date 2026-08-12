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

public sealed class ArticleServiceTests
{
    private readonly IArticleRepository _articleRepository;
    private readonly IMapper _mapper;
    private readonly ArticleService _sut;

    public ArticleServiceTests()
    {
        _articleRepository = Substitute.For<IArticleRepository>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new ArticleService(_articleRepository, _mapper);
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnPagedArticlesWithMetadata()
    {
        var articles = new List<Article>
        {
            new() { Id = 1, Title = "First", Body = "Body 1", PublishedAt = new DateTime(2026, 1, 1) },
            new() { Id = 2, Title = "Second", Body = "Body 2", PublishedAt = new DateTime(2026, 2, 1) }
        };
        _articleRepository.GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Article>(articles, 2, 5, 10));

        var result = await _sut.GetAllAsync(new QueryFilter(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Data.Should().HaveCount(2);
        result.Data.Data[0].Title.Should().Be("First");
        result.Data.PageNumber.Should().Be(5);
        result.Data.TotalPages.Should().Be(1);
    }
}