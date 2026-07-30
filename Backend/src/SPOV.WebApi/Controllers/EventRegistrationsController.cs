using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.Services;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/events/{eventId}/registrations")]
public class EventRegistrationsController : ControllerBase
{
    private readonly IEventRegistrationService _registrationService;
    private readonly IPartnerService _partnerService;

    public EventRegistrationsController(IEventRegistrationService registrationService, IPartnerService partnerService)
    {
        _registrationService = registrationService;
        _partnerService = partnerService;
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetByEvent(int eventId)
    {
        var result = await _registrationService.GetByEventIdAsync(eventId);
        return result.ToActionResult();
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Register(int eventId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var partnerResult = await _partnerService.GetByUserIdAsync(userId);
        if (!partnerResult.IsSuccess || partnerResult.Data is null)
            return Unauthorized(new { error = "Perfil de sócio não encontrado." });

        var result = await _registrationService.RegisterAsync(eventId, partnerResult.Data.Id);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/events/{eventId}/registrations/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }

    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> Cancel(int eventId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var partnerResult = await _partnerService.GetByUserIdAsync(userId);
        if (!partnerResult.IsSuccess || partnerResult.Data is null)
            return Unauthorized(new { error = "Perfil de sócio não encontrado." });

        var result = await _registrationService.CancelRegistrationAsync(eventId, partnerResult.Data.Id);
        return result.ToActionResult();
    }
}
