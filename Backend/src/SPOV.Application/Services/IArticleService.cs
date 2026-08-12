using SPOV.Application.Common;
using SPOV.Application.DTOs.Articles;
using SPOV.Domain.Common;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public interface IArticleService
{
    Task<Result<PagedResponse<ArticleDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Result<ArticleDto?>> GetByIdAsync(int id);
    Task<Result<ArticleDto>> CreateAsync(CreateArticleRequest request);
}
