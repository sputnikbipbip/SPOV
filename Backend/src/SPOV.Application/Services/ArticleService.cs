using AutoMapper;
using SPOV.Application.DTOs.Articles;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

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

    public async Task<Result<List<ArticleDto>>> GetAllAsync()
    {
        var articles = await _articleRepository.GetAllAsync();
        return Result<List<ArticleDto>>.Success(_mapper.Map<List<ArticleDto>>(articles));
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
