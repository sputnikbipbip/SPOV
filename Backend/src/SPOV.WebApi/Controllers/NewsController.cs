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

    [HttpGet(Name = "GetNews")]
    public async Task<IActionResult> GetNews()
    {
        var result = await _newsService.GetNewsAsync();
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost(Name = "CreateNews")]
    public async Task<IActionResult> CreateNews(CreateNewsRequest request)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _newsService.CreateNewsAsync(request, authorId);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/news/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }
}
