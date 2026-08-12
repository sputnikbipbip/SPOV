using SPOV.Domain.Entities;
using SPOV.Domain.Specifications;

namespace SPOV.Domain.Interfaces;

public interface IEventRepository
{
    Task<PagedResult<Event>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Event?> GetByIdAsync(int id);
    Task<Event> AddAsync(Event @event);
    Task<Event> UpdateAsync(Event @event);
    Task DeleteAsync(Event @event);
}
