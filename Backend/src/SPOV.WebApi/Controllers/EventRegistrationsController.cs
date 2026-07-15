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

    public EventRegistrationsController(IEventRegistrationService registrationService)
    {
        _registrationService = registrationService;
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
    public async Task<IActionResult> Register(int eventId, [FromBody] int partnerId)
    {
        var result = await _registrationService.RegisterAsync(eventId, partnerId);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/events/{eventId}/registrations/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }
}
