using AutoMapper;
using SPOV.Application.DTOs.Events;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

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

    public async Task<Result<List<EventDto>>> GetAllAsync()
    {
        var events = await _eventRepository.GetAllAsync();
        return Result<List<EventDto>>.Success(_mapper.Map<List<EventDto>>(events));
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
}
