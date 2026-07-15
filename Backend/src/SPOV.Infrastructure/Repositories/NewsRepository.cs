using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class NewsRepository : INewsRepository
{
    private readonly ApplicationDbContext _db;

    public NewsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<NewsPost>> GetAllAsync()
    {
        return await _db.NewsPosts.OrderByDescending(n => n.PublishedAt).ToListAsync();
    }

    public async Task<NewsPost?> GetByIdAsync(int id)
    {
        return await _db.NewsPosts.FindAsync(id);
    }

    public async Task<NewsPost> AddAsync(NewsPost newsPost)
    {
        _db.NewsPosts.Add(newsPost);
        await _db.SaveChangesAsync();
        return newsPost;
    }

    public async Task UpdateAsync(NewsPost newsPost)
    {
        _db.NewsPosts.Update(newsPost);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(NewsPost newsPost)
    {
        _db.NewsPosts.Remove(newsPost);
        await _db.SaveChangesAsync();
    }
}
