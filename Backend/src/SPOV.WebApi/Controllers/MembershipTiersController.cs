using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.Services;
using SPOV.Domain.Specifications;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/membership-tiers")]
public class MembershipTiersController : ControllerBase
{
    private readonly IMembershipTierService _tierService;

    public MembershipTiersController(IMembershipTierService tierService)
    {
        _tierService = tierService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryFilter filter)
    {
        var result = await _tierService.GetAllAsync(filter, HttpContext.RequestAborted);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _tierService.GetByIdAsync(id);
        return result.ToActionResult();
    }
}
