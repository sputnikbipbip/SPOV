using SPOV_Backend.Models;
using SPOV_Backend.Repositories;

namespace SPOV_Backend.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ISubscriptionRepository subscriptionRepository;

    public SubscriptionService(ISubscriptionRepository subscriptionRepository)
    {
        this.subscriptionRepository = subscriptionRepository;
    }

    public async Task<Subscription?> GetMySubscriptionAsync(string? userId)
    {
        return await subscriptionRepository.GetByUserIdAsync(userId);
    }

    public async Task<List<Subscription>> GetAllSubscriptionsAsync()
    {
        return await subscriptionRepository.GetAllWithUsersAsync();
    }

    public async Task<Subscription?> UpdateSubscriptionDeadlineAsync(int id, DateTime newEndDate)
    {
        var subscription = await subscriptionRepository.GetByIdAsync(id);
        if (subscription == null) return null;

        subscription.EndDate = newEndDate;
        await subscriptionRepository.SaveChangesAsync();

        return subscription;
    }
}