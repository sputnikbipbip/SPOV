using SPOV_Backend.Models;

namespace SPOV_Backend.Repositories;

public interface INewsRepository
{
    Task<List<NewsPost>> GetAllAsync();
    Task<NewsPost> AddAsync(NewsPost newsPost);
}