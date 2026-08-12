using AutoMapper;
using SPOV.Application.Common;
using SPOV.Application.DTOs.Articles;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public class ArticleService : IArticleService
{
    private readonly IArticleRepository _articleRepository;
    private readonly IMapper _mapper;

    public ArticleService(IArticleRepository articleRepository, IMapper mapper)
    {
        _articleRepository = articleRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResponse<ArticleDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var paged = await _articleRepository.GetAllAsync(queryFilter, ct);
        var items = _mapper.Map<List<ArticleDto>>(paged.Items);

        return Result<PagedResponse<ArticleDto>>.Success(
            PagedResponseBuilder.From(new PagedResult<ArticleDto>(items, paged.TotalRecords, paged.PageNumber, paged.PageSize)));
    }

    public async Task<Result<ArticleDto?>> GetByIdAsync(int id)
    {
        var article = await _articleRepository.GetByIdAsync(id);
        if (article is null)
            return Result<ArticleDto?>.Failure(Error.NotFound($"Article with id {id} not found."));
        return Result<ArticleDto?>.Success(_mapper.Map<ArticleDto>(article));
    }

    public async Task<Result<ArticleDto>> CreateAsync(CreateArticleRequest request)
    {
        var article = new Article
        {
            Title = request.Title,
            Body = request.Body,
            FileUrl = request.FileUrl,
            RequiredTierId = request.RequiredTierId,
            PublishedAt = DateTime.UtcNow
        };

        var created = await _articleRepository.AddAsync(article);
        return Result<ArticleDto>.Success(_mapper.Map<ArticleDto>(created));
    }
}
