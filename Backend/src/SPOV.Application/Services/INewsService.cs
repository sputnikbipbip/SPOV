using SPOV.Application.Common;
using SPOV.Application.DTOs.News;
using SPOV.Domain.Common;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public interface INewsService
{
    Task<Result<PagedResponse<NewsPostDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Result<NewsPostDto?>> GetByIdAsync(int id);
    Task<Result<NewsPostDto>> CreateAsync(CreateNewsRequest request, string? authorId);
    Task<Result<NewsPostDto>> UpdateAsync(int id, CreateNewsRequest request);
    Task<Result> DeleteAsync(int id);
}
