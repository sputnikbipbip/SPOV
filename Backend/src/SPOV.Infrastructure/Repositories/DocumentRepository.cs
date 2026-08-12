using Microsoft.EntityFrameworkCore;
using SPOV.Application.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly ApplicationDbContext _db;

    public DocumentRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<SharedDocument>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var pageNumber = Math.Max(1, queryFilter.PageNumber);
        var pageSize = Math.Clamp(queryFilter.PageSize, 1, 50);

        var query = _db.SharedDocuments
            .AsNoTracking()
            .ApplySearch(queryFilter.Search)
            .ApplySort(queryFilter.SortBy);

        if (string.IsNullOrWhiteSpace(queryFilter.SortBy))
            query = query.OrderByDescending(d => d.UploadDate);

        var totalRecords = await query.CountAsync(ct);
        var items = await query
            .ApplyPagination(pageNumber, pageSize)
            .ToListAsync(ct);

        return new PagedResult<SharedDocument>(items, totalRecords, pageNumber, pageSize);
    }

    public async Task<PagedResult<SharedDocument>> GetByOwnerIdAsync(string? ownerId, QueryFilter queryFilter, CancellationToken ct)
    {
        var pageNumber = Math.Max(1, queryFilter.PageNumber);
        var pageSize = Math.Clamp(queryFilter.PageSize, 1, 50);

        var query = _db.SharedDocuments
            .Where(d => d.OwnerId == ownerId)
            .AsNoTracking()
            .ApplySearch(queryFilter.Search)
            .ApplySort(queryFilter.SortBy);

        if (string.IsNullOrWhiteSpace(queryFilter.SortBy))
            query = query.OrderByDescending(d => d.UploadDate);

        var totalRecords = await query.CountAsync(ct);
        var items = await query
            .ApplyPagination(pageNumber, pageSize)
            .ToListAsync(ct);

        return new PagedResult<SharedDocument>(items, totalRecords, pageNumber, pageSize);
    }

    public async Task<SharedDocument> AddAsync(SharedDocument document)
    {
        _db.SharedDocuments.Add(document);
        await _db.SaveChangesAsync();
        return document;
    }
}
