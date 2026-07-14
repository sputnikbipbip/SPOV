using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByUserIdAsync(string? userId);
    Task<List<Subscription>> GetAllWithUsersAsync();
    Task<Subscription?> GetByIdAsync(int id);
    Task SaveChangesAsync();
}
