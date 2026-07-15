using Xunit;
using AutoMapper;
using NSubstitute;
using SPOV.Application.DTOs.Subscriptions;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using FluentAssertions;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class SubscriptionServiceTests
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IMapper _mapper;
    private readonly SubscriptionService _sut;

    public SubscriptionServiceTests()
    {
        _subscriptionRepository = Substitute.For<ISubscriptionRepository>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new SubscriptionService(_subscriptionRepository, _mapper);
    }

    [Fact]
    public async Task GetMySubscriptionAsync_Should_ReturnSubscription_WhenFound()
    {
        var subscription = new Subscription
        {
            Id = 1,
            UserId = "user-1",
            StartDate = DateTime.UtcNow.AddDays(-10),
            EndDate = DateTime.UtcNow.AddDays(10)
        };
        _subscriptionRepository.GetByUserIdAsync("user-1").Returns(subscription);

        var result = await _sut.GetMySubscriptionAsync("user-1");

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetMySubscriptionAsync_Should_ReturnNull_WhenNotFound()
    {
        _subscriptionRepository.GetByUserIdAsync("unknown").Returns((Subscription?)null);

        var result = await _sut.GetMySubscriptionAsync("unknown");

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeNull();
    }

    [Fact]
    public async Task GetAllSubscriptionsAsync_Should_ReturnAll()
    {
        var subscriptions = new List<Subscription>
        {
            new() { Id = 1, UserId = "u1", StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(10) },
            new() { Id = 2, UserId = "u2", StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(20) }
        };
        _subscriptionRepository.GetAllWithUsersAsync().Returns(subscriptions);

        var result = await _sut.GetAllSubscriptionsAsync();

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task UpdateSubscriptionDeadlineAsync_Should_UpdateAndReturn_WhenFound()
    {
        var subscription = new Subscription
        {
            Id = 1,
            UserId = "user-1",
            StartDate = DateTime.UtcNow.AddDays(-10),
            EndDate = DateTime.UtcNow.AddDays(10)
        };
        _subscriptionRepository.GetByIdAsync(1).Returns(subscription);
        var newDate = DateTime.UtcNow.AddDays(30);

        var result = await _sut.UpdateSubscriptionDeadlineAsync(1, newDate);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        subscription.EndDate.Should().Be(newDate);
        await _subscriptionRepository.Received(1).SaveChangesAsync();
    }

    [Fact]
    public async Task UpdateSubscriptionDeadlineAsync_Should_ReturnNotFound_WhenMissing()
    {
        _subscriptionRepository.GetByIdAsync(99).Returns((Subscription?)null);

        var result = await _sut.UpdateSubscriptionDeadlineAsync(99, DateTime.UtcNow);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(SPOV.Domain.Common.ErrorType.NotFound);
    }
}
