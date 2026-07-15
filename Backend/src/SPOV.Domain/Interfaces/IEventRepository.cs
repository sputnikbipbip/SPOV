using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IEventRepository
{
    Task<List<Event>> GetAllAsync();
    Task<Event?> GetByIdAsync(int id);
    Task<Event> AddAsync(Event @event);
}
