using SPOV.Application.DTOs.EventRegistrations;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IEventRegistrationService
{
    Task<Result<List<EventRegistrationDto>>> GetByEventIdAsync(int eventId);
    Task<Result<List<EventRegistrationDto>>> GetByPartnerIdAsync(int partnerId);
    Task<Result<EventRegistrationDto>> RegisterAsync(int eventId, int partnerId);
    Task<Result<List<PartnerRegistrationDto>>> GetPartnerRegistrationsAsync(int partnerId);
    Task<Result> CancelRegistrationAsync(int eventId, int partnerId);
}
