using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class ArticleRepository : IArticleRepository
{
    private readonly ApplicationDbContext _db;

    public ArticleRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<Article>> GetAllAsync()
    {
        return await _db.Articles.OrderByDescending(a => a.PublishedAt).ToListAsync();
    }

    public async Task<Article?> GetByIdAsync(int id)
    {
        return await _db.Articles.FindAsync(id);
    }

    public async Task<Article> AddAsync(Article article)
    {
        _db.Articles.Add(article);
        await _db.SaveChangesAsync();
        return article;
    }
}
