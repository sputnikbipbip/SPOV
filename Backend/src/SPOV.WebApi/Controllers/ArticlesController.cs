using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.Articles;
using SPOV.Application.Services;
using SPOV.Domain.Specifications;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/articles")]
public class ArticlesController : ControllerBase
{
    private readonly IArticleService _articleService;

    public ArticlesController(IArticleService articleService)
    {
        _articleService = articleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryFilter filter)
    {
        var result = await _articleService.GetAllAsync(filter, HttpContext.RequestAborted);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateArticleRequest request)
    {
        var result = await _articleService.CreateAsync(request);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/articles/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }
}
