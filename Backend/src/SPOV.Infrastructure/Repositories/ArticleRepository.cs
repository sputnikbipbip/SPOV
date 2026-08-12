using Microsoft.EntityFrameworkCore;
using SPOV.Application.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class ArticleRepository : IArticleRepository
{
    private readonly ApplicationDbContext _db;

    public ArticleRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<Article>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var pageNumber = Math.Max(1, queryFilter.PageNumber);
        var pageSize = Math.Clamp(queryFilter.PageSize, 1, 50);

        var query = _db.Articles
            .AsNoTracking()
            .ApplySearch(queryFilter.Search)
            .ApplySort(queryFilter.SortBy);

        if (string.IsNullOrWhiteSpace(queryFilter.SortBy))
            query = query.OrderByDescending(a => a.PublishedAt);

        var totalRecords = await query.CountAsync(ct);
        var items = await query
            .ApplyPagination(pageNumber, pageSize)
            .ToListAsync(ct);

        return new PagedResult<Article>(items, totalRecords, pageNumber, pageSize);
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
