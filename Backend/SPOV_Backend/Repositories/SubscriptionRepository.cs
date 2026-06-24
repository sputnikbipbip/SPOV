using Microsoft.EntityFrameworkCore;
using SPOV_Backend.Data;
using SPOV_Backend.Models;

namespace SPOV_Backend.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly ApplicationDbContext db;

    public SubscriptionRepository(ApplicationDbContext db)
    {
        this.db = db;
    }

    public async Task<Subscription?> GetByUserIdAsync(string? userId)
    {
        return await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<List<Subscription>> GetAllWithUsersAsync()
    {
        return await db.Subscriptions.Include(s => s.User).ToListAsync();
    }

    public async Task<Subscription?> GetByIdAsync(int id)
    {
        return await db.Subscriptions.FindAsync(id);
    }

    public async Task SaveChangesAsync()
    {
        await db.SaveChangesAsync();
    }
}