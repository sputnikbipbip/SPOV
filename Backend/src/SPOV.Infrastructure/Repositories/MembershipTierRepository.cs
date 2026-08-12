using Microsoft.EntityFrameworkCore;
using SPOV.Application.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class MembershipTierRepository : IMembershipTierRepository
{
    private readonly ApplicationDbContext _db;

    public MembershipTierRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<MembershipTier>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var pageNumber = Math.Max(1, queryFilter.PageNumber);
        var pageSize = Math.Clamp(queryFilter.PageSize, 1, 50);

        var query = _db.MembershipTiers
            .AsNoTracking()
            .ApplySearch(queryFilter.Search)
            .ApplySort(queryFilter.SortBy);

        if (string.IsNullOrWhiteSpace(queryFilter.SortBy))
            query = query.OrderBy(t => t.Name);

        var totalRecords = await query.CountAsync(ct);
        var items = await query
            .ApplyPagination(pageNumber, pageSize)
            .ToListAsync(ct);

        return new PagedResult<MembershipTier>(items, totalRecords, pageNumber, pageSize);
    }

    public async Task<MembershipTier?> GetByIdAsync(int id)
    {
        return await _db.MembershipTiers.FindAsync(id);
    }

    public async Task<MembershipTier> AddAsync(MembershipTier tier)
    {
        _db.MembershipTiers.Add(tier);
        await _db.SaveChangesAsync();
        return tier;
    }
}
