using AutoMapper;
using SPOV.Application.DTOs.EventRegistrations;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class EventRegistrationService : IEventRegistrationService
{
    private readonly IEventRegistrationRepository _registrationRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IPartnerRepository _partnerRepository;
    private readonly IMapper _mapper;

    public EventRegistrationService(
        IEventRegistrationRepository registrationRepository,
        IEventRepository eventRepository,
        IPartnerRepository partnerRepository,
        IMapper mapper)
    {
        _registrationRepository = registrationRepository;
        _eventRepository = eventRepository;
        _partnerRepository = partnerRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<EventRegistrationDto>>> GetByEventIdAsync(int eventId)
    {
        var registrations = await _registrationRepository.GetByEventIdAsync(eventId);
        var dtos = _mapper.Map<List<EventRegistrationDto>>(registrations);

        foreach (var dto in dtos)
        {
            var partner = await _partnerRepository.GetByIdAsync(dto.PartnerId);
            if (partner is not null)
            {
                dto.PartnerFullName = partner.FullName;
                dto.PartnerEmail = partner.Email;
            }
        }

        return Result<List<EventRegistrationDto>>.Success(dtos);
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

    public async Task<Result> CancelRegistrationAsync(int eventId, int partnerId)
    {
        var exists = await _registrationRepository.ExistsAsync(eventId, partnerId);
        if (!exists)
            return Result.Failure(Error.NotFound("Registration not found."));

        var registrations = await _registrationRepository.GetByPartnerIdAsync(partnerId);
        var registration = registrations.FirstOrDefault(r => r.EventId == eventId);
        if (registration is null)
            return Result.Failure(Error.NotFound("Registration not found."));

        await _registrationRepository.DeleteAsync(registration);
        return Result.Success();
    }

    public async Task<Result<List<PartnerRegistrationDto>>> GetPartnerRegistrationsAsync(int partnerId)
    {
        var registrations = await _registrationRepository.GetByPartnerIdAsync(partnerId);
        var dtos = _mapper.Map<List<PartnerRegistrationDto>>(registrations);

        foreach (var dto in dtos)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(dto.EventId);
            if (eventEntity is not null)
            {
                dto.EventTitle = eventEntity.Title;
                dto.EventStartDate = eventEntity.StartDate;
                dto.EventEndDate = eventEntity.EndDate;
            }
        }

        return Result<List<PartnerRegistrationDto>>.Success(dtos);
    }
}
