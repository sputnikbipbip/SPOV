using AutoMapper;
using SPOV.Application.DTOs.News;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

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

    public async Task<Result<List<NewsPostDto>>> GetNewsAsync()
    {
        var news = await _newsRepository.GetAllAsync();
        return Result<List<NewsPostDto>>.Success(_mapper.Map<List<NewsPostDto>>(news));
    }

    public async Task<Result<NewsPostDto>> CreateNewsAsync(CreateNewsRequest request, string? authorId)
    {
        var newsPost = new NewsPost
        {
            Title = request.Title,
            Content = request.Content,
            PublishedAt = DateTime.UtcNow,
            AuthorId = authorId
        };

        var created = await _newsRepository.AddAsync(newsPost);
        return Result<NewsPostDto>.Success(_mapper.Map<NewsPostDto>(created));
    }
}
