using SPOV.Domain.Entities;
using SPOV.Domain.Specifications;

namespace SPOV.Domain.Interfaces;

public interface IArticleRepository
{
    Task<PagedResult<Article>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Article?> GetByIdAsync(int id);
    Task<Article> AddAsync(Article article);
}
