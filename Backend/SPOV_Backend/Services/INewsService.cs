using SPOV_Backend.Models;

namespace SPOV_Backend.Services;

public interface INewsService
{
    Task<List<NewsPost>> GetNewsAsync();
    Task<NewsPost> CreateNewsAsync(NewsPost newsPost);
}