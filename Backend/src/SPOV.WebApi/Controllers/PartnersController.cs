using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.Partners;
using SPOV.Application.Services;
using SPOV.Domain.Specifications;
using SPOV.WebApi.Extensions;
using SPOV.Application.DTOs.EventRegistrations;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/partners")]
public class PartnersController : ControllerBase
{
    private readonly IPartnerService _partnerService;
    private readonly IEventRegistrationService _registrationService;

    public PartnersController(IPartnerService partnerService, IEventRegistrationService registrationService)
    {
        _partnerService = partnerService;
        _registrationService = registrationService;
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryFilter filter)
    {
        var result = await _partnerService.GetAllAsync(filter, HttpContext.RequestAborted);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id}/profile")]
    public async Task<IActionResult> GetAdminProfile(int id)
    {
        var result = await _partnerService.GetAdminProfileAsync(id);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _partnerService.GetByIdAsync(id);
        return result.ToActionResult();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _partnerService.GetByUserIdAsync(userId);

        if (result.IsSuccess && result.Data is null)
            return NotFound(new { error = "Partner profile not found." });

        return result.ToActionResult();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterPartnerRequest request)
    {
        var result = await _partnerService.RegisterAsync(request);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/partners/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var result = await _partnerService.ApproveAsync(id);
        return result.ToActionResult();
    }

    [Authorize]
    [HttpGet("my-profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _partnerService.GetProfileByUserIdAsync(userId);
        return result.ToActionResult();
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(UpdatePartnerProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _partnerService.UpdateProfileAsync(userId, request);
        return result.ToActionResult();
    }

    [Authorize]
    [HttpGet("me/registrations")]
    public async Task<IActionResult> GetMyRegistrations()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var partnerResult = await _partnerService.GetByUserIdAsync(userId);
        if (!partnerResult.IsSuccess || partnerResult.Data is null)
            return Unauthorized(new { error = "Perfil de sócio não encontrado." });

        var result = await _registrationService.GetPartnerRegistrationsAsync(partnerResult.Data.Id);
        return result.ToActionResult();
    }

}
