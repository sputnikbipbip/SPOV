using Microsoft.EntityFrameworkCore;
using SPOV.Application.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class EventRepository : IEventRepository
{
    private readonly ApplicationDbContext _db;

    public EventRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<Event>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var pageNumber = Math.Max(1, queryFilter.PageNumber);
        var pageSize = Math.Clamp(queryFilter.PageSize, 1, 50);

        var query = _db.Events
            .AsNoTracking()
            .ApplySearch(queryFilter.Search)
            .ApplySort(queryFilter.SortBy);

        if (string.IsNullOrWhiteSpace(queryFilter.SortBy))
            query = query.OrderBy(e => e.StartDate);

        var totalRecords = await query.CountAsync(ct);
        var items = await query
            .ApplyPagination(pageNumber, pageSize)
            .ToListAsync(ct);

        return new PagedResult<Event>(items, totalRecords, pageNumber, pageSize);
    }

    public async Task<Event?> GetByIdAsync(int id)
    {
        return await _db.Events.FindAsync(id);
    }

    public async Task<Event> AddAsync(Event @event)
    {
        _db.Events.Add(@event);
        await _db.SaveChangesAsync();
        return @event;
    }

    public async Task<Event> UpdateAsync(Event @event)
    {
        _db.Events.Update(@event);
        await _db.SaveChangesAsync();
        return @event;
    }

    public async Task DeleteAsync(Event @event)
    {
        _db.Events.Remove(@event);
        await _db.SaveChangesAsync();
    }
}
