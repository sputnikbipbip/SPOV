using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV_Backend.Models;
using SPOV_Backend.Services;

namespace SPOV_Backend.Controllers;

[ApiController]
[Route("api")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        this.subscriptionService = subscriptionService;
    }

    [Authorize]
    [HttpGet("subscriptions/me", Name = "GetMySubscription")]
    public async Task<ActionResult<Subscription>> GetMySubscription()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var subscription = await subscriptionService.GetMySubscriptionAsync(userId);

        return subscription != null ? Ok(subscription) : NotFound("No subscription found.");
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/subscriptions", Name = "GetAllSubscriptions")]
    public async Task<ActionResult<List<Subscription>>> GetAllSubscriptions()
    {
        return await subscriptionService.GetAllSubscriptionsAsync();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("admin/subscriptions/{id}", Name = "UpdateSubscriptionDeadline")]
    public async Task<ActionResult<Subscription>> UpdateSubscriptionDeadline(int id, DateTime newEndDate)
    {
        var subscription = await subscriptionService.UpdateSubscriptionDeadlineAsync(id, newEndDate);

        return subscription != null ? Ok(subscription) : NotFound();
    }
}