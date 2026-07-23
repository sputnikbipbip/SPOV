using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.Partners;
using SPOV.Application.Services;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/partners")]
public class PartnersController : ControllerBase
{
    private readonly IPartnerService _partnerService;

    public PartnersController(IPartnerService partnerService)
    {
        _partnerService = partnerService;
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _partnerService.GetAllAsync();
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

    [Authorize]
    [HttpGet("my-profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _partnerService.GetProfileByUserIdAsync(userId);
        return result.ToActionResult();
    }

}
