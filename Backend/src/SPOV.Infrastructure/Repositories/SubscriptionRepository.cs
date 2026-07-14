using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly ApplicationDbContext _db;

    public SubscriptionRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Subscription?> GetByUserIdAsync(string? userId)
    {
        return await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<List<Subscription>> GetAllWithUsersAsync()
    {
        return await _db.Subscriptions.ToListAsync();
    }

    public async Task<Subscription?> GetByIdAsync(int id)
    {
        return await _db.Subscriptions.FindAsync(id);
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}
