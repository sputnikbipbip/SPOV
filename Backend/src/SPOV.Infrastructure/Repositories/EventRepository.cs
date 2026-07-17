using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class EventRepository : IEventRepository
{
    private readonly ApplicationDbContext _db;

    public EventRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<Event>> GetAllAsync()
    {
        return await _db.Events.OrderBy(e => e.StartDate).ToListAsync();
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
