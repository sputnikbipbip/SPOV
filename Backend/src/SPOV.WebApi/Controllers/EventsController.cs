using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.Events;
using SPOV.Application.Services;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _eventService.GetAllAsync();
        return result.ToActionResult();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _eventService.GetByIdAsync(id);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateEventRequest request)
    {
        var result = await _eventService.CreateAsync(request);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/events/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateEventRequest request)
    {
        var result = await _eventService.UpdateAsync(id, request);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _eventService.DeleteAsync(id);
        return result.ToActionResult();
    }
}
