using AutoMapper;
using SPOV.Application.Common;
using SPOV.Application.DTOs.Events;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepository;
    private readonly IMapper _mapper;

    public EventService(IEventRepository eventRepository, IMapper mapper)
    {
        _eventRepository = eventRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResponse<EventDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var paged = await _eventRepository.GetAllAsync(queryFilter, ct);
        var items = _mapper.Map<List<EventDto>>(paged.Items);

        return Result<PagedResponse<EventDto>>.Success(
            PagedResponseBuilder.From(new PagedResult<EventDto>(items, paged.TotalRecords, paged.PageNumber, paged.PageSize)));
    }

    public async Task<Result<EventDto?>> GetByIdAsync(int id)
    {
        var @event = await _eventRepository.GetByIdAsync(id);
        if (@event is null)
            return Result<EventDto?>.Failure(Error.NotFound($"Event with id {id} not found."));
        return Result<EventDto?>.Success(_mapper.Map<EventDto>(@event));
    }

    public async Task<Result<EventDto>> CreateAsync(CreateEventRequest request)
    {
        var @event = new Event
        {
            Title = request.Title,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            CeCredits = request.CeCredits,
            IsMembersOnly = request.IsMembersOnly
        };

        var created = await _eventRepository.AddAsync(@event);
        return Result<EventDto>.Success(_mapper.Map<EventDto>(created));
    }

    public async Task<Result<EventDto>> UpdateAsync(int id, UpdateEventRequest request)
    {
        var @event = await _eventRepository.GetByIdAsync(id);
        if (@event is null)
            return Result<EventDto>.Failure(Error.NotFound($"Event with id {id} not found."));

        @event.Title = request.Title;
        @event.Description = request.Description;
        @event.StartDate = request.StartDate;
        @event.EndDate = request.EndDate;
        @event.CeCredits = request.CeCredits;
        @event.IsMembersOnly = request.IsMembersOnly;

        var updated = await _eventRepository.UpdateAsync(@event);
        return Result<EventDto>.Success(_mapper.Map<EventDto>(updated));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var @event = await _eventRepository.GetByIdAsync(id);
        if (@event is null)
            return Result.Failure(Error.NotFound($"Event with id {id} not found."));

        await _eventRepository.DeleteAsync(@event);
        return Result.Success();
    }
}
