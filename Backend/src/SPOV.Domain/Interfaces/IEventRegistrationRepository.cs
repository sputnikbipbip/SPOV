using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IEventRegistrationRepository
{
    Task<List<EventRegistration>> GetByEventIdAsync(int eventId);
    Task<List<EventRegistration>> GetByPartnerIdAsync(int partnerId);
    Task<EventRegistration> AddAsync(EventRegistration registration);
    Task<bool> ExistsAsync(int eventId, int partnerId);
}
