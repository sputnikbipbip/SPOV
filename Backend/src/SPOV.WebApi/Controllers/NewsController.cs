using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.News;
using SPOV.Application.Services;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController : ControllerBase
{
    private readonly INewsService _newsService;

    public NewsController(INewsService newsService)
    {
        _newsService = newsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _newsService.GetAllAsync();
        return result.ToActionResult();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _newsService.GetByIdAsync(id);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateNewsRequest request)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _newsService.CreateAsync(request, authorId);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/news/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateNewsRequest request)
    {
        var result = await _newsService.UpdateAsync(id, request);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _newsService.DeleteAsync(id);
        return result.ToActionResult();
    }
}
