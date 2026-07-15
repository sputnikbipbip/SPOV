using SPOV.Application.DTOs.News;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface INewsService
{
    Task<Result<List<NewsPostDto>>> GetAllAsync();
    Task<Result<NewsPostDto?>> GetByIdAsync(int id);
    Task<Result<NewsPostDto>> CreateAsync(CreateNewsRequest request, string? authorId);
    Task<Result<NewsPostDto>> UpdateAsync(int id, CreateNewsRequest request);
    Task<Result> DeleteAsync(int id);
}
