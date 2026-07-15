using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class EventRegistrationRepository : IEventRegistrationRepository
{
    private readonly ApplicationDbContext _db;

    public EventRegistrationRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<EventRegistration>> GetByEventIdAsync(int eventId)
    {
        return await _db.EventRegistrations.Where(r => r.EventId == eventId).ToListAsync();
    }

    public async Task<List<EventRegistration>> GetByPartnerIdAsync(int partnerId)
    {
        return await _db.EventRegistrations.Where(r => r.PartnerId == partnerId).ToListAsync();
    }

    public async Task<EventRegistration> AddAsync(EventRegistration registration)
    {
        _db.EventRegistrations.Add(registration);
        await _db.SaveChangesAsync();
        return registration;
    }

    public async Task<bool> ExistsAsync(int eventId, int partnerId)
    {
        return await _db.EventRegistrations.AnyAsync(r => r.EventId == eventId && r.PartnerId == partnerId);
    }
}
