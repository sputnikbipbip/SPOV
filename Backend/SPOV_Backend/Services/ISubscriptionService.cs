using SPOV_Backend.Models;

namespace SPOV_Backend.Services;

public interface ISubscriptionService
{
    Task<Subscription?> GetMySubscriptionAsync(string? userId);
    Task<List<Subscription>> GetAllSubscriptionsAsync();
    Task<Subscription?> UpdateSubscriptionDeadlineAsync(int id, DateTime newEndDate);
}