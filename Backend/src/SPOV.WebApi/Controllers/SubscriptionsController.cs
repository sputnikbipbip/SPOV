using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.Subscriptions;
using SPOV.Application.Services;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [Authorize]
    [HttpGet("subscriptions/me", Name = "GetMySubscription")]
    public async Task<IActionResult> GetMySubscription()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _subscriptionService.GetMySubscriptionAsync(userId);

        if (result.IsSuccess && result.Data is null)
            return NotFound(new { error = "No subscription found." });

        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/subscriptions", Name = "GetAllSubscriptions")]
    public async Task<IActionResult> GetAllSubscriptions()
    {
        var result = await _subscriptionService.GetAllSubscriptionsAsync();
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("admin/subscriptions/{id}", Name = "UpdateSubscriptionDeadline")]
    public async Task<IActionResult> UpdateSubscriptionDeadline(int id, UpdateSubscriptionRequest request)
    {
        var result = await _subscriptionService.UpdateSubscriptionDeadlineAsync(id, request.NewEndDate);
        return result.ToActionResult();
    }
}
