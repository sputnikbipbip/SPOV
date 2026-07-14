using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface INewsRepository
{
    Task<List<NewsPost>> GetAllAsync();
    Task<NewsPost> AddAsync(NewsPost newsPost);
}
