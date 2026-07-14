using SPOV.Application.DTOs.News;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface INewsService
{
    Task<Result<List<NewsPostDto>>> GetNewsAsync();
    Task<Result<NewsPostDto>> CreateNewsAsync(CreateNewsRequest request, string? authorId);
}
