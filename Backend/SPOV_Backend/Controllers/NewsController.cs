using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV_Backend.Models;
using SPOV_Backend.Services;

namespace SPOV_Backend.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController : ControllerBase
{
    private readonly INewsService newsService;

    public NewsController(INewsService newsService)
    {
        this.newsService = newsService;
    }

    [HttpGet(Name = "GetNews")]
    public async Task<ActionResult<List<NewsPost>>> GetNews()
    {
        return await newsService.GetNewsAsync();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost(Name = "CreateNews")]
    public async Task<ActionResult<NewsPost>> CreateNews(NewsPost news)
    {
        var createdNews = await newsService.CreateNewsAsync(news);
        return Created($"/api/news/{createdNews.Id}", createdNews);
    }
}