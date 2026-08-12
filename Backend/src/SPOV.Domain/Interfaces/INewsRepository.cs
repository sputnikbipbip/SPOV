using SPOV.Domain.Entities;
using SPOV.Domain.Specifications;

namespace SPOV.Domain.Interfaces;

public interface INewsRepository
{
    Task<PagedResult<NewsPost>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<NewsPost?> GetByIdAsync(int id);
    Task<NewsPost> AddAsync(NewsPost newsPost);
    Task UpdateAsync(NewsPost newsPost);
    Task DeleteAsync(NewsPost newsPost);
}
