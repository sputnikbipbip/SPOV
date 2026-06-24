using SPOV_Backend.Models;
using SPOV_Backend.Repositories;

namespace SPOV_Backend.Services;

public class NewsService : INewsService
{
    private readonly INewsRepository newsRepository;

    public NewsService(INewsRepository newsRepository)
    {
        this.newsRepository = newsRepository;
    }

    public async Task<List<NewsPost>> GetNewsAsync()
    {
        return await newsRepository.GetAllAsync();
    }

    public async Task<NewsPost> CreateNewsAsync(NewsPost newsPost)
    {
        return await newsRepository.AddAsync(newsPost);
    }
}