using SPOV.Application.DTOs.Subscriptions;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface ISubscriptionService
{
    Task<Result<SubscriptionDto?>> GetMySubscriptionAsync(string userId);
    Task<Result<List<SubscriptionDto>>> GetAllSubscriptionsAsync();
    Task<Result<SubscriptionDto?>> UpdateSubscriptionDeadlineAsync(int id, DateTime newEndDate);
}
