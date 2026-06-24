using SPOV_Backend.Models;

namespace SPOV_Backend.Repositories;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByUserIdAsync(string? userId);
    Task<List<Subscription>> GetAllWithUsersAsync();
    Task<Subscription?> GetByIdAsync(int id);
    Task SaveChangesAsync();
}