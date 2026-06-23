using Microsoft.EntityFrameworkCore;
using SPOV_Backend.Data;
using SPOV_Backend.Models;

namespace SPOV_Backend.Repositories;

public class NewsRepository : INewsRepository
{
    private readonly ApplicationDbContext db;

    public NewsRepository(ApplicationDbContext db)
    {
        this.db = db;
    }

    public async Task<List<NewsPost>> GetAllAsync()
    {
        return await db.NewsPosts.OrderByDescending(n => n.PublishedAt).ToListAsync();
    }

    public async Task<NewsPost> AddAsync(NewsPost newsPost)
    {
        db.NewsPosts.Add(newsPost);
        await db.SaveChangesAsync();
        return newsPost;
    }
}