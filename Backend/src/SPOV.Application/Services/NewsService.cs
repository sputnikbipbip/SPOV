using AutoMapper;
using SPOV.Application.Common;
using SPOV.Application.DTOs.News;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public class NewsService : INewsService
{
    private readonly INewsRepository _newsRepository;
    private readonly IMapper _mapper;

    public NewsService(INewsRepository newsRepository, IMapper mapper)
    {
        _newsRepository = newsRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResponse<NewsPostDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var paged = await _newsRepository.GetAllAsync(queryFilter, ct);
        var items = _mapper.Map<List<NewsPostDto>>(paged.Items);

        return Result<PagedResponse<NewsPostDto>>.Success(
            PagedResponseBuilder.From(new PagedResult<NewsPostDto>(items, paged.TotalRecords, paged.PageNumber, paged.PageSize)));
    }

    public async Task<Result<NewsPostDto?>> GetByIdAsync(int id)
    {
        var newsPost = await _newsRepository.GetByIdAsync(id);
        if (newsPost is null)
            return Result<NewsPostDto?>.Failure(Error.NotFound($"News post with id {id} not found."));
        return Result<NewsPostDto?>.Success(_mapper.Map<NewsPostDto>(newsPost));
    }

    public async Task<Result<NewsPostDto>> CreateAsync(CreateNewsRequest request, string? authorId)
    {
        var newsPost = new NewsPost
        {
            Title = request.Title,
            Body = request.Body,
            IsMembersOnly = request.IsMembersOnly,
            PublishedAt = DateTime.UtcNow,
            AuthorId = authorId
        };

        var created = await _newsRepository.AddAsync(newsPost);
        return Result<NewsPostDto>.Success(_mapper.Map<NewsPostDto>(created));
    }

    public async Task<Result<NewsPostDto>> UpdateAsync(int id, CreateNewsRequest request)
    {
        var existing = await _newsRepository.GetByIdAsync(id);
        if (existing is null)
            return Result<NewsPostDto>.Failure(Error.NotFound($"News post with id {id} not found."));

        existing.Title = request.Title;
        existing.Body = request.Body;
        existing.IsMembersOnly = request.IsMembersOnly;
        await _newsRepository.UpdateAsync(existing);

        return Result<NewsPostDto>.Success(_mapper.Map<NewsPostDto>(existing));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var existing = await _newsRepository.GetByIdAsync(id);
        if (existing is null)
            return Result.Failure(Error.NotFound($"News post with id {id} not found."));

        await _newsRepository.DeleteAsync(existing);
        return Result.Success();
    }
}
