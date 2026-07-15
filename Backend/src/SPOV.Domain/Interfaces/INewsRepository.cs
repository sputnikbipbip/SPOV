using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface INewsRepository
{
    Task<List<NewsPost>> GetAllAsync();
    Task<NewsPost?> GetByIdAsync(int id);
    Task<NewsPost> AddAsync(NewsPost newsPost);
    Task UpdateAsync(NewsPost newsPost);
    Task DeleteAsync(NewsPost newsPost);
}
