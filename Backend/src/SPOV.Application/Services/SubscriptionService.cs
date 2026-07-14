using AutoMapper;
using SPOV.Application.DTOs.Subscriptions;
using SPOV.Domain.Common;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IMapper _mapper;

    public SubscriptionService(ISubscriptionRepository subscriptionRepository, IMapper mapper)
    {
        _subscriptionRepository = subscriptionRepository;
        _mapper = mapper;
    }

    public async Task<Result<SubscriptionDto?>> GetMySubscriptionAsync(string userId)
    {
        var subscription = await _subscriptionRepository.GetByUserIdAsync(userId);
        if (subscription is null)
            return Result<SubscriptionDto?>.Success(null);

        return Result<SubscriptionDto?>.Success(_mapper.Map<SubscriptionDto>(subscription));
    }

    public async Task<Result<List<SubscriptionDto>>> GetAllSubscriptionsAsync()
    {
        var subscriptions = await _subscriptionRepository.GetAllWithUsersAsync();
        return Result<List<SubscriptionDto>>.Success(_mapper.Map<List<SubscriptionDto>>(subscriptions));
    }

    public async Task<Result<SubscriptionDto?>> UpdateSubscriptionDeadlineAsync(int id, DateTime newEndDate)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(id);
        if (subscription is null)
            return Result<SubscriptionDto?>.Failure(Error.NotFound($"Subscription with id {id} not found."));

        subscription.EndDate = newEndDate;
        await _subscriptionRepository.SaveChangesAsync();

        return Result<SubscriptionDto?>.Success(_mapper.Map<SubscriptionDto>(subscription));
    }
}
