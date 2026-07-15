using SPOV.Application.DTOs.Articles;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IArticleService
{
    Task<Result<List<ArticleDto>>> GetAllAsync();
    Task<Result<ArticleDto?>> GetByIdAsync(int id);
    Task<Result<ArticleDto>> CreateAsync(CreateArticleRequest request);
}
