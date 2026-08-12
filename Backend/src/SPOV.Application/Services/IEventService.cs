using SPOV.Application.Common;
using SPOV.Application.DTOs.Events;
using SPOV.Domain.Common;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public interface IEventService
{
    Task<Result<PagedResponse<EventDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Result<EventDto?>> GetByIdAsync(int id);
    Task<Result<EventDto>> CreateAsync(CreateEventRequest request);
    Task<Result<EventDto>> UpdateAsync(int id, UpdateEventRequest request);
    Task<Result> DeleteAsync(int id);
}
