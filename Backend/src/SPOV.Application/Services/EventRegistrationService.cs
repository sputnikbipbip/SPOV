using AutoMapper;
using SPOV.Application.DTOs.EventRegistrations;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class EventRegistrationService : IEventRegistrationService
{
    private readonly IEventRegistrationRepository _registrationRepository;
    private readonly IMapper _mapper;

    public EventRegistrationService(IEventRegistrationRepository registrationRepository, IMapper mapper)
    {
        _registrationRepository = registrationRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<EventRegistrationDto>>> GetByEventIdAsync(int eventId)
    {
        var registrations = await _registrationRepository.GetByEventIdAsync(eventId);
        return Result<List<EventRegistrationDto>>.Success(_mapper.Map<List<EventRegistrationDto>>(registrations));
    }

    public async Task<Result<List<EventRegistrationDto>>> GetByPartnerIdAsync(int partnerId)
    {
        var registrations = await _registrationRepository.GetByPartnerIdAsync(partnerId);
        return Result<List<EventRegistrationDto>>.Success(_mapper.Map<List<EventRegistrationDto>>(registrations));
    }

    public async Task<Result<EventRegistrationDto>> RegisterAsync(int eventId, int partnerId)
    {
        var exists = await _registrationRepository.ExistsAsync(eventId, partnerId);
        if (exists)
            return Result<EventRegistrationDto>.Failure(Error.Conflict("Partner is already registered for this event."));

        var registration = new EventRegistration
        {
            EventId = eventId,
            PartnerId = partnerId,
            RegisteredAt = DateTime.UtcNow
        };

        var created = await _registrationRepository.AddAsync(registration);
        return Result<EventRegistrationDto>.Success(_mapper.Map<EventRegistrationDto>(created));
    }
}
